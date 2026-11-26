
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const mount = document.getElementById("three-arena");

if (mount) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101b2d);
  scene.fog = new THREE.Fog(0x101b2d, 24, 60);

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

  const blueGlow = new THREE.PointLight(0x168bff, 35, 12);
  blueGlow.position.set(-5, 3, -2);
  scene.add(blueGlow);

  const redGlow = new THREE.PointLight(0xff263f, 35, 12);
  redGlow.position.set(5, 3, -2);
  scene.add(redGlow);

  // MATERIALS
  const mat = (color, roughness = 0.82, flatShading = false) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      flatShading
    });

  const skinColors = [
    0xb87952, 0xc58b66, 0x9d6548,
    0xd09a72, 0xa96e4f, 0xc08360
  ];

  const skinMats = skinColors.map(c => mat(c));
  const white = mat(0xf4f0e6);
  const capMat = mat(0xffffff);
  const blue = mat(0x0878dc);
  const red = mat(0xc92842);
  const blueDark = mat(0x064b91);
  const redDark = mat(0x821b30);
  const pantsMat = mat(0x293448);
  const shoeMat = mat(0x171b24);
  const ropeMat = mat(0xb98245);
  const goldMat = mat(0xffd28a);
  const black = mat(0x241a17);
  const eyeWhite = mat(0xffffff);
  const eyeBlack = mat(0x171717);
  const mouthMat = mat(0x713e35);

  // FLOOR
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(13, 14, 0.55, 64),
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
    new THREE.BoxGeometry(0.06, 0.025, 8),
    mat(0xffd98c)
  );
  centerLine.position.y = -0.1;
  scene.add(centerLine);

  // STADIUM LIGHTS
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

  // SHADOW HELPER
  function addMesh(parent, geometry, material, position) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // TAPERED LIMB BETWEEN TWO POINTS
  function limb(parent, start, end, radius, material, endRadius = radius) {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(b, a);
    const length = direction.length();

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        endRadius,
        radius,
        length,
        12,
        1
      ),
      material
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

  // CHARACTER LIST
  const people = [];

  // CHARACTER BODY SHAPE
  function createTunic(parent, teamMaterial) {
    const profile = [
      new THREE.Vector2(0.31, 0.02),
      new THREE.Vector2(0.40, 0.12),
      new THREE.Vector2(0.43, 0.25),
      new THREE.Vector2(0.37, 0.48),
      new THREE.Vector2(0.34, 0.72),
      new THREE.Vector2(0.29, 0.91),
      new THREE.Vector2(0.22, 1.02),
      new THREE.Vector2(0.17, 1.06),
      new THREE.Vector2(0, 1.06)
    ];

    const geometry = new THREE.LatheGeometry(profile, 24);
    const tunic = addMesh(parent, geometry, white, [0, 0, 0]);

    // TEAM COLOUR WAIST BELT
    const belt = addMesh(
      parent,
      new THREE.CylinderGeometry(0.37, 0.39, 0.13, 24),
      teamMaterial,
      [0, 0.30, 0]
    );

    // SHOULDER COLOUR DETAIL
    const shoulder = addMesh(
      parent,
      new THREE.SphereGeometry(0.32, 16, 12),
      teamMaterial,
      [0, 0.86, 0]
    );
    shoulder.scale.set(1, 0.35, 1);

    // FRONT WHITE PANEL HIDES MOST OF SHOULDER DETAIL
    const panel = addMesh(
      parent,
      new THREE.BoxGeometry(0.06, 0.58, 0.34),
      white,
      [0.34, 0.55, 0]
    );

    // COLLAR
    const collar = addMesh(
      parent,
      new THREE.TorusGeometry(0.17, 0.025, 8, 24),
      teamMaterial,
      [0, 1.02, 0]
    );
    collar.rotation.x = Math.PI / 2;

    // BUTTONS
    for (const y of [0.77, 0.65, 0.53]) {
      addMesh(
        parent,
        new THREE.SphereGeometry(0.025, 8, 8),
        goldMat,
        [0.365, y, 0]
      );
    }

    return tunic;
  }

  // HEAD
  function createHead(parent, skin, variation) {
    const headRig = new THREE.Group();
    headRig.position.set(0, 1.04, 0);
    parent.add(headRig);

    const head = addMesh(
      headRig,
      new THREE.SphereGeometry(0.29, 24, 20),
      skin,
      [0, 0, 0]
    );

    head.scale.set(
      variation.headWidth,
      variation.headHeight,
      0.88
    );

    // EARS
    for (const side of [-1, 1]) {
      const ear = addMesh(
        headRig,
        new THREE.SphereGeometry(0.075, 12, 10),
        skin,
        [-0.01, -0.01, side * 0.255]
      );
      ear.scale.set(0.7, 1, 0.65);
    }

    // HAIR AT BACK OF HEAD
    const hair = addMesh(
      headRig,
      new THREE.SphereGeometry(0.27, 18, 14),
      black,
      [-0.07, 0.12, 0]
    );
    hair.scale.set(0.85, 0.72, 0.92);

    // EYES
    for (const side of [-1, 1]) {
      addMesh(
        headRig,
        new THREE.SphereGeometry(0.065, 12, 10),
        eyeWhite,
        [0.225, 0.035, side * 0.105]
      );

      addMesh(
        headRig,
        new THREE.SphereGeometry(0.032, 10, 8),
        eyeBlack,
        [0.278, 0.035, side * 0.105]
      );
    }

    // NOSE
    const nose = addMesh(
      headRig,
      new THREE.SphereGeometry(0.055, 12, 10),
      skin,
      [0.29, -0.045, 0]
    );
    nose.scale.set(1.1, 0.8, 0.85);

    // MOUTH
    const mouth = addMesh(
      headRig,
      new THREE.SphereGeometry(0.045, 12, 8),
      mouthMat,
      [0.263, -0.13, 0]
    );
    mouth.scale.set(0.4, 0.22, 1);

    // EYEBROWS
    for (const side of [-1, 1]) {
      const brow = addMesh(
        headRig,
        new THREE.BoxGeometry(0.035, 0.025, 0.09),
        black,
        [0.235, 0.12, side * 0.105]
      );
      brow.rotation.x = side * 0.08;
    }

    // WHITE KUFII CAP
    const cap = addMesh(
      headRig,
      new THREE.CylinderGeometry(0.22, 0.25, 0.16, 24),
      capMat,
      [0, 0.265, 0]
    );

    const capTop = addMesh(
      headRig,
      new THREE.SphereGeometry(0.22, 20, 12),
      capMat,
      [0, 0.34, 0]
    );
    capTop.scale.y = 0.25;

    // CAP EDGE
    const capBand = addMesh(
      headRig,
      new THREE.TorusGeometry(0.235, 0.018, 8, 24),
      mat(0xd9d9d9),
      [0, 0.20, 0]
    );
    capBand.rotation.x = Math.PI / 2;

    return headRig;
  }

  // ONE CHARACTER
  function createPlayer(team, index) {
    const isBlue = team === "A";
    const direction = isBlue ? 1 : -1;
    const group = new THREE.Group();

    const teamMaterial = isBlue ? blue : red;
    const darkTeam = isBlue ? blueDark : redDark;
    const skin = skinMats[team === "A" ? index : index + 3];

    // DIFFERENT BODY SHAPES
    const variations = [
      { height: 1.00, width: 1.00, headWidth: 0.90, headHeight: 1.05 },
      { height: 1.10, width: 1.12, headWidth: 1.00, headHeight: 1.00 },
      { height: 0.92, width: 0.91, headWidth: 0.88, headHeight: 1.12 }
    ];

    const variation = variations[index];

    const baseX = isBlue
      ? -3.0 - index * 0.95
      : 3.0 + index * 0.95;

    group.position.set(baseX, 0, (index - 1) * 1.25);
    group.scale.x = direction;
    group.scale.y = variation.height;
    group.scale.z = variation.width;
    scene.add(group);

    // BODY RIG
    const bodyRig = new THREE.Group();
    bodyRig.position.set(0, 0.85, 0);
    group.add(bodyRig);

    // TUNIC
    createTunic(bodyRig, teamMaterial);

    // SLEEVE DETAILS
    for (const side of [-1, 1]) {
      const sleeve = addMesh(
        bodyRig,
        new THREE.SphereGeometry(0.19, 14, 12),
        white,
        [0.04, 0.82, side * 0.32]
      );
      sleeve.scale.set(0.8, 0.7, 1);
    }

    // HEAD
    const headRig = createHead(bodyRig, skin, variation);

    // LEGS
    const legs = [];

    for (const side of [-1, 1]) {
      const legPivot = new THREE.Group();
      legPivot.position.set(-0.02, 0.13, side * 0.19);
      group.add(legPivot);

      // THIGH
      limb(
        legPivot,
        [0, 0.05, 0],
        [-0.05, -0.28, 0],
        0.14,
        pantsMat,
        0.115
      );

      // LOWER LEG
      limb(
        legPivot,
        [-0.05, -0.28, 0],
        [0.16, -0.55, 0],
        0.105,
        pantsMat,
        0.075
      );

      // SHOE
      const shoe = addMesh(
        legPivot,
        new THREE.SphereGeometry(0.16, 16, 12),
        shoeMat,
        [0.22, -0.58, 0]
      );
      shoe.scale.set(1.45, 0.48, 0.75);

      // SHOE SOLE
      addMesh(
        legPivot,
        new THREE.BoxGeometry(0.35, 0.045, 0.17),
        black,
        [0.22, -0.65, 0]
      );

      legs.push(legPivot);
    }

    // ARMS
    const arms = [];

    for (const side of [-1, 1]) {
      const armPivot = new THREE.Group();
      armPivot.position.set(0.02, 0.65, side * 0.32);
      bodyRig.add(armPivot);

      // UPPER ARM
      limb(
        armPivot,
        [0, 0, 0],
        [0.32, -0.13, side * 0.015],
        0.115,
        skin,
        0.095
      );

      // ELBOW JOINT
      addMesh(
        armPivot,
        new THREE.SphereGeometry(0.105, 12, 10),
        skin,
        [0.32, -0.13, side * 0.015]
      );

      // FOREARM
      limb(
        armPivot,
        [0.32, -0.13, side * 0.015],
        [0.70, -0.18, side * 0.035],
        0.09,
        skin,
        0.075
      );

      // HAND
      const hand = addMesh(
        armPivot,
        new THREE.SphereGeometry(0.105, 14, 12),
        skin,
        [0.76, -0.18, side * 0.035]
      );
      hand.scale.set(1.1, 0.85, 0.9);

      // FINGERS
      for (let finger = 0; finger < 3; finger++) {
        const f = addMesh(
          armPivot,
          new THREE.SphereGeometry(0.025, 8, 8),
          skin,
          [
            0.81,
            -0.19 - finger * 0.035,
            side * (0.035 + finger * 0.025)
          ]
        );
        f.scale.set(1.5, 0.8, 0.8);
      }

      // TEAM COLOUR SLEEVE EDGE
      const cuff = addMesh(
        armPivot,
        new THREE.SphereGeometry(0.105, 12, 10),
        teamMaterial,
        [0.12, -0.045, side * 0.008]
      );
      cuff.scale.set(1.0, 0.45, 0.9);

      arms.push(armPivot);
    }

    // EXTRA TEAM BADGE
    const badge = addMesh(
      bodyRig,
      new THREE.SphereGeometry(0.10, 12, 10),
      darkTeam,
      [0.37, 0.78, 0.17]
    );
    badge.scale.set(0.35, 1, 1);

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
    ropeMat
  );
  rope.rotation.z = Math.PI / 2;
  rope.position.y = 1.35;
  rope.castShadow = true;
  ropeGroup.add(rope);

  // ROPE KNOT
  const knot = addMesh(
    ropeGroup,
    new THREE.SphereGeometry(0.2, 20, 16),
    goldMat,
    [0, 1.35, 0]
  );

  // CENTRE FLAG
  const flagPole = addMesh(
    ropeGroup,
    new THREE.CylinderGeometry(0.025, 0.025, 0.8),
    capMat,
    [0, 1.75, 0]
  );

  const flag = addMesh(
    ropeGroup,
    new THREE.BoxGeometry(0.42, 0.25, 0.04),
    mat(0xffd34f),
    [0.21, 1.95, 0]
  );

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

      // LEAN BACK
      const lean = isWinning ? 0.30 : 0.13;
      player.bodyRig.rotation.z =
        lean + Math.sin(phase) * 0.035 * effort;

      // HEAD
      player.headRig.rotation.z =
        -0.06 + Math.sin(phase * 0.6) * 0.025;

      // ARMS
      player.arms.forEach((arm, i) => {
        arm.rotation.z =
          -0.06 + Math.sin(phase + i * 0.5) * 0.07 * effort;
      });

      // LEGS
      player.legs.forEach((leg, i) => {
        leg.rotation.z =
          (i === 0 ? -1 : 1) *
          (0.08 + Math.sin(phase + i) * 0.035 * effort);
      });

      // BODY EFFORT
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
