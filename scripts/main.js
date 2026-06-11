const hero = document.querySelector(".hero");
const heroTitle = document.querySelector(".hero-title");
const vocalStage = document.querySelector(".vocal-stage");
const vocalSvg = document.querySelector(".vocal-svg");
const vocalLines = Array.from(document.querySelectorAll(".vocal-line"));
const vocalSoundPath = document.querySelector("#vocal-sound-path");
const vocalDot = document.querySelector(".vocal-dot");
const vocalHotspots = {
  throat: document.querySelector(".vocal-hotspot-throat"),
  tongue: document.querySelector(".vocal-hotspot-tongue"),
  lip: document.querySelector(".vocal-hotspot-lip"),
};
const vocalSymbols = {
  m: document.querySelector(".vocal-symbol-m"),
  n: document.querySelector(".vocal-symbol-n"),
  ng: document.querySelector(".vocal-symbol-ng"),
  dot: document.querySelector(".vocal-vowel-dot"),
  eu: document.querySelector(".vocal-vowel-eu"),
  i: document.querySelector(".vocal-vowel-i"),
  final: document.querySelector(".vocal-final"),
  more: document.querySelector(".vocal-more"),
};
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
  strokeStartX: pointer.x,
  strokeStartY: pointer.y,
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
let heroTitleState = "initial";
let heroTitleTransitionTimer = null;
let heroTitleWheelTimer = null;
let heroTitleWheelAmount = 0;
let isHeroTitleTransitioning = false;
let heroTitleInkProgress = 0;
let vocalSceneProgress = 0;
let vocalSceneTargetProgress = 0;
let vocalSceneFrame = null;
let vocalLineLengths = [];
let vocalSoundPathLength = 0;

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

const embossTierIntensity = {
  weak: 0.5,
  middle: 1,
  strong: 1.6,
};

function getEmbossTier(path) {
  const groupId = path.closest("g[id]")?.getAttribute("id") || "";

  if (groupId.startsWith("weak")) return "weak";
  if (groupId.startsWith("strong")) return "strong";
  return "middle";
}

const heroTitleCopy = {
  initial: [
    [
      { text: "한글의", strong: true },
      { text: " " },
      { text: "시작", strong: true },
      { text: "은" },
    ],
    [{ text: "글자가 아니었습니다." }],
  ],
  scrolled: [
    [{ text: "사람을 향한" }],
    [
      { text: "마음", strong: true },
      { text: "이었습니다." },
    ],
  ],
  dark: [
    [
      { text: "서로의 마음", strong: true },
      { text: "이 닿지 않던 시대" },
    ],
  ],
  king: [
    [
      { text: "왕은 " },
      { text: "백성의 말", strong: true },
      { text: "을 들을 수 없었고," },
    ],
    [
      { text: "백성은 " },
      { text: "자신의 마음", strong: true },
      { text: "을 전할 수 없었다." },
    ],
  ],
  sejong: [
    [{ text: "세종은 문자를 만든 것이 아니라" }],
    [
      { text: "사람과 " },
      { text: "사람을 잇는 방법", strong: true },
      { text: "을 만들고자 했다." },
    ],
  ],
};

const heroTitleOrder = ["initial", "scrolled", "dark", "king", "sejong", "vocal"];
const heroTitleInkStates = new Set(["dark", "king", "sejong"]);
const compactHeroTitleStates = new Set(["king", "sejong"]);
const heroTitleInkAdvance = {
  dark: 0.5,
  king: 0.58,
  sejong: 0.58,
};
const heroTitleNextThreshold = {
  dark: 0.5,
  king: 0.58,
  sejong: 0.58,
};

function createHeroTitleMarkup(lines) {
  let charIndex = 0;

  return lines
    .map((line) => {
      const lineMarkup = line
        .map((part) => {
          const chars = Array.from(part.text)
            .map((char) => {
              const delay = charIndex * 72;
              const exitDelay = charIndex * 26;
              charIndex += 1;
              const content = char === " " ? "&nbsp;" : char;

              return `<span class="title-char" style="--char-delay: ${delay}ms; --char-exit-delay: ${exitDelay}ms">${content}</span>`;
            })
            .join("");

          return part.strong ? `<span class="title-strong">${chars}</span>` : chars;
        })
        .join("");

      return `<span class="title-line">${lineMarkup}</span>`;
    })
    .join("");
}

function prepareExistingHeroTitleChars() {
  if (!heroTitle) {
    return;
  }

  heroTitle.querySelectorAll(".title-char").forEach((char, index) => {
    char.style.setProperty("--char-exit-delay", `${index * 26}ms`);
  });
}

function updateHeroTitleInkReveal(progress) {
  if (!heroTitle) {
    return;
  }

  heroTitleInkProgress = Math.min(1, Math.max(0, progress));
  const chars = Array.from(heroTitle.querySelectorAll(".title-char"));
  const maxIndex = Math.max(1, chars.length - 1);

  chars.forEach((char, index) => {
    const wave = index / maxIndex;
    const isCompactInkTitle = compactHeroTitleStates.has(heroTitleState);
    const waveDelay = isCompactInkTitle ? 0.08 : 0.14;
    const revealRange = isCompactInkTitle ? 0.22 : 0.26;
    const localProgress = Math.min(1, Math.max(0, (heroTitleInkProgress - wave * waveDelay) / revealRange));
    const eased = localProgress * localProgress * (3 - 2 * localProgress);

    char.style.setProperty("--char-ink", eased.toFixed(3));
    char.style.setProperty("--char-lift", `${((1 - eased) * 0.12).toFixed(3)}em`);
    char.style.setProperty("--char-scale", (0.982 + eased * 0.018).toFixed(3));
    char.style.setProperty("--char-blur", `${(12 - eased * 12).toFixed(2)}px`);
    char.style.setProperty("--char-contrast", (1 + eased * 0.42).toFixed(3));
    char.style.setProperty("--char-glow", `${(eased * 11).toFixed(2)}px`);
    char.style.setProperty("--char-haze", `${(30 - eased * 18).toFixed(2)}px`);
  });
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothProgress(value, start, end) {
  const progress = clamp01((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}

function setVocalSymbol(symbol, progress, start, end, fromX, fromY, toX = 0, toY = 0, scaleFrom = 0.9, scaleTo = 1) {
  if (!symbol) {
    return;
  }

  const eased = smoothProgress(progress, start, end);
  const x = fromX + (toX - fromX) * eased;
  const y = fromY + (toY - fromY) * eased;
  const scale = scaleFrom + (scaleTo - scaleFrom) * eased;

  symbol.style.setProperty("--symbol-opacity", eased.toFixed(3));
  symbol.style.setProperty("--symbol-x", `${x.toFixed(2)}vw`);
  symbol.style.setProperty("--symbol-y", `${y.toFixed(2)}vh`);
  symbol.style.setProperty("--symbol-scale", scale.toFixed(3));
  symbol.style.setProperty("--symbol-blur", `${(10 - eased * 10).toFixed(2)}px`);
}

function setVocalHotspot(hotspot, amount) {
  if (!hotspot) {
    return;
  }

  const eased = clamp01(amount);

  hotspot.style.opacity = (eased * 0.86).toFixed(3);
  hotspot.style.transform = `scale(${(0.8 + eased * 0.36).toFixed(3)})`;
}

function setupVocalScene() {
  vocalLineLengths = vocalLines.map((line) => {
    const length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
    return length;
  });

  if (vocalSoundPath) {
    vocalSoundPathLength = vocalSoundPath.getTotalLength();
  }

  resetVocalSceneProgress(0);
}

function updateVocalSceneProgress(progress) {
  if (!vocalStage) {
    return;
  }

  vocalSceneProgress = clamp01(progress);
  const intro = smoothProgress(vocalSceneProgress, 0.02, 0.16);
  const dotProgress = smoothProgress(vocalSceneProgress, 0.32, 0.62);
  const finalProgress = smoothProgress(vocalSceneProgress, 0.72, 0.92);
  const slideProgress = smoothProgress(vocalSceneProgress, 0.74, 1);

  vocalStage.style.setProperty("--vocal-stage-opacity", intro.toFixed(3));
  vocalStage.style.setProperty("--vocal-stage-blur", `${(18 - intro * 18).toFixed(2)}px`);
  vocalStage.style.setProperty("--vocal-stage-y", `${(18 - intro * 18).toFixed(2)}px`);

  if (vocalSvg) {
    vocalSvg.style.setProperty("--vocal-svg-x", `${(-21 * slideProgress).toFixed(2)}vw`);
    vocalSvg.style.setProperty("--vocal-svg-y", `${(-1.2 * slideProgress).toFixed(2)}vh`);
    vocalSvg.style.setProperty("--vocal-svg-scale", (1 - slideProgress * 0.04).toFixed(3));
  }

  vocalLines.forEach((line, index) => {
    const draw = smoothProgress(vocalSceneProgress, 0.14 + index * 0.055, 0.52 + index * 0.05);
    line.style.strokeDashoffset = vocalLineLengths[index] * (1 - draw);
    line.style.opacity = (0.2 + draw * 0.8).toFixed(3);
  });

  if (vocalDot && vocalSoundPath && vocalSoundPathLength) {
    const point = vocalSoundPath.getPointAtLength(vocalSoundPathLength * dotProgress);
    vocalDot.setAttribute("cx", point.x.toFixed(2));
    vocalDot.setAttribute("cy", point.y.toFixed(2));
    vocalDot.style.setProperty("--vocal-dot-opacity", smoothProgress(vocalSceneProgress, 0.28, 0.64).toFixed(3));

    if (vocalHotspots.lip) {
      vocalHotspots.lip.setAttribute("cx", point.x.toFixed(2));
      vocalHotspots.lip.setAttribute("cy", point.y.toFixed(2));
    }
  }

  setVocalHotspot(vocalHotspots.throat, smoothProgress(vocalSceneProgress, 0.38, 0.48) * (1 - smoothProgress(vocalSceneProgress, 0.56, 0.66)));
  setVocalHotspot(vocalHotspots.tongue, smoothProgress(vocalSceneProgress, 0.48, 0.58) * (1 - smoothProgress(vocalSceneProgress, 0.66, 0.74)));
  setVocalHotspot(vocalHotspots.lip, smoothProgress(vocalSceneProgress, 0.58, 0.68) * (1 - smoothProgress(vocalSceneProgress, 0.72, 0.82)));

  setVocalSymbol(vocalSymbols.ng, vocalSceneProgress, 0.38, 0.54, 6, 15, 6 + (-2 - 6) * finalProgress, 15 + (-1 - 15) * finalProgress);
  setVocalSymbol(vocalSymbols.n, vocalSceneProgress, 0.48, 0.64, -18, -3, -18 + (-1 + 18) * finalProgress, -3 + (-1 + 3) * finalProgress);
  setVocalSymbol(vocalSymbols.m, vocalSceneProgress, 0.58, 0.74, 16, -15, 16 + (0 - 16) * finalProgress, -15 + (-1 + 15) * finalProgress);
  setVocalSymbol(vocalSymbols.dot, vocalSceneProgress, 0.66, 0.82, -7, 12, -7 + (0 + 7) * finalProgress, 12 + (-3 - 12) * finalProgress, 0.78, 1);
  setVocalSymbol(vocalSymbols.eu, vocalSceneProgress, 0.69, 0.86, 0, 18, 0, 18 + (1 - 18) * finalProgress, 0.78, 1);
  setVocalSymbol(vocalSymbols.i, vocalSceneProgress, 0.72, 0.9, 9, 10, 9 + (1 - 9) * finalProgress, 10 + (-1 - 10) * finalProgress, 0.78, 1);

  [vocalSymbols.ng, vocalSymbols.n, vocalSymbols.m, vocalSymbols.dot, vocalSymbols.eu, vocalSymbols.i].forEach((symbol) => {
    if (!symbol) {
      return;
    }

    const currentOpacity = parseFloat(symbol.style.getPropertyValue("--symbol-opacity")) || 0;
    symbol.style.setProperty("--symbol-opacity", (currentOpacity * (1 - finalProgress)).toFixed(3));
    symbol.style.setProperty("--symbol-blur", `${(finalProgress * 12).toFixed(2)}px`);
  });

  if (vocalSymbols.final) {
    vocalSymbols.final.style.setProperty("--symbol-opacity", finalProgress.toFixed(3));
    vocalSymbols.final.style.setProperty("--symbol-x", `${(-0.5 + slideProgress * 14).toFixed(2)}vw`);
    vocalSymbols.final.style.setProperty("--symbol-y", `${(-2 + slideProgress * 0.5).toFixed(2)}vh`);
    vocalSymbols.final.style.setProperty("--symbol-scale", (0.88 + finalProgress * 0.12).toFixed(3));
    vocalSymbols.final.style.setProperty("--symbol-blur", `${(14 - finalProgress * 14).toFixed(2)}px`);
  }

  if (vocalSymbols.more) {
    vocalSymbols.more.style.setProperty("--symbol-opacity", (slideProgress * finalProgress).toFixed(3));
    vocalSymbols.more.style.setProperty("--symbol-x", `${(28 + slideProgress * 3).toFixed(2)}vw`);
    vocalSymbols.more.style.setProperty("--symbol-y", `${(-0.2 + slideProgress * 0.5).toFixed(2)}vh`);
    vocalSymbols.more.style.setProperty("--symbol-blur", `${(8 - slideProgress * 8).toFixed(2)}px`);
  }
}

function animateVocalSceneProgress() {
  const delta = vocalSceneTargetProgress - vocalSceneProgress;

  if (Math.abs(delta) < 0.001) {
    updateVocalSceneProgress(vocalSceneTargetProgress);
    vocalSceneFrame = null;
    return;
  }

  updateVocalSceneProgress(vocalSceneProgress + delta * 0.16);
  vocalSceneFrame = requestAnimationFrame(animateVocalSceneProgress);
}

function setVocalSceneTargetProgress(progress) {
  vocalSceneTargetProgress = clamp01(progress);

  if (!vocalSceneFrame) {
    vocalSceneFrame = requestAnimationFrame(animateVocalSceneProgress);
  }
}

function resetVocalSceneProgress(progress = 0) {
  vocalSceneTargetProgress = clamp01(progress);

  if (vocalSceneFrame) {
    cancelAnimationFrame(vocalSceneFrame);
    vocalSceneFrame = null;
  }

  updateVocalSceneProgress(vocalSceneTargetProgress);
}

function enterVocalScene() {
  if (!heroTitle || heroTitleState === "vocal") {
    return;
  }

  window.clearTimeout(heroTitleTransitionTimer);
  heroTitleState = "vocal";
  isHeroTitleTransitioning = true;
  hero.classList.add("is-dark-scene");
  heroTitle.classList.remove("is-char-ready", "is-title-visible", "is-title-exiting");
  heroTitle.classList.add("is-ink-fading");
  resetVocalSceneProgress(0);

  heroTitleTransitionTimer = window.setTimeout(() => {
    heroTitle.classList.remove("is-title-king");
    heroTitle.classList.remove("is-ink-reveal", "is-ink-fading");
    resetVocalSceneProgress(0);
    hero.classList.add("is-vocal-scene");

    isHeroTitleTransitioning = false;
  }, 760);
}

function setHeroTitleCopy(copyKey, animate = true, options = {}) {
  if (!heroTitle || heroTitleState === copyKey) {
    return;
  }

  window.clearTimeout(heroTitleTransitionTimer);
  hero.classList.remove("is-vocal-scene");
  resetVocalSceneProgress(0);
  const previousState = heroTitleState;
  const wasInkTitle = heroTitleInkStates.has(previousState);
  heroTitleState = copyKey;
  isHeroTitleTransitioning = true;

  if (!heroTitleInkStates.has(copyKey)) {
    hero.classList.remove("is-dark-scene");
    heroTitleInkProgress = 0;
  }

  heroTitle.classList.remove("is-char-ready", "is-title-visible");

  if (wasInkTitle) {
    heroTitle.classList.add("is-ink-fading");
  } else {
    heroTitle.classList.remove("is-ink-reveal", "is-ink-fading");
    heroTitle.classList.add("is-title-exiting");
  }

  heroTitleTransitionTimer = window.setTimeout(() => {
    heroTitle.innerHTML = createHeroTitleMarkup(heroTitleCopy[copyKey]);
    heroTitle.classList.toggle("is-title-king", compactHeroTitleStates.has(copyKey));

    if (heroTitleInkStates.has(copyKey)) {
      hero.classList.add("is-dark-scene");
      heroTitle.classList.remove("is-title-exiting", "is-title-visible", "is-char-ready", "is-ink-fading");
      heroTitle.classList.add("is-ink-reveal");
      heroTitleInkProgress = 0;
      updateHeroTitleInkReveal(options.inkProgress ?? 0.08);
      isHeroTitleTransitioning = false;
      return;
    }

    heroTitle.classList.remove("is-title-exiting", "is-title-visible", "is-ink-reveal", "is-ink-fading");

    if (animate) {
      heroTitle.classList.add("is-char-ready");
    } else {
      heroTitle.classList.add("is-title-visible");
    }

    isHeroTitleTransitioning = false;
  }, 1140);
}

function moveHeroTitleStep(direction) {
  if (isHeroTitleTransitioning) {
    return;
  }

  if (heroTitleState === "vocal") {
    if (direction > 0) {
      setVocalSceneTargetProgress(vocalSceneTargetProgress + 0.1);
      return;
    }

    if (vocalSceneTargetProgress > 0.12) {
      setVocalSceneTargetProgress(vocalSceneTargetProgress - 0.12);
      return;
    }

    setHeroTitleCopy("sejong", true, { inkProgress: 0.72 });
    return;
  }

  if (
    direction > 0 &&
    heroTitleNextThreshold[heroTitleState] !== undefined &&
    heroTitleInkProgress >= heroTitleNextThreshold[heroTitleState]
  ) {
    const currentIndex = heroTitleOrder.indexOf(heroTitleState);
    if (heroTitleOrder[currentIndex + 1] === "vocal") {
      enterVocalScene();
      return;
    }

    setHeroTitleCopy(heroTitleOrder[currentIndex + 1]);
    return;
  }

  if (heroTitleInkStates.has(heroTitleState) && direction > 0 && heroTitleInkProgress < 1) {
    updateHeroTitleInkReveal(heroTitleInkProgress + (heroTitleInkAdvance[heroTitleState] || 0.5));
    return;
  }

  if (heroTitleInkStates.has(heroTitleState) && direction < 0 && heroTitleInkProgress > 0.16) {
    updateHeroTitleInkReveal(heroTitleInkProgress - 0.22);
    return;
  }

  const currentIndex = heroTitleOrder.indexOf(heroTitleState);
  const nextIndex = Math.min(heroTitleOrder.length - 1, Math.max(0, currentIndex + direction));

  const nextState = heroTitleOrder[nextIndex];
  const returningToInkTitle = direction < 0 && heroTitleInkStates.has(nextState);

  setHeroTitleCopy(nextState, true, returningToInkTitle ? { inkProgress: heroTitleNextThreshold[nextState] ?? 0.72 } : {});
}

function keepHeroScreenInPlace() {
  if (!heroTitle) {
    return;
  }

  if (heroTitleState === "vocal" && vocalSceneTargetProgress >= 1) {
    return;
  }

  if ((window.scrollY || window.pageYOffset) > 0) {
    moveHeroTitleStep(1);
    window.scrollTo(0, 0);
  }
}

function resetHeroTitleWithKeyboard(event) {
  if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === "End" || event.key === " ") {
    event.preventDefault();
    moveHeroTitleStep(1);
  }

  if (event.key === "ArrowUp" || event.key === "PageUp" || event.key === "Home") {
    event.preventDefault();
    moveHeroTitleStep(-1);
  }
}

function handleHeroTitleWheel(event) {
  if (!heroTitle) {
    return;
  }

  if ((window.scrollY || window.pageYOffset) > 1) {
    return;
  }

  if (heroTitleState === "vocal") {
    if (event.deltaY > 0 && vocalSceneTargetProgress >= 1) {
      return;
    }

    event.preventDefault();

    const nextProgress = vocalSceneTargetProgress + event.deltaY * 0.00058;

    if (event.deltaY < 0 && vocalSceneTargetProgress <= 0.02) {
      setHeroTitleCopy("sejong");
      return;
    }

    setVocalSceneTargetProgress(nextProgress);
    return;
  }

  event.preventDefault();

  if (heroTitleWheelTimer) {
    return;
  }

  const direction = event.deltaY > 0 ? 1 : -1;
  const wheelThreshold = 360;

  if (Math.sign(heroTitleWheelAmount) !== direction) {
    heroTitleWheelAmount = 0;
  }

  heroTitleWheelAmount += event.deltaY;

  if (Math.abs(heroTitleWheelAmount) < wheelThreshold) {
    return;
  }

  moveHeroTitleStep(direction);
  heroTitleWheelAmount = 0;
  heroTitleWheelTimer = window.setTimeout(() => {
    heroTitleWheelTimer = null;
  }, 1680);
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
      const item = {
        path,
        centerX,
        centerY,
        width: box.width,
        height: box.height,
        lastTriggerAt: 0,
        polarity: index % 5 === 0 ? -1 : 1,
        jitter: Math.random() * Math.PI * 2,
        intensityScale: embossTierIntensity[getEmbossTier(path)] ?? 1,
      };

      path.dataset.embossPath = "";
      path.style.fill = "#f0f0f0";
      path.style.opacity = "0.1";
      path.style.filter = "drop-shadow(0 0 0 rgba(255, 255, 255, 0)) drop-shadow(0 0 0 rgba(132, 138, 136, 0))";

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
    const intensity = Math.max(0, 1 - distance / 210) * item.intensityScale;
    const lift = (1.2 + intensity * 4.8) * item.polarity;
    const wave = Math.sin(now * 0.004 + item.jitter) * (0.8 + intensity * 1.6);
    const highlight = item.polarity > 0 ? "-1px -1px 1px" : "1px 1px 1px";
    const shade = item.polarity > 0 ? "2px 3px 3px" : "-2px -3px 3px";
    const restOpacity = 0.14;

    gsap.killTweensOf(item.path);
    gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .to(item.path, {
        x: Math.cos(item.jitter) * wave,
        y: -lift + wave * 0.35,
        scale: 1 + intensity * 0.01,
        opacity: 0.38 + intensity * 0.42,
        filter: `drop-shadow(${highlight} rgba(255, 255, 255, 0.72)) drop-shadow(${shade} rgba(104, 110, 108, 0.34))`,
        duration: 0.72,
        ease: "sine.inOut",
      })
      .to(item.path, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: restOpacity,
        filter: "drop-shadow(0 0 0 rgba(255, 255, 255, 0)) drop-shadow(0 0 0 rgba(132, 138, 136, 0))",
        duration: 1.6,
        ease: "sine.out",
      });
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
    const isAuto = mode === "auto";
    const intensity = Math.max(0, 1 - distance / radius) * force * item.intensityScale;

    if (intensity < 0.12 || now - item.lastTriggerAt < (isAuto ? 96 : 230)) {
      return;
    }

    item.lastTriggerAt = now;
    const lift = (1.4 + intensity * 5.6) * item.polarity;
    const drift = Math.sin(now * 0.002 + item.jitter) * 0.7;
    const spread = 1 + intensity * 0.018;
    const restOpacity = 0.14;
    const opacity = Math.min(isAuto ? 0.82 : 0.94, 0.34 + intensity * 0.74);
    const highlight = item.polarity > 0 ? "-1px -1px 1px" : "1px 1px 1px";
    const shade = item.polarity > 0 ? "2px 3px 3px" : "-2px -3px 3px";
    const revealEase = "power2.out";
    const settleEase = "sine.out";
    const settleDuration = 2.2 + Math.random() * 0.85;

    gsap.killTweensOf(item.path);
    gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .to(
        item.path,
        {
          x: Math.cos(item.jitter) * intensity * 1.2 + drift,
          y: -lift,
          scale: spread,
          opacity,
          filter: `drop-shadow(${highlight} rgba(255, 255, 255, 0.92)) drop-shadow(${shade} rgba(104, 110, 108, 0.42))`,
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
          opacity: restOpacity,
          filter: "drop-shadow(0 0 0 rgba(255, 255, 255, 0)) drop-shadow(0 0 0 rgba(132, 138, 136, 0))",
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
  const strokeDuration = mode === "auto" ? 760 : 0;

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    const ease = progress * progress * (3 - 2 * progress);
    const wave = Math.sin((progress + performance.now() * 0.00018) * Math.PI * 2) * (mode === "auto" ? 8 : 18);
    const x = fromX + (toX - fromX) * ease;
    const y = fromY + (toY - fromY) * ease + wave;
    const markForce = force * (0.82 + progress * 0.18);
    const delay = strokeDuration * progress;

    if (delay > 0) {
      window.setTimeout(() => addWashMark(x, y, markForce, mode), delay);
    } else {
      addWashMark(x, y, markForce, mode);
    }
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
  autoSweep.active = false;
}

function setCursor(clientX, clientY) {
  cursor.targetX = clientX;
  cursor.targetY = clientY;
}

function retargetAutoSweep(now, rect) {
  const drift = Math.random() > 0.58;
  const pause = !drift && Math.random() > 0.68;
  const marginX = 0;
  const marginY = 0;
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
    autoSweep.strokeStartX = autoSweep.x;
    autoSweep.strokeStartY = autoSweep.y;
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

  autoSweep.x += (nextAutoX - autoSweep.x) * autoSweep.speed;
  autoSweep.y += (nextAutoY - autoSweep.y) * autoSweep.speed;

  if (autoSweep.active) {
    hero.classList.add("is-revealing");
    const autoBlend = Math.min(1, Math.max(0, (idleFor - 1000) / 2600));
    const autoWeight = 0.26 + autoBlend * autoBlend * (3 - 2 * autoBlend) * 0.68;
    pointer.x = userPointer.x * (1 - autoWeight) + autoSweep.x * autoWeight;
    pointer.y = userPointer.y * (1 - autoWeight) + autoSweep.y * autoWeight;

    if (now > autoSweep.nextMarkAt) {
      addWashStroke(autoSweep.strokeStartX, autoSweep.strokeStartY, autoSweep.x, autoSweep.y, autoSweep.force, "auto");
      autoSweep.strokeStartX = autoSweep.x;
      autoSweep.strokeStartY = autoSweep.y;
      autoSweep.nextMarkAt = now + 3000;
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

const recordStack = document.querySelector(".record-stack");
const recordBoxes = recordStack ? Array.from(recordStack.querySelectorAll(".record-box")) : [];

if (recordStack && recordBoxes.length) {
  recordBoxes.forEach((box) => {
    box.dataset.originalLeft = box.style.left;
    box.dataset.originalTop = box.style.top;
    box.dataset.originalHeight = box.style.height;

    box.addEventListener("click", () => {
      const index = Number(box.dataset.index);
      const isActive = recordStack.dataset.activeIndex === String(index);

      if (isActive) {
        delete recordStack.dataset.activeIndex;
        delete recordStack.dataset.active;
        recordBoxes.forEach((b) => {
          b.classList.remove("is-active", "is-pushed-up", "is-pushed-down");
          b.style.left = b.dataset.originalLeft;
          b.style.top = b.dataset.originalTop;
          b.style.height = b.dataset.originalHeight;
          b.style.transform = "";
        });
        return;
      }

      recordStack.dataset.activeIndex = String(index);
      recordStack.dataset.active = "true";

      recordBoxes.forEach((b) => {
        const bIndex = Number(b.dataset.index);
        b.classList.remove("is-active", "is-pushed-up", "is-pushed-down");

        if (bIndex === index) {
          b.classList.add("is-active");
          b.style.left = "50%";
          b.style.top = "50%";
          b.style.height = "800px";
          b.style.transform = "translate(-50%, -50%)";
        } else if (bIndex < index) {
          b.classList.add("is-pushed-up");
          b.style.left = b.dataset.originalLeft;
          b.style.top = b.dataset.originalTop;
          b.style.height = b.dataset.originalHeight;
          b.style.transform = "";
        } else {
          b.classList.add("is-pushed-down");
          b.style.left = b.dataset.originalLeft;
          b.style.top = b.dataset.originalTop;
          b.style.height = b.dataset.originalHeight;
          b.style.transform = "";
        }
      });
    });
  });
}

const heartSection = document.querySelector(".section-heart");
const heartPhotoCarousel = document.querySelector(".heart-photo-carousel");
const heartPhotoPanels = Array.from(document.querySelectorAll(".heart-photo-panel"));
const sceneFlicker = document.querySelector(".scene-flicker");
const heartScrollState = {
  target: 0,
  current: 0,
  frame: null,
};

const HEART_PANEL_POSITIONS = [
  { point: -2.5, x: -58, z: 170, scale: 1.24, scaleX: 0.26, rotate: 88, blur: 16, brightness: 0.24, opacity: 0, edge: 1 },
  { point: -2, x: -41, z: 110, scale: 1.42, scaleX: 0.36, rotate: 76, blur: 12, brightness: 0.42, opacity: 0.58, edge: 1 },
  { point: -1, x: -19, z: -12, scale: 1.18, scaleX: 0.5, rotate: 54, blur: 6, brightness: 0.58, opacity: 0.78, edge: 0.96 },
  { point: 0, x: 0, z: -320, scale: 1.09, scaleX: 1, rotate: 0, blur: 0, brightness: 0.94, opacity: 1, edge: 0.58 },
  { point: 1, x: 19, z: -12, scale: 1.18, scaleX: 0.5, rotate: -54, blur: 6, brightness: 0.58, opacity: 0.78, edge: 0.96 },
  { point: 2, x: 41, z: 110, scale: 1.42, scaleX: 0.36, rotate: -76, blur: 12, brightness: 0.42, opacity: 0.58, edge: 1 },
  { point: 2.5, x: 58, z: 170, scale: 1.24, scaleX: 0.26, rotate: -88, blur: 16, brightness: 0.24, opacity: 0, edge: 1 },
];

function interpolateHeartRole(relative) {
  const clampedRelative = Math.min(2.5, Math.max(-2.5, relative));

  for (let i = 0; i < HEART_PANEL_POSITIONS.length - 1; i += 1) {
    const start = HEART_PANEL_POSITIONS[i];
    const end = HEART_PANEL_POSITIONS[i + 1];

    if (clampedRelative >= start.point && clampedRelative <= end.point) {
      const t = (clampedRelative - start.point) / (end.point - start.point);
      const easedT = t * t * (3 - 2 * t);

      return Object.keys(start).reduce((role, key) => {
        role[key] = start[key] + (end[key] - start[key]) * easedT;
        return role;
      }, {});
    }
  }

  return clampedRelative < 0 ? HEART_PANEL_POSITIONS[0] : HEART_PANEL_POSITIONS[HEART_PANEL_POSITIONS.length - 1];
}

function getHeartCircularRelative(index, virtualIndex, panelCount) {
  return index - virtualIndex;
}

function startHeartSmoothing() {
  if (heartScrollState.frame) {
    return;
  }

  const tick = () => {
    heartScrollState.current += (heartScrollState.target - heartScrollState.current) * 0.06;
    renderHeartProgress(heartScrollState.current);

    if (Math.abs(heartScrollState.target - heartScrollState.current) < 0.0004) {
      heartScrollState.current = heartScrollState.target;
      renderHeartProgress(heartScrollState.current);
      heartScrollState.frame = null;
      return;
    }

    heartScrollState.frame = requestAnimationFrame(tick);
  };

  heartScrollState.frame = requestAnimationFrame(tick);
}

function setHeartTargetProgress(progress, immediate = false) {
  heartScrollState.target = Math.min(1, Math.max(0, progress));
  heartScrollState.current = heartScrollState.target;
  renderHeartProgress(heartScrollState.current);

  if (heartScrollState.frame) {
    cancelAnimationFrame(heartScrollState.frame);
    heartScrollState.frame = null;
  }
}

function renderHeartProgress(progress) {
  if (!heartSection || !heartPhotoCarousel) {
    return;
  }

  const panelCount = heartPhotoPanels.length;

  if (!panelCount) {
    return;
  }

  const introEnd = 0.14;
  const photoEnd = 0.92;
  const photoProgress = Math.min(1, Math.max(0, (progress - introEnd) / (photoEnd - introEnd)));
  const copyFade = 1 - Math.min(1, Math.max(0, (progress - 0.05) / 0.11));
  const rawVirtualIndex = photoProgress * (panelCount - 1);
  const virtualIndex = rawVirtualIndex;
  const activeIndex = Math.min(panelCount - 1, Math.max(0, Math.round(virtualIndex)));
  const centerWidth = 700;
  const centerHeight = 393.75;
  const sideWidth = Math.min(window.innerWidth * 0.34, Math.max(300, window.innerWidth * 0.27));
  const sideHeight = sideWidth * 0.5625;
  const farWidth = Math.min(window.innerWidth * 0.34, Math.max(310, window.innerWidth * 0.28));
  const farHeight = farWidth * 0.5625;

  heartSection.style.setProperty("--heart-copy-opacity", copyFade.toFixed(3));
  heartSection.style.setProperty("--heart-photo-opacity", "1");

  heartPhotoPanels.forEach((panel, index) => {
    const relative = getHeartCircularRelative(index, virtualIndex, panelCount);
    const role = interpolateHeartRole(relative);
    const distance = Math.min(2, Math.abs(relative));
    const width = centerWidth + (sideWidth - centerWidth) * Math.min(1, distance);
    const height = centerHeight + (sideHeight - centerHeight) * Math.min(1, distance);
    const farMix = Math.max(0, distance - 1);
    const finalWidth = width + (farWidth - sideWidth) * farMix;
    const finalHeight = height + (farHeight - sideHeight) * farMix;

    panel.style.setProperty("--panel-width", `${finalWidth.toFixed(2)}px`);
    panel.style.setProperty("--panel-height", `${finalHeight.toFixed(2)}px`);
    panel.style.setProperty("--panel-x", `${role.x.toFixed(2)}vw`);
    panel.style.setProperty("--panel-y", `${(Math.abs(relative) * 8).toFixed(2)}px`);
    panel.style.setProperty("--panel-z", `${role.z.toFixed(2)}px`);
    panel.style.setProperty("--panel-scale", role.scale.toFixed(3));
    panel.style.setProperty("--panel-scale-x", (role.scale * role.scaleX).toFixed(3));
    panel.style.setProperty("--panel-scale-y", role.scale.toFixed(3));
    panel.style.setProperty("--panel-rotate", `${role.rotate.toFixed(2)}deg`);
    panel.style.setProperty("--panel-blur", `${role.blur.toFixed(2)}px`);
    panel.style.setProperty("--panel-brightness", role.brightness.toFixed(3));
    panel.style.setProperty("--panel-opacity", role.opacity.toFixed(3));
    panel.style.setProperty("--panel-edge-opacity", role.edge.toFixed(3));
    const clipInset = Math.min(18, Math.max(0, Math.abs(relative) * 9));
    const leftClipInset = relative > 0 ? clipInset : 0;
    const rightClipInset = relative < 0 ? clipInset : 0;
    panel.style.setProperty("--panel-clip-left-top", `${leftClipInset.toFixed(2)}%`);
    panel.style.setProperty("--panel-clip-left-bottom", `${(100 - leftClipInset).toFixed(2)}%`);
    panel.style.setProperty("--panel-clip-right-top", `${rightClipInset.toFixed(2)}%`);
    panel.style.setProperty("--panel-clip-right-bottom", `${(100 - rightClipInset).toFixed(2)}%`);
    panel.style.zIndex = String(10 - Math.round(distance * 2));
    panel.classList.toggle("is-active", index === activeIndex);
  });

  if (sceneFlicker) {
    sceneFlicker.style.opacity = "0";
  }
}

prepareExistingHeroTitleChars();
setupVocalScene();
keepHeroScreenInPlace();
window.addEventListener("wheel", handleHeroTitleWheel, { passive: false });
window.addEventListener("scroll", keepHeroScreenInPlace, { passive: true });
window.addEventListener("keydown", resetHeroTitleWithKeyboard);
function updateHeartSectionFallback() {
  if (!heartSection) {
    return;
  }

  const sectionStart = heartSection.offsetTop;
  const sectionEnd = sectionStart + heartSection.offsetHeight - window.innerHeight;
  const scrollRange = Math.max(1, sectionEnd - sectionStart);
  const currentScroll = window.scrollY || window.pageYOffset;
  const progress = Math.min(1, Math.max(0, (currentScroll - sectionStart) / scrollRange));

  heartSection.classList.toggle("is-pinned", currentScroll >= sectionStart && currentScroll <= sectionEnd);
  heartSection.classList.toggle("is-ended", currentScroll > sectionEnd);
  setHeartTargetProgress(progress);
}

function setupHeartSection() {
  if (!heartSection || !heartPhotoCarousel) {
    return;
  }

  setHeartTargetProgress(0, true);

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const heartScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heartSection,
        start: "top top",
        end: () => `+=${heartSection.offsetHeight - window.innerHeight}`,
        scrub: true,
        pin: ".heart-sticky",
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setHeartTargetProgress(self.progress),
      },
    });

    heartScrollTimeline.to({}, { duration: 1 });

    window.addEventListener("resize", () => {
      const trigger = heartScrollTimeline.scrollTrigger;
      setHeartTargetProgress(trigger ? trigger.progress : 0, true);
    });
    return;
  }

  updateHeartSectionFallback();
  window.addEventListener("scroll", updateHeartSectionFallback, { passive: true });
  window.addEventListener("resize", updateHeartSectionFallback);
}

setupHeartSection();

animationFrame = requestAnimationFrame(renderMotion);
