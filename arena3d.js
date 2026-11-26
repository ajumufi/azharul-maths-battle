
const mount = document.getElementById("three-arena");

if (mount) {
  mount.innerHTML = "";

  Object.assign(mount.style, {
    position: "relative",
    overflow: "hidden"
  });

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  mount.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, dpr = 1;
  let targetPosition = 50;
  let currentPosition = 50;
  let lastTime = 0;

  const boys = [
    { team: "A", index: 0, skin: "#a96e4f", height: 1.00, width: 1.00, cap: "#fff" },
    { team: "A", index: 1, skin: "#c58b66", height: 1.08, width: 1.12, cap: "#fff" },
    { team: "A", index: 2, skin: "#d09a72", height: 0.92, width: 0.92, cap: "#fff" },
    { team: "B", index: 0, skin: "#b87952", height: 1.04, width: 1.05, cap: "#fff" },
    { team: "B", index: 1, skin: "#9d6548", height: 0.94, width: 1.10, cap: "#fff" },
    { team: "B", index: 2, skin: "#c08360", height: 1.10, width: 0.94, cap: "#fff" }
  ];

  function resize() {
    const rect = mount.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    W = rect.width;
    H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  new ResizeObserver(resize).observe(mount);
  resize();

  window.addEventListener("tug-update", (event) => {
    targetPosition = Math.max(
      5,
      Math.min(95, Number(event.detail?.position ?? 50))
    );
  });

  function roundedRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  function line(x1, y1, x2, y2, color, width = 7) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#d9efff");
    sky.addColorStop(0.65, "#f3f5e9");
    sky.addColorStop(1, "#c8d8b4");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Background decorations
    ctx.fillStyle = "#b6d5b0";
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.75, W * 0.65, H * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arena floor
    roundedRect(W * 0.04, H * 0.69, W * 0.92, H * 0.24, 25, "#d9c59b");

    // Ground stripes
    ctx.strokeStyle = "rgba(115,85,48,.18)";
    ctx.lineWidth = 2;

    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(W * 0.06, H * (0.72 + i * 0.025));
      ctx.lineTo(W * 0.94, H * (0.72 + i * 0.025));
      ctx.stroke();
    }

    // Center marking
    ctx.setLineDash([9, 8]);
    line(W * 0.5, H * 0.70, W * 0.5, H * 0.91, "#fff5d8", 3);
    ctx.setLineDash([]);

    // Sun
    ctx.fillStyle = "#ffd477";
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.12, Math.min(W, H) * 0.045, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    drawCloud(W * 0.16, H * 0.17);
    drawCloud(W * 0.82, H * 0.22);

    // Team labels
    drawTeamLabel(W * 0.20, H * 0.12, "TEAM A", "#0878dc");
    drawTeamLabel(W * 0.80, H * 0.12, "TEAM B", "#c92842");
  }

  function drawCloud(x, y) {
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 8, 22, 0, Math.PI * 2);
    ctx.arc(x + 42, y, 17, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTeamLabel(x, y, text, color) {
    roundedRect(x - 48, y - 17, 96, 34, 12, color);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function drawBoy(boy, x, groundY, scale, time, ropeY) {
    const blue = boy.team === "A";
    const team = blue ? "#0878dc" : "#c92842";
    const dark = blue ? "#064b91" : "#821b30";
    const dir = blue ? 1 : -1;

    const winning = blue
      ? targetPosition < 50
      : targetPosition > 50;

    const effort = winning ? 1 : 0.45;
    const phase = time * 5 + boy.index * 0.8;
    const movement = Math.sin(phase) * 2.2 * effort;

    ctx.save();
    ctx.translate(x, groundY + movement);
    ctx.scale(dir * scale * boy.width, scale * boy.height);

    // Ground shadow
    ctx.fillStyle = "rgba(57,47,31,.18)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    line(-9, -39, -20, -12, "#293448", 11);
    line(-20, -12, -30, -3, "#293448", 10);
    line(9, -39, 19, -13, "#293448", 11);
    line(19, -13, 29, -3, "#293448", 10);

    // Shoes
    roundedRect(-43, -7, 25, 10, 5, "#20232b");
    roundedRect(17, -7, 26, 10, 5, "#20232b");

    // Body / kurta
    ctx.fillStyle = "#fffaf0";
    ctx.strokeStyle = "#6d5c4b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-18, -105);
    ctx.quadraticCurveTo(0, -119, 19, -105);
    ctx.lineTo(24, -40);
    ctx.quadraticCurveTo(0, -32, -24, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Team colour shoulder detail
    ctx.fillStyle = team;
    ctx.beginPath();
    ctx.moveTo(-17, -103);
    ctx.quadraticCurveTo(0, -119, 18, -104);
    ctx.lineTo(15, -91);
    ctx.lineTo(-13, -91);
    ctx.closePath();
    ctx.fill();

    // Kurta buttons
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#c79b45";
      ctx.beginPath();
      ctx.arc(1, -91 + i * 10, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Collar
    line(-5, -107, 0, -99, "#b99b6b", 2);
    line(5, -107, 0, -99, "#b99b6b", 2);

    // Arms reaching towards rope
    const armY = ropeY - groundY;

    line(-9, -99, 9, -82, boy.skin, 10);
    line(9, -82, 31, armY + 5, boy.skin, 9);

    line(12, -98, 28, -80, boy.skin, 10);
    line(28, -80, 35, armY + 11, boy.skin, 9);

    // Sleeves
    line(-9, -99, 9, -82, team, 11);
    line(12, -98, 28, -80, team, 11);

    // Hands gripping rope
    ctx.fillStyle = boy.skin;
    ctx.beginPath();
    ctx.arc(34, armY + 4, 7, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = boy.skin;
    ctx.strokeStyle = "#59402f";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(-13, -127, 18, 21, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ears
    ctx.beginPath();
    ctx.arc(-30, -127, 5, 0, Math.PI * 2);
    ctx.fill();

    // Face details
    ctx.fillStyle = "#251c19";
    ctx.beginPath();
    ctx.arc(-8, -131, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-20, -131, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    line(-23, -137, -18, -139, "#33231c", 2);
    line(-10, -139, -5, -137, "#33231c", 2);

    // Smile / effort expression
    ctx.beginPath();
    ctx.arc(-13, -121, 5, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = "#743e36";
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // White kufi cap
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#b8b8b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-13, -148, 17, 6, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(4, -144);
    ctx.quadraticCurveTo(-13, -137, -30, -144);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cap detail
    line(-25, -145, -1, -145, "#d0d0d0", 1.5);

    // Team badge
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(14, -91, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawRope(time, ropeY) {
    const pull = (currentPosition - 50) / 50;
    const ropeShift = pull * W * 0.12;

    const startX = W * 0.13;
    const endX = W * 0.87;
    const centerX = W * 0.5 + ropeShift;

    // Rope shadow
    ctx.beginPath();
    ctx.moveTo(startX, ropeY + 5);
    ctx.quadraticCurveTo(W * 0.5, ropeY + 10, endX, ropeY + 5);
    ctx.strokeStyle = "rgba(60,40,20,.2)";
    ctx.lineWidth = 11;
    ctx.stroke();

    // Main rope
    ctx.beginPath();
    ctx.moveTo(startX, ropeY);
    ctx.quadraticCurveTo(
      W * 0.5,
      ropeY + Math.sin(time * 4) * 2,
      endX,
      ropeY
    );
    ctx.strokeStyle = "#a66a32";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Rope twists
    for (let i = 0; i < 34; i++) {
      const x = startX + (endX - startX) * i / 34;
      ctx.beginPath();
      ctx.moveTo(x, ropeY - 4);
      ctx.lineTo(x + 5, ropeY + 4);
      ctx.strokeStyle = "#d7a15e";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Center knot
    ctx.fillStyle = "#815027";
    ctx.beginPath();
    ctx.arc(centerX, ropeY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Yellow flag
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, ropeY - 8);
    ctx.lineTo(centerX, ropeY - 56);
    ctx.stroke();

    ctx.fillStyle = "#ffd34f";
    ctx.beginPath();
    ctx.moveTo(centerX, ropeY - 55);
    ctx.lineTo(centerX + 29, ropeY - 47);
    ctx.lineTo(centerX, ropeY - 38);
    ctx.closePath();
    ctx.fill();
  }

  function draw(time) {
    if (!W || !H) return;

    currentPosition += (targetPosition - currentPosition) * 0.055;

    ctx.clearRect(0, 0, W, H);
    drawBackground();

    const scale = Math.min(W / 900, H / 430) * 1.05;
    const groundY = H * 0.82;
    const ropeY = H * 0.53;

    // Team A boys
    const blueX = [W * 0.22, W * 0.32, W * 0.42];
    // Team B boys
    const redX = [W * 0.78, W * 0.68, W * 0.58];

    boys.forEach((boy) => {
      const x = boy.team === "A"
        ? blueX[boy.index]
        : redX[boy.index];

      drawBoy(boy, x, groundY, scale, time, ropeY);
    });

    drawRope(time, ropeY);

    // Small instruction
    ctx.fillStyle = "#45566a";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("AZHARUL HIDAYA • MATHS BATTLE", W / 2, H * 0.97);
  }

  function animate(timestamp) {
    const time = timestamp / 1000;
    draw(time);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
