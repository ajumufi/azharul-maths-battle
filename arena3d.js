
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const mount = document.getElementById("three-arena");

if (mount) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101b2d);
  scene.fog = new THREE.Fog(0x101b2d, 20, 48);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 7, 21);
  camera.lookAt(0, 1.4, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x293044, 2));

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-5, 12, 8);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  scene.add(light);

  const blueLight = new THREE.PointLight(0x168bff, 70, 20);
  blueLight.position.set(-7, 5, 2);
  scene.add(blueLight);

  const redLight = new THREE.PointLight(0xff263f, 70, 20);
  redLight.position.set(7, 5, 2);
  scene.add(redLight);

  const mat = (color, roughness = 0.65) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 13, 0.5, 64),
    mat(0x263d3a)
  );
  floor.position.y = -0.4;
  floor.receiveShadow = true;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(11, 0.12, 8, 100),
    mat(0xd6ad69)
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.1;
  scene.add(ring);

  const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.02, 8),
    mat(0xffd98c)
  );
  centerLine.position.y = -0.12;
  scene.add(centerLine);

  // Stadium lights
  for (const x of [-8, 8]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 7, 12),
      mat(0x64748b)
    );
    pole.position.set(x, 3, -5);
    scene.add(pole);

    const lamp = new THREE.PointLight(0xffffff, 35, 15);
    lamp.position.set(x, 6.5, -4);
    scene.add(lamp);
  }

  const people = [];

  function createPlayer(team, index) {
    const group = new THREE.Group();
    const blue = team === "A";

    const shirt = mat(blue ? 0x0878dc : 0xc92842);
    const skin = mat(0xb87952);
    const pants = mat(0x172236);
    const shoes = mat(0x111827);

    const baseX = blue
      ? -3.1 - index * 0.9
      : 3.1 + index * 0.9;

    group.position.set(baseX, 0, (index - 1) * 1.2);
    scene.add(group);

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.38, 0.7, 5, 12),
      shirt
    );
    body.position.y = 1.4;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 20, 16),
      skin
    );
    head.position.y = 2.25;
    head.castShadow = true;
    group.add(head);

    const legs = [];
    const arms = [];

    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.13, 0.48, 4, 8),
        pants
      );
      leg.position.set(side * 0.19, 0.55, 0);
      leg.castShadow = true;
      group.add(leg);
      legs.push(leg);

      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.12, 0.34),
        shoes
      );
      shoe.position.set(side * 0.19, 0.13, 0.12);
      group.add(shoe);

      // Arms reaching toward the rope
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 0.3, 1.75, 0.05);
      group.add(armPivot);

      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.12, 0.55, 4, 8),
        skin
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.x = blue ? 0.34 : -0.34;
      arm.castShadow = true;
      armPivot.add(arm);

      arms.push(armPivot);
    }

    people.push({
      group,
      legs,
      arms,
      team,
      index,
      baseX
    });
  }

  for (let i = 0; i < 3; i++) {
    createPlayer("A", i);
    createPlayer("B", i);
  }

  // Rope and center marker
  const ropeGroup = new THREE.Group();
  scene.add(ropeGroup);

  const ropeMaterial = mat(0xc99b61);

  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 16, 20),
    ropeMaterial
  );
  rope.rotation.z = Math.PI / 2;
  rope.position.y = 1.3;
  rope.castShadow = true;
  ropeGroup.add(rope);

  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 16),
    mat(0xffd28a)
  );
  knot.position.y = 1.3;
  ropeGroup.add(knot);

  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.8),
    mat(0xffffff)
  );
  flagPole.position.y = 1.75;
  ropeGroup.add(flagPole);

  const flag = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, 0.04),
    mat(0xffd34f)
  );
  flag.position.set(0.2, 1.95, 0);
  ropeGroup.add(flag);

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

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.04);
    const t = clock.elapsedTime;

    currentPosition +=
      (targetPosition - currentPosition) * delta * 2.5;

    const ropeMove = (currentPosition - 50) * 0.1;
    ropeGroup.position.x = ropeMove;

    people.forEach((player) => {
      const pulling =
        (player.team === "A" && targetPosition < 50) ||
        (player.team === "B" && targetPosition > 50);

      const side = player.team === "A" ? -1 : 1;
      const effort = pulling ? 1 : 0.35;

      player.group.rotation.z =
        side * (0.28 + Math.sin(t * 7 + player.index) * 0.035) * effort;

      player.group.position.x =
        player.baseX +
        (pulling ? Math.sin(t * 9 + player.index) * 0.035 : 0);

      player.legs.forEach((leg, i) => {
        leg.rotation.z =
          Math.sin(t * 5 + i + player.index) * 0.12 * effort;
      });

      player.arms.forEach((arm, i) => {
        arm.rotation.z =
          Math.sin(t * 8 + i + player.index) * 0.08 * effort;
      });
    });

    pullEffect = Math.max(0, pullEffect - delta * 2);

    renderer.render(scene, camera);
  }

  animate();
}
