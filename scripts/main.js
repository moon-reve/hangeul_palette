const hero = document.querySelector(".hero");
const turbulence = document.querySelector("#paper-turbulence");
const washCanvas = document.querySelector(".color-wash");
const washContext = washCanvas.getContext("2d");
const embossObject = document.querySelector(".emboss-object");
const cursorRing = document.querySelector(".cursor-ring");
const cursorDot = document.querySelector(".cursor-dot");
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const brush = { x: pointer.x, y: pointer.y };
const tail = { x: pointer.x, y: pointer.y };
const cursor = { x: pointer.x, y: pointer.y };
const userPointer = { x: pointer.x, y: pointer.y };
const autoSweep = {
  x: pointer.x,
  y: pointer.y,
  prevX: pointer.x,
  prevY: pointer.y,
  active: false,
  phase: Math.random() * Math.PI * 2,
  nextMarkAt: 0,
  nextShiftAt: 0,
  targetX: pointer.x,
  targetY: pointer.y,
  speed: 0.18,
  force: 0.62,
};
const washMarks = [];
const washPalette = [
  [238, 185, 164],
  [197, 205, 236],
  [168, 219, 205],
  [239, 221, 166],
  [208, 186, 226],
];
const embossViewBox = { width: 1920, height: 1080 };
const embossVisualScale = 1;
const embossCellSize = 120;
const embossGrid = new Map();
let embossPaths = [];
let lastEmbossTriggerAt = 0;
let lastX = pointer.x;
let lastY = pointer.y;
let speed = 0;
let animationFrame = null;
let washFrame = null;
let menuInkTimer = null;
let isInsideHero = false;
let lastInputAt = performance.now();
let nextHoldEmbossAt = 0;
let lastHoldPoint = { x: pointer.x, y: pointer.y };
let lastHoverMarkAt = 0;
let lastHoverMarkPoint = { x: pointer.x, y: pointer.y };
let lastCanvasMarkAt = 0;
let lastCanvasMarkPoint = { x: pointer.x, y: pointer.y };

const performanceTuning = {
  canvasMarkInterval: 12,
  canvasMarkDistance: 9,
  hoverMarkInterval: 30,
  hoverMarkDistance: 18,
  hoverPathLimit: 24,
  holdPathLimit: 30,
  autoPathLimit: 18,
  maxWashMarks: 64,
  maxInkMarks: 68,
};

const embossTierConfig = {
  weak: {
    restOpacity: 0.14,
    restFill: "#f0f0f0",
    activeFill: "#2b2825",
    motionScale: 0.2,
    scaleAmount: 0,
    restShadow: { offsetScale: 0, blurScale: 0, highlightAlpha: 0, shadeAlpha: 0 },
    activeShadow: { offsetScale: 0, blurScale: 0, highlightAlpha: 0, shadeAlpha: 0, holdHighlightAlpha: 0, holdShadeAlpha: 0 },
    holdOpacity: { base: 0.22, range: 0.2 },
    triggerOpacity: { base: 0.2, range: 0.3, capHover: 0.5, capAuto: 0.42 },
  },
  middle: {
    restOpacity: 0.1,
    restFill: "#f0f0f0",
    activeFill: "#f0f0f0",
    motionScale: 1,
    scaleAmount: 1,
    restShadow: { offsetScale: 0, blurScale: 0, highlightAlpha: 0, shadeAlpha: 0 },
    activeShadow: { offsetScale: 1, blurScale: 1, highlightAlpha: 0.92, shadeAlpha: 0.42, holdHighlightAlpha: 0.72, holdShadeAlpha: 0.34 },
    holdOpacity: { base: 0.38, range: 0.42 },
    triggerOpacity: { base: 0.34, range: 0.74, capHover: 0.94, capAuto: 0.82 },
  },
  strong: {
    restOpacity: 0.1,
    restFill: "#f0f0f0",
    activeFill: "#f0f0f0",
    motionScale: 1.35,
    scaleAmount: 1.3,
    restShadow: { offsetScale: 0, blurScale: 0, highlightAlpha: 0, shadeAlpha: 0 },
    activeShadow: { offsetScale: 1.3, blurScale: 0.35, highlightAlpha: 0.97, shadeAlpha: 0.52, holdHighlightAlpha: 0.82, holdShadeAlpha: 0.42 },
    holdOpacity: { base: 0.42, range: 0.5 },
    triggerOpacity: { base: 0.38, range: 0.8, capHover: 0.98, capAuto: 0.9 },
  },
};

function getEmbossTier(path) {
  const groupId = path.closest("g[id]")?.getAttribute("id") || "";

  if (groupId.startsWith("weak")) return "weak";
  if (groupId.startsWith("strong")) return "strong";
  return "middle";
}

function buildEmbossFilter(polarity, shadow) {
  if (!shadow || (shadow.offsetScale <= 0 && shadow.blurScale <= 0) || (shadow.highlightAlpha <= 0 && shadow.shadeAlpha <= 0)) {
    return "drop-shadow(0 0 0 rgba(255, 255, 255, 0)) drop-shadow(0 0 0 rgba(132, 138, 136, 0))";
  }

  const highlightOffset = (1 * shadow.offsetScale).toFixed(2);
  const highlightBlur = (1 * shadow.blurScale).toFixed(2);
  const shadeOffsetX = (2 * shadow.offsetScale).toFixed(2);
  const shadeOffsetY = (3 * shadow.offsetScale).toFixed(2);
  const shadeBlur = (3 * shadow.blurScale).toFixed(2);
  const highlight =
    polarity > 0
      ? `-${highlightOffset}px -${highlightOffset}px ${highlightBlur}px`
      : `${highlightOffset}px ${highlightOffset}px ${highlightBlur}px`;
  const shade =
    polarity > 0
      ? `${shadeOffsetX}px ${shadeOffsetY}px ${shadeBlur}px`
      : `-${shadeOffsetX}px -${shadeOffsetY}px ${shadeBlur}px`;

  return `drop-shadow(${highlight} rgba(255, 255, 255, ${shadow.highlightAlpha})) drop-shadow(${shade} rgba(104, 110, 108, ${shadow.shadeAlpha}))`;
}

function resizeWashCanvas() {
  const rect = hero.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  washCanvas.width = Math.round(rect.width * dpr);
  washCanvas.height = Math.round(rect.height * dpr);
  washCanvas.style.width = `${rect.width}px`;
  washCanvas.style.height = `${rect.height}px`;
  washContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getEmbossKey(column, row) {
  return `${column}:${row}`;
}

function mapHeroToEmboss(x, y) {
  const rect = hero.getBoundingClientRect();
  const coverScale = Math.max(rect.width / embossViewBox.width, rect.height / embossViewBox.height);
  const renderedWidth = embossViewBox.width * coverScale * embossVisualScale;
  const renderedHeight = embossViewBox.height * coverScale * embossVisualScale;
  const offsetX = (rect.width - renderedWidth) / 2;
  const offsetY = (rect.height - renderedHeight) / 2;

  return {
    x: (x - offsetX) / (coverScale * embossVisualScale),
    y: (y - offsetY) / (coverScale * embossVisualScale),
  };
}

function setupEmbossField() {
  let svgDocument = null;

  try {
    svgDocument = embossObject.contentDocument;
  } catch {
    return;
  }

  const svg = svgDocument?.querySelector("svg");

  if (!svg || !window.gsap) {
    return;
  }

  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.style.width = "100%";
  svg.style.height = "100%";

  const style = svgDocument.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    path[data-emboss-path] {
      fill: #f0f0f0;
      opacity: 0.1;
      transform-box: fill-box;
      transform-origin: center;
      will-change: transform, opacity, filter;
    }
  `;
  svg.querySelector("defs")?.appendChild(style);

  embossGrid.clear();
  embossPaths = Array.from(svg.querySelectorAll("path"))
    .map((path, index) => {
      const box = path.getBBox();
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const column = Math.floor(centerX / embossCellSize);
      const row = Math.floor(centerY / embossCellSize);
      const key = getEmbossKey(column, row);
      const tier = getEmbossTier(path);
      const config = embossTierConfig[tier];
      const polarity = index % 5 === 0 ? -1 : 1;
      const item = {
        path,
        centerX,
        centerY,
        width: box.width,
        height: box.height,
        lastTriggerAt: 0,
        polarity,
        jitter: Math.random() * Math.PI * 2,
        tier,
        config,
        restFilter: buildEmbossFilter(polarity, config.restShadow),
      };

      path.dataset.embossPath = "";
      path.dataset.embossTier = tier;
      path.style.fill = config.restFill;
      path.style.opacity = String(config.restOpacity);
      path.style.filter = item.restFilter;

      if (!embossGrid.has(key)) {
        embossGrid.set(key, []);
      }

      embossGrid.get(key).push(item);
      return item;
    })
    .filter((item) => item.width > 0 && item.height > 0);

  embossObject.parentElement.classList.add("is-ready");
}

function getEmbossCandidates(x, y, radius = 180, limit = 42) {
  const point = mapHeroToEmboss(x, y);
  const column = Math.floor(point.x / embossCellSize);
  const row = Math.floor(point.y / embossCellSize);
  const candidates = [];

  for (let yOffset = -2; yOffset <= 2; yOffset += 1) {
    for (let xOffset = -2; xOffset <= 2; xOffset += 1) {
      const cell = embossGrid.get(getEmbossKey(column + xOffset, row + yOffset));

      if (cell) {
        candidates.push(...cell);
      }
    }
  }

  return candidates
    .map((item) => ({
      item,
      distance: Math.hypot(point.x - item.centerX, point.y - item.centerY),
    }))
    .filter(({ distance }) => distance < radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

function holdEmboss(x, y) {
  if (!window.gsap || !embossPaths.length) {
    return;
  }

  const now = performance.now();

  getEmbossCandidates(x, y, 210, performanceTuning.holdPathLimit).forEach(({ item, distance }) => {
    const { config } = item;
    const intensity = Math.max(0, 1 - distance / 210);
    const motion = config.motionScale;
    const lift = (1.2 + intensity * 4.8) * item.polarity * motion;
    const wave = Math.sin(now * 0.004 + item.jitter) * (0.8 + intensity * 1.6) * motion;
    const filter = buildEmbossFilter(item.polarity, {
      offsetScale: config.activeShadow.offsetScale,
      blurScale: config.activeShadow.blurScale,
      highlightAlpha: config.activeShadow.holdHighlightAlpha,
      shadeAlpha: config.activeShadow.holdShadeAlpha,
    });
    const tween = {
      x: Math.cos(item.jitter) * wave,
      y: -lift + wave * 0.35,
      scale: 1 + intensity * 0.01 * config.scaleAmount,
      opacity: config.holdOpacity.base + intensity * config.holdOpacity.range,
      filter,
      duration: 0.72,
      ease: "sine.inOut",
      overwrite: "auto",
    };

    if (config.activeFill !== config.restFill) {
      tween.fill = config.activeFill;
    }

    gsap.to(item.path, tween);
  });
}

function triggerEmboss(x, y, force = 1, mode = "hover") {
  if (!window.gsap || !embossPaths.length) {
    return;
  }

  if (mode === "hold") {
    holdEmboss(x, y);
    return;
  }

  const now = performance.now();

  if (mode !== "auto" && now - lastEmbossTriggerAt < 34) {
    return;
  }

  lastEmbossTriggerAt = now;

  const radius = mode === "auto" ? 235 : 180;
  const limit = mode === "auto" ? performanceTuning.autoPathLimit : performanceTuning.hoverPathLimit;

  getEmbossCandidates(x, y, radius, limit).forEach(({ item, distance }) => {
    const { config } = item;
    const isAuto = mode === "auto";
    const intensity = Math.max(0, 1 - distance / radius) * force;

    if (intensity < 0.12 || now - item.lastTriggerAt < (isAuto ? 96 : 230)) {
      return;
    }

    item.lastTriggerAt = now;
    const motion = config.motionScale;
    const lift = (1.4 + intensity * 5.6) * item.polarity * motion;
    const drift = Math.sin(now * 0.002 + item.jitter) * 0.7 * motion;
    const spread = 1 + intensity * 0.018 * config.scaleAmount;
    const cap = isAuto ? config.triggerOpacity.capAuto : config.triggerOpacity.capHover;
    const opacity = Math.min(cap, config.triggerOpacity.base + intensity * config.triggerOpacity.range);
    const activeFilter = buildEmbossFilter(item.polarity, {
      offsetScale: config.activeShadow.offsetScale,
      blurScale: config.activeShadow.blurScale,
      highlightAlpha: config.activeShadow.highlightAlpha,
      shadeAlpha: config.activeShadow.shadeAlpha,
    });
    const revealEase = "power2.out";
    const settleEase = "sine.out";
    const settleDuration = 2.2 + Math.random() * 0.85;
    const recolor = config.activeFill !== config.restFill;

    gsap.killTweensOf(item.path);
    gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .to(
        item.path,
        {
          x: Math.cos(item.jitter) * intensity * 1.2 * motion + drift,
          y: -lift,
          scale: spread,
          opacity,
          filter: activeFilter,
          ...(recolor ? { fill: config.activeFill } : {}),
          duration: 0.22,
          ease: revealEase,
        },
        0,
      )
      .to(
        item.path,
        {
          x: drift * -0.5,
          y: -lift * 0.28,
          opacity: opacity * 0.38,
          duration: 0.42,
          ease: "sine.inOut",
        },
        0.22,
      )
      .to(
        item.path,
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: config.restOpacity,
          filter: item.restFilter,
          ...(recolor ? { fill: config.restFill } : {}),
          duration: settleDuration,
          ease: settleEase,
        },
        0.42,
      );
  });
}

function addCanvasWashMark(x, y, force = 1, mode = "hover") {
  const color = washPalette[Math.floor(Math.random() * washPalette.length)];
  const isHold = mode === "hold";
  const isLead = mode === "lead";
  const isAuto = mode === "auto";

  washMarks.push({
    x: x + (Math.random() - 0.5) * (isHold ? 18 : isLead ? 12 : isAuto ? 10 : 30),
    y: y + (Math.random() - 0.5) * (isHold ? 18 : isLead ? 12 : isAuto ? 10 : 30),
    radius:
      (isLead ? 28 : isAuto ? 72 : 42) +
      Math.random() * (isLead ? 42 : isAuto ? 118 : 74) +
      force * (isLead ? 18 : isAuto ? 36 : 28),
    grow: (isLead ? 0.12 : isAuto ? 0.16 : 0.2) + Math.random() * (isLead ? 0.28 : isAuto ? 0.28 : 0.46),
    life: 1,
    wobble: Math.random() * Math.PI * 2,
    color,
    alpha: isHold ? 0.04 : isLead ? 0.055 : isAuto ? 0.045 : 0.075,
    type: "wash",
    mode,
  });

  if (washMarks.length > performanceTuning.maxWashMarks) {
    washMarks.shift();
  }

  if (!washFrame) {
    washFrame = requestAnimationFrame(renderWash);
  }
}

function addWashMark(x, y, force = 1, mode = "hover") {
  addCanvasWashMark(x, y, force, mode);
  triggerEmboss(x, y, force, mode);
}

function addWashStroke(fromX, fromY, toX, toY, force = 0.7, mode = "auto") {
  const distance = Math.hypot(toX - fromX, toY - fromY);
  const steps = Math.max(3, Math.min(mode === "auto" ? 12 : 7, Math.ceil(distance / (mode === "auto" ? 48 : 86))));

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    const ease = progress * progress * (3 - 2 * progress);
    const wave = Math.sin((progress + performance.now() * 0.00018) * Math.PI * 2) * (mode === "auto" ? 8 : 18);
    const x = fromX + (toX - fromX) * ease;
    const y = fromY + (toY - fromY) * ease + wave;

    addWashMark(x, y, force * (0.82 + progress * 0.18), mode);
  }
}

function addInkBloom(clientX, clientY) {
  const rect = hero.getBoundingClientRect();
  const originX = clientX - rect.left;
  const originY = clientY - rect.top;

  for (let index = 0; index < 16; index += 1) {
    const angle = -Math.PI * 0.78 + Math.random() * Math.PI * 0.72;
    const distance = 18 + Math.random() * 220 + index * 4;
    const x = originX + Math.cos(angle) * distance + (Math.random() - 0.5) * 70;
    const y = originY + Math.sin(angle) * distance + (Math.random() - 0.5) * 92;

    washMarks.push({
      x,
      y,
      radius: 64 + Math.random() * 150 + index * 5,
      grow: 0.65 + Math.random() * 1.45,
      life: 1,
      wobble: Math.random() * Math.PI * 2,
      color: [18 + Math.random() * 28, 20 + Math.random() * 26, 22 + Math.random() * 24],
      alpha: 0.16 + Math.random() * 0.2,
      type: "ink",
    });
  }

  if (washMarks.length > performanceTuning.maxInkMarks) {
    washMarks.splice(0, washMarks.length - performanceTuning.maxInkMarks);
  }

  if (!washFrame) {
    washFrame = requestAnimationFrame(renderWash);
  }
}

function renderWash() {
  washContext.clearRect(0, 0, washCanvas.width, washCanvas.height);

  for (let index = washMarks.length - 1; index >= 0; index -= 1) {
    const mark = washMarks[index];
    const isInk = mark.type === "ink";
    const isAuto = mark.mode === "auto";
    mark.life -= isInk ? 0.006 : isAuto ? 0.0054 : 0.0088;
    mark.radius += mark.grow;
    mark.wobble += (isInk ? 0.028 : 0.014) + (1 - mark.life) * 0.006;
    mark.x += Math.sin(mark.wobble) * (isInk ? 0.42 : 0.12);
    mark.y += Math.cos(mark.wobble * 0.8) * (isInk ? 0.34 : 0.1);

    if (mark.life <= 0) {
      washMarks.splice(index, 1);
      continue;
    }

    const [red, green, blue] = mark.color;
    const alpha = Math.pow(mark.life, isInk ? 1.55 : 2) * mark.alpha;
    const gradient = washContext.createRadialGradient(
      mark.x,
      mark.y,
      0,
      mark.x,
      mark.y,
      mark.radius,
    );

    gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
    gradient.addColorStop(isInk ? 0.32 : 0.54, `rgba(${red}, ${green}, ${blue}, ${alpha * (isInk ? 0.72 : 0.42)})`);
    if (isInk) {
      gradient.addColorStop(0.68, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.26})`);
    }
    gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

    washContext.fillStyle = gradient;
    washContext.beginPath();
    washContext.arc(mark.x, mark.y, mark.radius, 0, Math.PI * 2);
    washContext.fill();
  }

  if (washMarks.length) {
    washFrame = requestAnimationFrame(renderWash);
  } else {
    washFrame = null;
  }
}

resizeWashCanvas();
window.addEventListener("resize", resizeWashCanvas);
embossObject.addEventListener("load", setupEmbossField);
requestAnimationFrame(setupEmbossField);

function setPointer(clientX, clientY) {
  const rect = hero.getBoundingClientRect();
  userPointer.x = clientX - rect.left;
  userPointer.y = clientY - rect.top;
  pointer.x = userPointer.x;
  pointer.y = userPointer.y;
  lastHoldPoint.x = pointer.x;
  lastHoldPoint.y = pointer.y;
  lastInputAt = performance.now();
}

function setCursor(clientX, clientY) {
  cursor.targetX = clientX;
  cursor.targetY = clientY;
}

function retargetAutoSweep(now, rect) {
  const drift = Math.random() > 0.58;
  const pause = !drift && Math.random() > 0.68;
  const marginX = rect.width * 0.08;
  const marginY = rect.height * 0.18;
  const previousTargetX = autoSweep.targetX;
  const previousTargetY = autoSweep.targetY;

  autoSweep.targetX = marginX + Math.random() * Math.max(1, rect.width - marginX * 2);
  autoSweep.targetY = marginY + Math.random() * Math.max(1, rect.height - marginY * 2);

  if (Math.hypot(autoSweep.targetX - previousTargetX, autoSweep.targetY - previousTargetY) < rect.width * 0.24) {
    autoSweep.targetX = rect.width - autoSweep.targetX;
  }

  autoSweep.speed = pause ? 0.024 + Math.random() * 0.026 : drift ? 0.072 + Math.random() * 0.052 : 0.048 + Math.random() * 0.04;
  autoSweep.force = pause ? 0.44 + Math.random() * 0.06 : drift ? 0.6 + Math.random() * 0.08 : 0.54 + Math.random() * 0.07;
  autoSweep.nextShiftAt = now + (pause ? 1500 + Math.random() * 1400 : drift ? 1250 + Math.random() * 1300 : 1100 + Math.random() * 1200);
}

function updateAmbientMotion(now) {
  const rect = hero.getBoundingClientRect();
  const idleFor = now - lastInputAt;

  if (idleFor > 1000 && !autoSweep.active) {
    autoSweep.active = true;
    autoSweep.prevX = autoSweep.x;
    autoSweep.prevY = autoSweep.y;
    autoSweep.nextMarkAt = now;
    autoSweep.nextShiftAt = now;
  }

  if (autoSweep.active && now > autoSweep.nextShiftAt) {
    retargetAutoSweep(now, rect);
  }

  const driftX = Math.sin(now * 0.0011 + autoSweep.phase) * rect.width * 0.018;
  const driftY = Math.cos(now * 0.0014 + autoSweep.phase * 1.4) * rect.height * 0.012;
  const nextAutoX = autoSweep.targetX + driftX;
  const nextAutoY = autoSweep.targetY + driftY;

  autoSweep.prevX += (autoSweep.x - autoSweep.prevX) * 0.62;
  autoSweep.prevY += (autoSweep.y - autoSweep.prevY) * 0.62;
  autoSweep.x += (nextAutoX - autoSweep.x) * autoSweep.speed;
  autoSweep.y += (nextAutoY - autoSweep.y) * autoSweep.speed;

  if (autoSweep.active) {
    hero.classList.add("is-revealing");
    const autoBlend = Math.min(1, Math.max(0, (idleFor - 1000) / 2600));
    const autoWeight = 0.26 + autoBlend * autoBlend * (3 - 2 * autoBlend) * 0.68;
    pointer.x = userPointer.x * (1 - autoWeight) + autoSweep.x * autoWeight;
    pointer.y = userPointer.y * (1 - autoWeight) + autoSweep.y * autoWeight;

    if (now > autoSweep.nextMarkAt) {
      addWashStroke(autoSweep.prevX, autoSweep.prevY, autoSweep.x, autoSweep.y, autoSweep.force, "auto");
      autoSweep.nextMarkAt = now + (34 + Math.random() * 34);
    }
  }

  const freqX = 0.0056 + Math.sin(now * 0.00011) * 0.0014 + Math.sin(now * 0.000037) * 0.0008;
  const freqY = 0.0105 + Math.cos(now * 0.00009) * 0.002 + Math.sin(now * 0.000051) * 0.0009;
  turbulence.setAttribute("baseFrequency", `${freqX.toFixed(5)} ${freqY.toFixed(5)}`);
}

function renderMotion() {
  const now = performance.now();
  updateAmbientMotion(now);

  cursor.x = cursor.targetX || cursor.x;
  cursor.y = cursor.targetY || cursor.y;

  cursorRing.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%)`;
  cursorDot.style.transform = `translate3d(${cursor.targetX || cursor.x}px, ${
    cursor.targetY || cursor.y
  }px, 0) translate(-50%, -50%)`;

  const dx = pointer.x - brush.x;
  const dy = pointer.y - brush.y;

  brush.x += dx * 0.74;
  brush.y += dy * 0.74;
  tail.x += (brush.x - tail.x) * 0.32;
  tail.y += (brush.y - tail.y) * 0.32;

  const moved = Math.hypot(brush.x - lastX, brush.y - lastY);
  speed += (moved - speed) * 0.18;
  lastX = brush.x;
  lastY = brush.y;

  const bristleX = brush.x + Math.sin(brush.y * 0.018) * 36;
  const bristleY = brush.y + Math.cos(brush.x * 0.014) * 24;
  const size = Math.max(190, Math.min(360, 230 + speed * 9));

  hero.style.setProperty("--reveal-x", `${brush.x}px`);
  hero.style.setProperty("--reveal-y", `${brush.y}px`);
  hero.style.setProperty("--reveal-tail-x", `${tail.x}px`);
  hero.style.setProperty("--reveal-tail-y", `${tail.y}px`);
  hero.style.setProperty("--reveal-bristle-x", `${bristleX}px`);
  hero.style.setProperty("--reveal-bristle-y", `${bristleY}px`);
  hero.style.setProperty("--reveal-size", `${size}px`);

  if (now - lastInputAt > 160 && now > nextHoldEmbossAt) {
    addWashMark(lastHoldPoint.x, lastHoldPoint.y, 0.58, "hold");
    nextHoldEmbossAt = now + 230 + Math.random() * 160;
  }

  animationFrame = requestAnimationFrame(renderMotion);
}

function startBrush(event) {
  isInsideHero = true;
  document.body.classList.add("cursor-active");
  hero.classList.add("is-revealing");
  setPointer(event.clientX, event.clientY);
  setCursor(event.clientX, event.clientY);
  addWashMark(pointer.x, pointer.y, 1, "hover");

  if (!animationFrame) {
    brush.x = pointer.x;
    brush.y = pointer.y;
    tail.x = pointer.x;
    tail.y = pointer.y;
    lastX = pointer.x;
    lastY = pointer.y;
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    cursor.targetX = event.clientX;
    cursor.targetY = event.clientY;
    animationFrame = requestAnimationFrame(renderMotion);
  }
}

function stopBrush() {
  isInsideHero = false;
  if (!autoSweep.active) {
    hero.classList.remove("is-revealing");
  }
  document.body.classList.remove("cursor-active", "cursor-hover");
}

hero.addEventListener("pointerenter", (event) => {
  startBrush(event);
});

hero.addEventListener("pointermove", (event) => {
  const now = performance.now();
  hero.classList.add("is-revealing");
  setPointer(event.clientX, event.clientY);
  setCursor(event.clientX, event.clientY);

  const movedSinceCanvasMark = Math.hypot(pointer.x - lastCanvasMarkPoint.x, pointer.y - lastCanvasMarkPoint.y);
  const movedSinceMark = Math.hypot(pointer.x - lastHoverMarkPoint.x, pointer.y - lastHoverMarkPoint.y);
  const hoverForce = Math.max(0.28, Math.min(speed, 12) / 12);

  if (now - lastCanvasMarkAt > performanceTuning.canvasMarkInterval || movedSinceCanvasMark > performanceTuning.canvasMarkDistance) {
    addCanvasWashMark(pointer.x, pointer.y, hoverForce, "lead");
    lastCanvasMarkAt = now;
    lastCanvasMarkPoint.x = pointer.x;
    lastCanvasMarkPoint.y = pointer.y;
  }

  if (now - lastHoverMarkAt > performanceTuning.hoverMarkInterval || movedSinceMark > performanceTuning.hoverMarkDistance) {
    addWashMark(pointer.x, pointer.y, hoverForce, "hover");
    lastHoverMarkAt = now;
    lastHoverMarkPoint.x = pointer.x;
    lastHoverMarkPoint.y = pointer.y;
  }

  if (!animationFrame) {
    startBrush(event);
  }
});

hero.addEventListener("pointerdown", (event) => {
  startBrush(event);
});

hero.addEventListener("pointerleave", () => {
  stopBrush();
});

hero.addEventListener("pointerup", () => {
  stopBrush();
});

const menuTrigger = document.querySelector(".label-top");

if (menuTrigger) {
  menuTrigger.addEventListener("pointerenter", (event) => {
    menuTrigger.classList.add("is-inked");
    addInkBloom(event.clientX, event.clientY);
    clearInterval(menuInkTimer);
    menuInkTimer = setInterval(() => {
      const rect = menuTrigger.getBoundingClientRect();
      addInkBloom(rect.left + rect.width * 0.6, rect.top + rect.height * 0.45);
    }, 420);
  });

  menuTrigger.addEventListener("pointerleave", () => {
    menuTrigger.classList.remove("is-inked");
    clearInterval(menuInkTimer);
    menuInkTimer = null;
  });
}

document.querySelectorAll(".hero-label, .hero-title").forEach((element) => {
  element.addEventListener("pointerenter", () => {
    document.body.classList.add("cursor-hover");
  });

  element.addEventListener("pointerleave", () => {
    document.body.classList.remove("cursor-hover");
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopBrush();
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  } else if (isInsideHero && !animationFrame) {
    animationFrame = requestAnimationFrame(renderMotion);
  } else if (!animationFrame) {
    animationFrame = requestAnimationFrame(renderMotion);
  }
});

const heartSection = document.querySelector(".section-heart");
const heartPhotoCarousel = document.querySelector(".heart-photo-carousel");
const heartPhotoPanels = Array.from(document.querySelectorAll(".heart-photo-panel"));
const heartTimeline = window.gsap
  ? gsap
      .timeline({ paused: true })
      .to(heartSection, { "--heart-copy-opacity": 0, duration: 0.16, ease: "none" }, 0.05)
      .to(heartSection, { "--heart-photo-opacity": 1, duration: 0.1, ease: "none" }, 0)
  : null;

function updateHeartSection() {
  if (!heartSection || !heartPhotoCarousel) {
    return;
  }

  const sectionStart = heartSection.offsetTop;
  const sectionEnd = sectionStart + heartSection.offsetHeight - window.innerHeight;
  const scrollRange = Math.max(1, sectionEnd - sectionStart);
  const currentScroll = window.scrollY || window.pageYOffset;
  const progress = Math.min(1, Math.max(0, (currentScroll - sectionStart) / scrollRange));
  const introEnd = 0.14;
  const photoProgress = Math.min(1, Math.max(0, (progress - introEnd) / (1 - introEnd)));
  const copyFade = 1 - Math.min(1, Math.max(0, (progress - 0.05) / 0.11));
  const activeIndex = Math.min(4, Math.max(0, Math.round(photoProgress * 4)));
  const firstPanel = heartPhotoPanels[0];
  const panelWidth = firstPanel?.getBoundingClientRect().width || 1;
  const gap = parseFloat(getComputedStyle(heartPhotoCarousel).columnGap) || 0;
  const panelStep = panelWidth + gap;
  const trackX = panelWidth / 2 + photoProgress * panelStep * 4;

  heartSection.classList.toggle("is-pinned", currentScroll >= sectionStart && currentScroll <= sectionEnd);
  heartSection.classList.toggle("is-ended", currentScroll > sectionEnd);

  if (heartTimeline) {
    heartTimeline.progress(progress);
  } else {
    heartSection.style.setProperty("--heart-copy-opacity", copyFade.toFixed(3));
    heartSection.style.setProperty("--heart-photo-opacity", "1");
  }

  heartPhotoCarousel.style.setProperty("--heart-track-offset", `${-trackX}px`);

  heartPhotoPanels.forEach((panel, index) => {
    const panelCenter = window.innerWidth / 2 + index * panelStep + panelWidth / 2 - trackX;
    const distanceFromCenter = (panelCenter - window.innerWidth / 2) / window.innerWidth;
    const parallax = Math.max(-1, Math.min(1, distanceFromCenter * 2.6)) * 54;

    panel.style.setProperty("--panel-parallax", `${parallax.toFixed(2)}px`);
    panel.style.setProperty("--panel-parallax-inner", `${(parallax * -0.45).toFixed(2)}px`);
    panel.classList.toggle("is-active", index === activeIndex);
  });
}

updateHeartSection();
window.addEventListener("scroll", updateHeartSection, { passive: true });
window.addEventListener("resize", updateHeartSection);

animationFrame = requestAnimationFrame(renderMotion);