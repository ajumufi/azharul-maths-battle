
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const mount = document.getElementById("three-arena");

if (mount) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101b2d);
  scene.fog = new THREE.Fog(0x101b2d, 22, 55);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 7.5, 22);
  camera.lookAt(0, 1.3, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  mount.appendChild(renderer.domElement);

  // LIGHTING
  scene.add(new THREE.HemisphereLight(0xffffff, 0x263044, 2.2));

  const mainLight = new THREE.DirectionalLight(0xffffff, 3);
  mainLight.position.set(-5, 12, 9);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  scene.add(mainLight);

  scene.add(new THREE.PointLight(0x168bff, 75, 20).translateX(-7));
  scene.add(new THREE.PointLight(0xff263f, 75, 20).translateX(7));

  const blueGlow = new THREE.PointLight(0x168bff, 35, 12);
  blueGlow.position.set(-5, 3, -2);
  scene.add(blueGlow);

  const redGlow = new THREE.PointLight(0xff263f, 35, 12);
  redGlow.position.set(5, 3, -2);
  scene.add(redGlow);

  const material = (color, roughness = 0.7, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const materials = {
    skin: [
      material(0xb87952),
      material(0xc58b66),
      material(0x9d6548)
    ],
    white: material(0xf1eee5),
    cap: material(0xfafafa),
    blue: material(0x0878dc),
    red: material(0xc92842),
    blueDark: material(0x064b91),
    redDark: material(0x821b30),
    pants: material(0x263348),
    shoes: material(0x151a24),
    rope: material(0xb98245),
    gold: material(0xffd28a),
    eye: material(0x171717)
  };

  // FLOOR
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(13, 14, 0.55, 64),
    material(0x263d3a)
  );
  floor.position.y = -0.4;
  floor.receiveShadow = true;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(11, 0.12, 8, 100),
    material(0xd6ad69)
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.1;
  scene.add(ring);

  const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.025, 8),
    material(0xffd98c)
  );
  centerLine.position.y = -0.1;
  scene.add(centerLine);

  // STADIUM LIGHT POLES
  for (const x of [-8, 8]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 7, 12),
      material(0x64748b)
    );
    pole.position.set(x, 3, -5);
    scene.add(pole);

    const lamp = new THREE.PointLight(0xffffff, 35, 15);
    lamp.position.set(x, 6.5, -4);
    scene.add(lamp);
  }

  // HELPER: CREATE LIMB BETWEEN TWO POINTS
  function createLimb(parent, start, end, radius, mat) {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(b, a);
    const length = direction.length();

    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, Math.max(0.05, length - radius * 2), 5, 10),
      mat
    );

    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  const people = [];

  function createPlayer(team, index) {
    const isBlue = team === "A";
    const direction = isBlue ? 1 : -1;
    const group = new THREE.Group();

    const skin = materials.skin[index];
    const shirt = isBlue ? materials.blue : materials.red;
    const trim = isBlue ? materials.blueDark : materials.redDark;

    const baseX = isBlue
      ? -3.0 - index * 0.95
      : 3.0 + index * 0.95;

    group.position.set(baseX, 0, (index - 1) * 1.25);
    group.scale.x = direction;
    scene.add(group);

    // BODY ANIMATION GROUP
    const bodyRig = new THREE.Group();
    bodyRig.position.set(0, 0.9, 0);
    group.add(bodyRig);

    // KURTA BODY
    const kurta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.48, 1.05, 16),
      materials.white
    );
    kurta.position.y = 0.48;
    kurta.castShadow = true;
    bodyRig.add(kurta);

    // TEAM COLOUR VEST / SHOULDER STRIP
    const vest = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.88, 0.65),
      shirt
    );
    vest.position.set(0.01, 0.49, 0);
    bodyRig.add(vest);

    // KURTA COLLAR
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.025, 8, 20),
      trim
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.99;
    bodyRig.add(collar);

    // HEAD
    const headRig = new THREE.Group();
    headRig.position.set(0, 1.28, 0);
    bodyRig.add(headRig);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 24, 20),
      skin
    );
    head.scale.set(0.88, 1.05, 0.9);
    head.castShadow = true;
    headRig.add(head);

    // EYES
    for (const z of [-0.105, 0.105]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 10, 8),
        materials.eye
      );
      eye.position.set(0.235, 0.035, z);
      headRig.add(eye);
    }

    // NOSE
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 8),
      skin
    );
    nose.position.set(0.285, -0.035, 0);
    headRig.add(nose);

    // MUSLIM CAP
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.25, 0.16, 24),
      materials.cap
    );
    cap.position.y = 0.27;
    cap.castShadow = true;
    headRig.add(cap);

    const capTop = new THREE.Mesh(
      new THREE.CircleGeometry(0.22, 24),
      materials.cap
    );
    capTop.rotation.x = -Math.PI / 2;
    capTop.position.y = 0.35;
    headRig.add(capTop);

    // LEGS
    const legs = [];

    for (const side of [-1, 1]) {
      const legPivot = new THREE.Group();
      legPivot.position.set(0, 0.15, side * 0.2);
      group.add(legPivot);

      createLimb(
        legPivot,
        [0, 0.35, 0],
        [0, -0.38, 0],
        0.105,
        materials.pants
      );

      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.13, 0.2),
        materials.shoes
      );
      shoe.position.set(0.12, -0.48, 0);
      shoe.castShadow = true;
      legPivot.add(shoe);

      legs.push(legPivot);
    }

    // ARMS: BOTH HANDS REACH TOWARDS ROPE
    const arms = [];

    for (const side of [-1, 1]) {
      const armPivot = new THREE.Group();
      armPivot.position.set(0, 0.88, side * 0.29);
      bodyRig.add(armPivot);

      const upperArm = createLimb(
        armPivot,
        [0, 0, 0],
        [0.43, -0.12, side * 0.02],
        0.105,
        skin
      );

      const forearm = createLimb(
        armPivot,
        [0.43, -0.12, side * 0.02],
        [0.82, -0.04, side * 0.04],
        0.085,
        skin
      );

      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 12, 10),
        skin
      );
      hand.position.set(0.85, -0.04, side * 0.04);
      armPivot.add(hand);

      arms.push(armPivot);
    }

    people.push({
      group,
      bodyRig,
      headRig,
      legs,
      arms,
      team,
      index,
      baseX,
      direction
    });
  }

  // SIX BOYS
  for (let i = 0; i < 3; i++) {
    createPlayer("A", i);
    createPlayer("B", i);
  }

  // ROPE
  const ropeGroup = new THREE.Group();
  scene.add(ropeGroup);

  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 16, 20),
    materials.rope
  );
  rope.rotation.z = Math.PI / 2;
  rope.position.y = 1.35;
  rope.castShadow = true;
  ropeGroup.add(rope);

  // ROPE CENTRE KNOT
  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 20, 16),
    materials.gold
  );
  knot.position.y = 1.35;
  ropeGroup.add(knot);

  // CENTRE FLAG
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.8),
    material(0xffffff)
  );
  flagPole.position.y = 1.75;
  ropeGroup.add(flagPole);

  const flag = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.25, 0.04),
    material(0xffd34f)
  );
  flag.position.set(0.21, 1.95, 0);
  ropeGroup.add(flag);

  // GAME POSITION
  let targetPosition = 50;
  let currentPosition = 50;
  let pullEffect = 0;

  window.addEventListener("tug-update", (event) => {
    targetPosition = Math.max(
      5,
      Math.min(95, Number(event.detail?.position ?? 50))
    );
    pullEffect = 1;
  });

  // RESIZE
  function resize() {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    if (!width || !height) return;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  new ResizeObserver(resize).observe(mount);
  resize();

  // ANIMATION
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.04);
    const time = clock.elapsedTime;

    currentPosition +=
      (targetPosition - currentPosition) * delta * 2.5;

    const ropeMove = (currentPosition - 50) * 0.1;
    ropeGroup.position.x = ropeMove;

    people.forEach((player) => {
      const isWinning =
        (player.team === "A" && targetPosition < 50) ||
        (player.team === "B" && targetPosition > 50);

      const effort = isWinning ? 1 : 0.45;
      const phase = time * 7 + player.index * 0.8;

      // LEAN BACK WHILE PULLING
      const lean = isWinning ? 0.32 : 0.13;
      player.bodyRig.rotation.z =
        lean + Math.sin(phase) * 0.035 * effort;

      // HEAD MOVEMENT
      player.headRig.rotation.z =
        -0.08 + Math.sin(phase * 0.6) * 0.035;

      // ARM PULLING MOVEMENT
      player.arms.forEach((arm, i) => {
        arm.rotation.z =
          -0.10 + Math.sin(phase + i * 0.5) * 0.10 * effort;
      });

      // LEGS BRACING AGAINST THE GROUND
      player.legs.forEach((leg, i) => {
        leg.rotation.z =
          (i === 0 ? -1 : 1) *
          (0.08 + Math.sin(phase + i) * 0.045 * effort);
      });

      // SMALL BODY MOVEMENT
      player.group.position.x =
        player.baseX +
        (isWinning ? Math.sin(phase) * 0.025 : 0);

      player.group.position.y =
        Math.abs(Math.sin(phase * 0.5)) * 0.025;
    });

    pullEffect = Math.max(0, pullEffect - delta * 2);

    renderer.render(scene, camera);
  }

  animate();
}
