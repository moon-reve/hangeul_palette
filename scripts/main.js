import * as THREE from "../assets/vendor/three.module.js";

const hero = document.querySelector(".hero");
const initialTitle = document.querySelector(".hero-title-initial");
const nextTitle = document.querySelector(".hero-title-next");
const kingPeopleSection = document.querySelector(".section-king-people");
const kingPeopleVideoScene = document.querySelector(".king-people-scene-video");
const kingPeopleVideoFrame = document.querySelector(".king-people-video-frame");
const heroWebgl = document.querySelector(".hero-webgl");
const kingPeopleWebgl = document.querySelector(".king-people-webgl");
const kingPeopleHeartWebgl = document.querySelector(".king-people-heart-webgl");
const storyPageIntro = document.querySelector(".story-page-intro");
const soundInteraction = document.querySelector(".sound-interaction");
const soundInteractionSticky = document.querySelector(".sound-interaction-sticky");
const storyPageHeart = document.querySelector(".story-page-heart");
const heartVideoTrack = document.querySelector(".heart-video-track");

const storyPageChange = document.querySelector(".story-page-change");
const storyChangeTextPanel = document.querySelector(".story-change-text-panel");
const changeObjects = Array.from(document.querySelectorAll(".change-object"));
const worldMapInteraction = document.querySelector(".story-page-world .world-map-interaction");

const inkOverlay = document.querySelector(".ink-overlay");
const siteMenu = document.querySelector(".site-menu");

const gsapInstance = window.gsap || null;
const enablePointerReveal = false;
const enableMenuInkOverlay = true;

let scrollUpdateFrame = null;

function updateScrollLinkedScenes() {
  setHeroTitleStep();
  setChangeObjectInteraction();
  setHeartVideoInteraction();
  setKingPeopleScene();
  setSoundInteractionPin();
}

function requestScrollLinkedUpdate() {
  if (scrollUpdateFrame !== null) {
    return;
  }

  scrollUpdateFrame = requestAnimationFrame(() => {
    scrollUpdateFrame = null;
    updateScrollLinkedScenes();
  });
}


function setHeroTitleStep() {
  if (!hero || !initialTitle || !nextTitle) {
    return;
  }

  const rect = hero.getBoundingClientRect();
  const scrollableDistance = Math.max(1, hero.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const initialProgress = smoothProgress(progress, 0.08, 0.48);
  const nextProgress = smoothProgress(progress, 0.38, 0.78);
  const showNextTitle = nextProgress > 0.5;

  initialTitle.classList.toggle("is-active", initialProgress < 0.92);
  nextTitle.classList.toggle("is-active", showNextTitle);
  initialTitle.style.opacity = `${1 - initialProgress}`;
  initialTitle.style.transform = `translate3d(0, ${(-34 / 1920 * 100 * initialProgress).toFixed(3)}vw, 0)`;
  nextTitle.style.opacity = `${nextProgress}`;
  nextTitle.style.transform = `translate3d(0, ${(34 / 1920 * 100 * (1 - nextProgress)).toFixed(3)}vw, 0)`;
}

function smoothProgress(value, start, end) {
  const progress = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return progress * progress * (3 - 2 * progress);
}

function setChangeObjectInteraction() {
  if (!storyPageChange || !storyChangeTextPanel || !changeObjects.length) {
    return;
  }

  const rect = storyPageChange.getBoundingClientRect();
  const scrollableDistance = Math.max(1, storyPageChange.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const releaseProgress = 0.92;
  const isPinned = rect.top <= 0 && progress < releaseProgress && rect.bottom > window.innerHeight;
  const isReleased = rect.top <= 0 && progress >= releaseProgress;

  storyPageChange.classList.toggle("is-change-pinned", isPinned);
  storyPageChange.classList.toggle("is-change-released", isReleased);

  const textRect = storyChangeTextPanel.getBoundingClientRect();
  const textCenter = textRect.top + textRect.height * 0.56;
  const objectTop = Math.min(window.innerHeight * 0.76, Math.max(window.innerHeight * 0.3, textCenter));
  storyPageChange.style.setProperty("--change-object-top", `${(objectTop / window.innerHeight * 100).toFixed(3)}svh`);

  changeObjects.forEach((object, index) => {
    const start = index * 0.14;
    const end = start + 0.32;
    const localProgress = Math.min(1, Math.max(0, (progress - start) / (end - start)));
    const approachProgress = smoothProgress(localProgress, 0, 0.42);
    const exitProgress = smoothProgress(localProgress, 0.58, 1);
    const visibility = isPinned ? Math.max(0, Math.min(1, approachProgress * (1 - exitProgress) * 1.35)) : 0;
    const translateY = 150 * (1 - approachProgress) - 110 * exitProgress;
    const scale = 0.46 + approachProgress * 0.72 + exitProgress * 1.65;
    const blur = exitProgress * 5;

    object.style.opacity = `${visibility}`;
    object.style.filter = blur > 0.1 ? `blur(${(blur / 1920 * 100).toFixed(3)}vw)` : "";
    object.style.zIndex = `${changeObjects.length - index}`;
    object.style.transform = `translate3d(-50%, calc(-50% + ${(translateY / 1920 * 100).toFixed(3)}vw), 0) scale(${scale})`;
  });
}

setHeroTitleStep();
window.addEventListener("scroll", requestScrollLinkedUpdate, { passive: true });
window.addEventListener("resize", setHeroTitleStep);

setChangeObjectInteraction();
window.addEventListener("resize", setChangeObjectInteraction);
window.addEventListener("load", setChangeObjectInteraction);

function setHeartVideoInteraction() {
  if (!storyPageHeart || !heartVideoTrack) {
    return;
  }

  const rect = storyPageHeart.getBoundingClientRect();
  const videoStart = window.innerHeight;
  const sceneCount = Math.max(1, heartVideoTrack.children.length);
  const pinnedDistance = Math.max(1, (sceneCount - 1) * window.innerHeight);
  const progress = Math.min(1, Math.max(0, (-rect.top - videoStart) / pinnedDistance));
  const moveDistance = (sceneCount - 1) * 100;
  const isPinned = rect.top <= -videoStart && progress < 1 && rect.bottom > window.innerHeight;
  const isReleased = rect.top <= -(videoStart + pinnedDistance);

  storyPageHeart.classList.toggle("is-heart-pinned", isPinned);
  storyPageHeart.classList.toggle("is-heart-released", isReleased);
  storyPageHeart.style.setProperty("--heart-video-release-top", `${(sceneCount * 100).toFixed(3)}svh`);
  heartVideoTrack.style.transform = `translate3d(0, ${(-moveDistance * progress).toFixed(3)}svh, 0)`;
}

setHeartVideoInteraction();
window.addEventListener("resize", setHeartVideoInteraction);
window.addEventListener("load", setHeartVideoInteraction);

function initWorldMapInteraction() {
  if (!worldMapInteraction || !gsapInstance) {
    return;
  }

  const routes = Array.from(worldMapInteraction.querySelectorAll(".world-route-base"));
  const routeFlows = Array.from(worldMapInteraction.querySelectorAll(".world-route-flow"));
  const particles = Array.from(worldMapInteraction.querySelectorAll(".world-particle"));
  const glows = Array.from(worldMapInteraction.querySelectorAll(".world-destination-glow"));
  const koreaPoint = worldMapInteraction.querySelector(".world-korea-point");
  const koreaPosition = { left: "45.5%", top: "41.5%" };
  const routeViewBox = { width: 1321, height: 659 };

  if (!routes.length || !particles.length || !glows.length) {
    return;
  }

  // The timeline is intentionally shared by hover and leave, so mouseleave can
  // reverse the exact same cultural-expansion motion back toward Korea.
  const timeline = gsapInstance.timeline({
    paused: true,
    defaults: { duration: 0.78, ease: "power3.inOut" },
  });

  const routeMetrics = routes.map((route, index) => {
    const routeLength = route.getTotalLength();
    const routeFlow = routeFlows[index];

    gsapInstance.set(route, {
      opacity: 0.14,
    });

    timeline.to(route, {
      opacity: 0.82,
      duration: 0.24,
      ease: "sine.out",
    }, 0);

    if (routeFlow) {
      const lightLength = Math.min(86, routeLength * 0.18);

      // A short illuminated dash moves along the route, so the interaction
      // feels like influence flowing through the line instead of a slow reveal.
      gsapInstance.set(routeFlow, {
        strokeDasharray: `${lightLength} ${routeLength}`,
        strokeDashoffset: routeLength + lightLength,
        opacity: 0,
      });

      timeline.to(routeFlow, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
      }, 0.02);

      timeline.to(routeFlow, {
        opacity: 0,
        duration: 0.24,
        ease: "sine.out",
      }, 0.58);
    }

    return { route, routeLength };
  });

  particles.forEach((particle, index) => {
    const routeMetric = routeMetrics[index];
    const particleMotion = { progress: 0 };

    gsapInstance.set(particle, {
      left: koreaPosition.left,
      top: koreaPosition.top,
      opacity: 0,
      scale: 0.42,
    });

    // Each particle begins at Korea and travels with its line to imply that
    // the influence is carried outward rather than simply switched on.
    timeline.to(particleMotion, {
      progress: 1,
      onUpdate: () => {
        if (!routeMetric) {
          return;
        }

        const point = routeMetric.route.getPointAtLength(routeMetric.routeLength * particleMotion.progress);

        gsapInstance.set(particle, {
          left: `${(point.x / routeViewBox.width) * 100}%`,
          top: `${(point.y / routeViewBox.height) * 100}%`,
        });
      },
      duration: 0.7,
    }, 0.02);

    timeline.to(particle, {
      opacity: 0.92,
      scale: 0.82,
      duration: 0.7,
    }, 0.02);

    timeline.to(glows[index], {
      opacity: 1,
      scale: 1,
      duration: 0.42,
      ease: "sine.out",
    }, 0.32);
  });

  if (koreaPoint) {
    timeline.to(koreaPoint, {
      opacity: 1,
      scale: 1.08,
      duration: 0.36,
      ease: "sine.out",
    }, 0);
  }

  worldMapInteraction.addEventListener("mouseenter", () => timeline.play());
  worldMapInteraction.addEventListener("mouseleave", () => timeline.reverse());
  worldMapInteraction.addEventListener("focusin", () => timeline.play());
  worldMapInteraction.addEventListener("focusout", () => timeline.reverse());
}

initWorldMapInteraction();

function setKingPeopleScene() {
  if (!kingPeopleSection || !kingPeopleVideoScene || !kingPeopleVideoFrame) {
    return;
  }

  const rect = kingPeopleSection.getBoundingClientRect();
  const scrollableDistance = Math.max(1, kingPeopleSection.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const maskProgress = smoothProgress(progress, 0.02, 0.82);
  const videoOpacity = smoothProgress(progress, 0.25, 0.42);
  const copyProgress = smoothProgress(progress, 0.78, 0.98);
  const frameFillOpacity = Math.max(0, Math.min(0.38, maskProgress * (1 - videoOpacity) * 0.38));
  const videoMaskSize = 1 + maskProgress * 99;
  const videoOffset = (1 - videoOpacity) * 5;
  const copyOffset = (1 - copyProgress) * (18 / 1920 * 100);

  kingPeopleSection.style.setProperty("--king-video-mask-size", `${videoMaskSize.toFixed(2)}%`);
  kingPeopleSection.style.setProperty("--king-frame-fill-opacity", frameFillOpacity.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-opacity", videoOpacity.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-offset", `${videoOffset.toFixed(2)}svh`);
  kingPeopleSection.style.setProperty("--king-video-copy-opacity", copyProgress.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-copy-offset", `${copyOffset.toFixed(3)}vw`);
}

setKingPeopleScene();
window.addEventListener("resize", setKingPeopleScene);

function setSoundInteractionPin() {
  if (!soundInteraction || !soundInteractionSticky) {
    return;
  }

  const rect = soundInteraction.getBoundingClientRect();
  const shouldPin = rect.top <= 0 && rect.bottom > window.innerHeight;
  const shouldRelease = rect.bottom <= window.innerHeight;

  soundInteraction.classList.toggle("is-pinned", shouldPin);
  soundInteraction.classList.toggle("is-released", shouldRelease);
}

setSoundInteractionPin();
window.addEventListener("resize", setSoundInteractionPin);

function initSoundCollisionExperience() {
  if (!soundInteraction || !soundInteractionSticky) {
    return;
  }

  const root = document.createElement("div");
  root.className = "sound-collision-webgl";
  root.setAttribute("aria-hidden", "true");
  soundInteractionSticky.appendChild(root);

  let initialized = false;
  let renderer;
  let scene;
  let camera;
  let leftLetter;
  let rightLetter;
  let collision;
  let waveform;
  let scrollController;

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;
    ({ renderer, scene, camera } = createSoundScene(root));
    leftLetter = createKoreanConsonant("kieuk");
    rightLetter = createKoreanConsonant("tieut");
    scene.add(leftLetter, rightLetter);
    collision = createCollisionController(scene, leftLetter, rightLetter);
    waveform = createSoundWaveRenderer(scene);
    scrollController = createScrollTimeline();

    resize();
    window.addEventListener("resize", resize);
    if (gsapInstance) {
      gsapInstance.ticker.add(render);
    } else {
      const fallbackRender = (now) => {
        render(now * 0.001);
        requestAnimationFrame(fallbackRender);
      };
      requestAnimationFrame(fallbackRender);
    }
  }

  function createSoundScene(container) {
    const localRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    localRenderer.setClearColor(0x000000, 0);
    localRenderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(localRenderer.domElement);

    const localScene = new THREE.Scene();
    const localCamera = new THREE.PerspectiveCamera(33, 1, 0.1, 90);
    localCamera.position.set(0, 0.1, 15.5);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.45);
    keyLight.position.set(-4.5, 5.5, 7);
    localScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.25);
    rimLight.position.set(4.5, 3.5, 5);
    localScene.add(rimLight);

    localScene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a9a, 1.65));

    return { renderer: localRenderer, scene: localScene, camera: localCamera };
  }

  function createRoundedBar(width, height, radius) {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  }

  function createWhiteStoneTexture() {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    const image = context.createImageData(size, size);

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const brickBand = Math.floor(y / 42);
        const offsetX = brickBand % 2 === 0 ? 0 : 34;
        const mortarX = Math.abs(((x + offsetX) % 86) - 43) > 39 ? 1 : 0;
        const mortarY = y % 42 < 2 || y % 42 > 39 ? 1 : 0;
        const grain =
          Math.sin(x * 0.21 + y * 0.11) * 7 +
          Math.sin(x * 0.047 - y * 0.18) * 9 +
          (Math.random() - 0.5) * 32;
        const mortar = Math.max(mortarX, mortarY);
        const value = Math.max(0, Math.min(255, 214 + grain - mortar * 42));
        const index = (y * size + x) * 4;

        image.data[index] = value;
        image.data[index + 1] = value;
        image.data[index + 2] = value;
        image.data[index + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.85, 1.35);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  const whiteStoneTexture = createWhiteStoneTexture();

  function createCrackedStoneSurface(side, seed) {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    const roughnessCanvas = document.createElement("canvas");
    roughnessCanvas.width = size;
    roughnessCanvas.height = size;
    const roughnessContext = roughnessCanvas.getContext("2d");
    const normalCanvas = document.createElement("canvas");
    normalCanvas.width = size;
    normalCanvas.height = size;
    const normalContext = normalCanvas.getContext("2d");
    const aoCanvas = document.createElement("canvas");
    aoCanvas.width = size;
    aoCanvas.height = size;
    const aoContext = aoCanvas.getContext("2d");
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = size;
    baseCanvas.height = size;
    const baseContext = baseCanvas.getContext("2d");
    const baseRoughnessCanvas = document.createElement("canvas");
    baseRoughnessCanvas.width = size;
    baseRoughnessCanvas.height = size;
    const baseRoughnessContext = baseRoughnessCanvas.getContext("2d");
    const baseNormalCanvas = document.createElement("canvas");
    baseNormalCanvas.width = size;
    baseNormalCanvas.height = size;
    const baseNormalContext = baseNormalCanvas.getContext("2d");
    const baseAoCanvas = document.createElement("canvas");
    baseAoCanvas.width = size;
    baseAoCanvas.height = size;
    const baseAoContext = baseAoCanvas.getContext("2d");
    const baseImage = baseContext.createImageData(size, size);
    const roughnessImage = baseRoughnessContext.createImageData(size, size);
    const normalImage = baseNormalContext.createImageData(size, size);
    const aoImage = baseAoContext.createImageData(size, size);
    let randomSeed = seed * 9973 + 17;

    function random() {
      randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
      return randomSeed / 4294967296;
    }

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const brickBand = Math.floor(y / 42);
        const offsetX = brickBand % 2 === 0 ? 0 : 34;
        const mortarX = Math.abs(((x + offsetX) % 86) - 43) > 39 ? 1 : 0;
        const mortarY = y % 42 < 2 || y % 42 > 39 ? 1 : 0;
        const pores = random() > 0.974 ? -38 - random() * 34 : 0;
        const mineral =
          Math.sin(x * 0.19 + y * 0.13) * 7 +
          Math.sin(x * 0.061 - y * 0.17) * 7 +
          Math.sin(x * 0.033 + y * 0.049) * 10;
        const grain = mineral + (random() - 0.5) * 22;
        const mortar = Math.max(mortarX, mortarY);
        const edgeWear = x < 5 || y < 5 || x > size - 6 || y > size - 6 ? 18 : 0;
        const value = Math.max(0, Math.min(255, 232 + grain + pores - mortar * 28 - edgeWear));
        const roughness = Math.max(0, Math.min(255, 220 + Math.abs(grain) * 1.2 + mortar * 22 + (pores < 0 ? 28 : 0)));
        const normalX = Math.max(0, Math.min(255, 128 + Math.sin(x * 0.14 + y * 0.07) * 9 + (random() - 0.5) * 10));
        const normalY = Math.max(0, Math.min(255, 128 + Math.cos(x * 0.08 - y * 0.16) * 9 + (random() - 0.5) * 10));
        const ao = Math.max(0, Math.min(255, 232 - mortar * 34 + pores * 0.35 - edgeWear * 0.8));
        const index = (y * size + x) * 4;

        baseImage.data[index] = value;
        baseImage.data[index + 1] = Math.max(0, value - 1);
        baseImage.data[index + 2] = Math.max(0, value - 3);
        baseImage.data[index + 3] = 255;
        roughnessImage.data[index] = roughness;
        roughnessImage.data[index + 1] = roughness;
        roughnessImage.data[index + 2] = roughness;
        roughnessImage.data[index + 3] = 255;
        normalImage.data[index] = normalX;
        normalImage.data[index + 1] = normalY;
        normalImage.data[index + 2] = 255;
        normalImage.data[index + 3] = 255;
        aoImage.data[index] = ao;
        aoImage.data[index + 1] = ao;
        aoImage.data[index + 2] = ao;
        aoImage.data[index + 3] = 255;
      }
    }
    baseContext.putImageData(baseImage, 0, 0);
    baseRoughnessContext.putImageData(roughnessImage, 0, 0);
    baseNormalContext.putImageData(normalImage, 0, 0);
    baseAoContext.putImageData(aoImage, 0, 0);

    const contactX = side < 0 ? size * 0.72 : size * 0.28;
    const contactY = size * (0.36 + random() * 0.28);
    const cracks = [];
    const chipCount = 18;
    const chips = [];

    for (let index = 0; index < 24; index += 1) {
      const densityFalloff = index / 24;
      const baseAngle = side < 0 ? Math.PI + (random() - 0.5) * 2.4 : (random() - 0.5) * 2.4;
      const length = size * (0.16 + random() * 0.38) * (1 - densityFalloff * 0.38);
      const segmentCount = 4 + Math.floor(random() * 5);
      const branchCount = 1 + Math.floor(random() * 4);
      const points = [{ x: contactX + (random() - 0.5) * 18, y: contactY + (random() - 0.5) * 28 }];
      let angle = baseAngle + (random() - 0.5) * 1.2;

      for (let step = 1; step <= segmentCount; step += 1) {
        angle += (random() - 0.5) * 0.72;
        const stepLength = length / segmentCount;
        const previous = points[points.length - 1];
        points.push({
          x: previous.x + Math.cos(angle) * stepLength,
          y: previous.y + Math.sin(angle) * stepLength * 0.72,
        });
      }

      cracks.push({
        points,
        delay: random() * 0.16,
        width: 0.65 + random() * 1.85,
        alpha: 0.48 + random() * 0.42,
        branches: Array.from({ length: branchCount }, () => {
          const start = 1 + Math.floor(random() * Math.max(1, points.length - 2));
          const direction = angle + (random() > 0.5 ? 1 : -1) * (0.72 + random() * 0.98);
          const branchLength = length * (0.16 + random() * 0.24);
          return {
            start,
            direction,
            length: branchLength,
            bend: (random() - 0.5) * 0.8,
            width: 0.42 + random() * 0.82,
          };
        }),
      });
    }

    for (let index = 0; index < chipCount; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = random() * size * 0.28;
      chips.push({
        x: contactX + Math.cos(angle) * radius,
        y: contactY + Math.sin(angle) * radius * 0.68,
        size: 2 + random() * 7,
        rotation: random() * Math.PI,
        delay: random() * 0.32,
      });
    }

    const texture = new THREE.CanvasTexture(canvas);
    const roughnessTexture = new THREE.CanvasTexture(roughnessCanvas);
    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    const aoTexture = new THREE.CanvasTexture(aoCanvas);
    [texture, roughnessTexture, normalTexture, aoTexture].forEach((surfaceTexture) => {
      surfaceTexture.wrapS = THREE.RepeatWrapping;
      surfaceTexture.wrapT = THREE.RepeatWrapping;
      surfaceTexture.repeat.set(1.35, 1.05);
      surfaceTexture.needsUpdate = true;
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    roughnessTexture.colorSpace = THREE.NoColorSpace;
    normalTexture.colorSpace = THREE.NoColorSpace;
    aoTexture.colorSpace = THREE.NoColorSpace;

    return {
      texture,
      roughnessTexture,
      normalTexture,
      aoTexture,
      update(progress) {
        context.clearRect(0, 0, size, size);
        context.drawImage(baseCanvas, 0, 0);
        roughnessContext.clearRect(0, 0, size, size);
        roughnessContext.drawImage(baseRoughnessCanvas, 0, 0);
        normalContext.clearRect(0, 0, size, size);
        normalContext.drawImage(baseNormalCanvas, 0, 0);
        aoContext.clearRect(0, 0, size, size);
        aoContext.drawImage(baseAoCanvas, 0, 0);

        if (progress <= 0.001) {
          texture.needsUpdate = true;
          roughnessTexture.needsUpdate = true;
          normalTexture.needsUpdate = true;
          aoTexture.needsUpdate = true;
          return;
        }

        context.save();
        context.globalCompositeOperation = "multiply";
        roughnessContext.save();
        roughnessContext.globalCompositeOperation = "screen";
        normalContext.save();
        normalContext.globalCompositeOperation = "source-over";
        aoContext.save();
        aoContext.globalCompositeOperation = "multiply";

        // Crack lines removed — replaced by SVG chunk polygons
        cracks.forEach((crackLine) => {
          const lineProgress = 0;
          if (lineProgress <= 0) {
            return;
          }

          context.lineCap = "round";
          context.lineJoin = "round";
          context.strokeStyle = `rgba(42, 42, 42, ${crackLine.alpha * lineProgress})`;
          context.lineWidth = crackLine.width * (0.65 + lineProgress * 0.55);
          roughnessContext.strokeStyle = `rgba(245, 245, 245, ${0.34 * lineProgress})`;
          roughnessContext.lineWidth = context.lineWidth * 1.8;
          normalContext.strokeStyle = `rgba(84, 84, 210, ${0.32 * lineProgress})`;
          normalContext.lineWidth = context.lineWidth * 1.35;
          aoContext.strokeStyle = `rgba(178, 178, 178, ${0.42 * lineProgress})`;
          aoContext.lineWidth = context.lineWidth * 1.55;
          context.beginPath();
          roughnessContext.beginPath();
          normalContext.beginPath();
          aoContext.beginPath();
          context.moveTo(crackLine.points[0].x, crackLine.points[0].y);
          roughnessContext.moveTo(crackLine.points[0].x, crackLine.points[0].y);
          normalContext.moveTo(crackLine.points[0].x, crackLine.points[0].y);
          aoContext.moveTo(crackLine.points[0].x, crackLine.points[0].y);

          const visiblePointCount = Math.max(2, Math.ceil((crackLine.points.length - 1) * lineProgress));
          for (let index = 1; index < visiblePointCount; index += 1) {
            const point = crackLine.points[index];
            context.lineTo(point.x, point.y);
            roughnessContext.lineTo(point.x, point.y);
            normalContext.lineTo(point.x, point.y);
            aoContext.lineTo(point.x, point.y);
          }
          context.stroke();
          roughnessContext.stroke();
          normalContext.stroke();
          aoContext.stroke();

          crackLine.branches.forEach((branch) => {
            const branchProgress = Math.min(1, Math.max(0, (lineProgress - 0.28) / 0.54));
            if (branchProgress <= 0 || !crackLine.points[branch.start]) {
              return;
            }
            const start = crackLine.points[branch.start];
            const midLength = branch.length * 0.52 * branchProgress;
            const endLength = branch.length * branchProgress;
            context.strokeStyle = `rgba(32, 32, 32, ${0.34 * branchProgress})`;
            context.lineWidth = branch.width;
            roughnessContext.strokeStyle = `rgba(238, 238, 238, ${0.24 * branchProgress})`;
            roughnessContext.lineWidth = branch.width * 1.6;
            normalContext.strokeStyle = `rgba(94, 94, 218, ${0.22 * branchProgress})`;
            normalContext.lineWidth = branch.width * 1.28;
            aoContext.strokeStyle = `rgba(190, 190, 190, ${0.3 * branchProgress})`;
            aoContext.lineWidth = branch.width * 1.45;
            context.beginPath();
            roughnessContext.beginPath();
            normalContext.beginPath();
            aoContext.beginPath();
            context.moveTo(start.x, start.y);
            roughnessContext.moveTo(start.x, start.y);
            normalContext.moveTo(start.x, start.y);
            aoContext.moveTo(start.x, start.y);
            context.lineTo(
              start.x + Math.cos(branch.direction + branch.bend) * midLength,
              start.y + Math.sin(branch.direction + branch.bend) * midLength * 0.72,
            );
            roughnessContext.lineTo(
              start.x + Math.cos(branch.direction + branch.bend) * midLength,
              start.y + Math.sin(branch.direction + branch.bend) * midLength * 0.72,
            );
            normalContext.lineTo(
              start.x + Math.cos(branch.direction + branch.bend) * midLength,
              start.y + Math.sin(branch.direction + branch.bend) * midLength * 0.72,
            );
            aoContext.lineTo(
              start.x + Math.cos(branch.direction + branch.bend) * midLength,
              start.y + Math.sin(branch.direction + branch.bend) * midLength * 0.72,
            );
            context.lineTo(
              start.x + Math.cos(branch.direction - branch.bend * 0.45) * endLength,
              start.y + Math.sin(branch.direction - branch.bend * 0.45) * endLength * 0.72,
            );
            roughnessContext.lineTo(
              start.x + Math.cos(branch.direction - branch.bend * 0.45) * endLength,
              start.y + Math.sin(branch.direction - branch.bend * 0.45) * endLength * 0.72,
            );
            normalContext.lineTo(
              start.x + Math.cos(branch.direction - branch.bend * 0.45) * endLength,
              start.y + Math.sin(branch.direction - branch.bend * 0.45) * endLength * 0.72,
            );
            aoContext.lineTo(
              start.x + Math.cos(branch.direction - branch.bend * 0.45) * endLength,
              start.y + Math.sin(branch.direction - branch.bend * 0.45) * endLength * 0.72,
            );
            context.stroke();
            roughnessContext.stroke();
            normalContext.stroke();
            aoContext.stroke();
          });
        });

        context.restore();
        roughnessContext.restore();
        normalContext.restore();
        aoContext.restore();

        chips.forEach((chip) => {
          const chipProgress = Math.min(1, Math.max(0, (progress - chip.delay) / 0.42));
          if (chipProgress <= 0) {
            return;
          }
          context.save();
          roughnessContext.save();
          normalContext.save();
          aoContext.save();
          context.translate(chip.x, chip.y);
          roughnessContext.translate(chip.x, chip.y);
          normalContext.translate(chip.x, chip.y);
          aoContext.translate(chip.x, chip.y);
          context.rotate(chip.rotation);
          roughnessContext.rotate(chip.rotation);
          normalContext.rotate(chip.rotation);
          aoContext.rotate(chip.rotation);
          context.fillStyle = `rgba(108, 108, 108, ${0.22 * chipProgress})`;
          roughnessContext.fillStyle = `rgba(250, 250, 250, ${0.38 * chipProgress})`;
          normalContext.fillStyle = `rgba(92, 92, 215, ${0.24 * chipProgress})`;
          aoContext.fillStyle = `rgba(185, 185, 185, ${0.38 * chipProgress})`;
          context.beginPath();
          roughnessContext.beginPath();
          normalContext.beginPath();
          aoContext.beginPath();
          context.moveTo(-chip.size, -chip.size * 0.34);
          roughnessContext.moveTo(-chip.size, -chip.size * 0.34);
          normalContext.moveTo(-chip.size, -chip.size * 0.34);
          aoContext.moveTo(-chip.size, -chip.size * 0.34);
          context.lineTo(chip.size * 0.72, -chip.size * 0.55);
          roughnessContext.lineTo(chip.size * 0.72, -chip.size * 0.55);
          normalContext.lineTo(chip.size * 0.72, -chip.size * 0.55);
          aoContext.lineTo(chip.size * 0.72, -chip.size * 0.55);
          context.lineTo(chip.size * 0.48, chip.size * 0.62);
          roughnessContext.lineTo(chip.size * 0.48, chip.size * 0.62);
          normalContext.lineTo(chip.size * 0.48, chip.size * 0.62);
          aoContext.lineTo(chip.size * 0.48, chip.size * 0.62);
          context.lineTo(-chip.size * 0.62, chip.size * 0.44);
          roughnessContext.lineTo(-chip.size * 0.62, chip.size * 0.44);
          normalContext.lineTo(-chip.size * 0.62, chip.size * 0.44);
          aoContext.lineTo(-chip.size * 0.62, chip.size * 0.44);
          context.closePath();
          roughnessContext.closePath();
          normalContext.closePath();
          aoContext.closePath();
          context.fill();
          roughnessContext.fill();
          normalContext.fill();
          aoContext.fill();
          context.fillStyle = `rgba(245, 245, 242, ${0.2 * chipProgress})`;
          context.fillRect(-chip.size * 0.55, -chip.size * 0.18, chip.size * 0.85, chip.size * 0.18);
          context.restore();
          roughnessContext.restore();
          normalContext.restore();
          aoContext.restore();
        });

        texture.needsUpdate = true;
        roughnessTexture.needsUpdate = true;
        normalTexture.needsUpdate = true;
        aoTexture.needsUpdate = true;
      },
    };
  }

  function applyCrackSurfaces(group, side) {
    group.userData.crackSurfaces = [];
    group.children.forEach((part, index) => {
      if (!part.isMesh) {
        return;
      }

      const surface = createCrackedStoneSurface(side, index + (side < 0 ? 10 : 40));
      const material = part.material.clone();
      material.map = surface.texture;
      material.roughnessMap = surface.roughnessTexture;
      material.normalMap = surface.normalTexture;
      material.normalScale = new THREE.Vector2(0.28, 0.28);
      material.aoMap = surface.aoTexture;
      material.aoMapIntensity = 0.78;
      material.bumpMap = surface.texture;
      material.bumpScale = 0.025;
      part.material = material;
      group.userData.crackSurfaces.push(surface);
    });
  }

  function createPart(width, height, x, y, rotationZ = 0) {
    const geometry = new THREE.ExtrudeGeometry(createRoundedBar(width, height, Math.min(width, height) * 0.2), {
      depth: 0.74,
      bevelEnabled: true,
      bevelThickness: 0.105,
      bevelSize: 0.105,
      bevelSegments: 12,
      curveSegments: 14,
    });
    geometry.center();
    geometry.computeVertexNormals();
    geometry.setAttribute("uv2", geometry.attributes.uv.clone());

    const material = new THREE.MeshStandardMaterial({
      color: 0xf2f2f2,
      roughness: 0.94,
      metalness: 0,
      bumpMap: whiteStoneTexture,
      bumpScale: 0.018,
      roughnessMap: whiteStoneTexture,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    mesh.rotation.z = rotationZ;
    return mesh;
  }

  function createKoreanConsonant(type) {
    const group = new THREE.Group();

    if (type === "kieuk") {
      group.add(createPart(3.92, 0.68, -0.16, 1.08, 0.065));
      group.add(createPart(2.82, 0.66, -0.48, -0.18, 0.065));
      group.add(createPart(0.72, 2.62, 1.32, -0.35, 0.065));
      group.add(createPart(0.98, 0.48, 1.33, -1.68, 0.065));
      group.rotation.set(0.18, -0.34, -0.075);
    } else {
      group.add(createPart(0.72, 3.46, -1.55, -0.02, -0.055));
      group.add(createPart(3.74, 0.68, 0.06, 1.32, -0.075));
      group.add(createPart(3.02, 0.66, 0.32, -0.02, -0.035));
      group.add(createPart(3.12, 0.66, 0.42, -1.36, -0.015));
      group.rotation.set(0.18, 0.31, 0.075);
    }

    applyCrackSurfaces(group, type === "kieuk" ? -1 : 1);
    group.scale.setScalar(window.matchMedia("(max-width: 48em)").matches ? 0.76 : 1.08);
    return group;
  }

  function createCollisionController(localScene, leftGroup, rightGroup) {
    const fragments = [];
    const sourceParts = [...leftGroup.children, ...rightGroup.children].filter((part) => part.isMesh);

    sourceParts.forEach((part, partIndex) => {
      const box = new THREE.Box3().setFromObject(part);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      for (let index = 0; index < 9; index += 1) {
        const side = partIndex < leftGroup.children.length ? -1 : 1;
        const angle = (partIndex * 9 + index) * 0.91;
        const shardScale = 0.12 + (index % 4) * 0.052;
        const mesh = new THREE.Mesh(
          index % 3 === 0
            ? new THREE.TetrahedronGeometry(Math.max(0.18, Math.min(size.x, size.y) * (0.26 + index * 0.018)), 0)
            : new THREE.BoxGeometry(
                Math.max(0.12, size.x * shardScale),
                Math.max(0.08, size.y * (0.14 + (index % 5) * 0.04)),
                0.58 + (index % 2) * 0.18,
              ),
          part.material.clone(),
        );
        mesh.userData.origin = center
          .clone()
          .add(new THREE.Vector3((Math.random() - 0.5) * size.x * 0.62, (Math.random() - 0.5) * size.y * 0.72, 0));
        mesh.userData.velocity = new THREE.Vector3(
          side * (1.85 + index * 0.34) + Math.cos(angle) * 1.65,
          Math.sin(angle * 1.45) * 2.05 + (index % 4) * 0.38,
          (Math.random() - 0.64) * (1.25 + index * 0.16),
        );
        mesh.userData.spin = new THREE.Vector3(0.18 + index * 0.045, 0.14 + index * 0.04, 0.22 + index * 0.052);
        mesh.visible = false;
        localScene.add(mesh);
        fragments.push(mesh);
      }
    });

    const particleCount = window.matchMedia("(max-width: 48em)").matches ? 760 : 1900;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.34;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius * 0.5;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 0.3;

      const power = 1.05 + Math.random() * 3.55;
      velocities[index * 3] = Math.cos(angle) * power;
      velocities[index * 3 + 1] = Math.sin(angle) * power * 0.92 + Math.random() * 0.95;
      velocities[index * 3 + 2] = (Math.random() - 0.5) * power * 1.15;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uOpacity: { value: 0 },
        uSize: { value: window.matchMedia("(max-width: 48em)").matches ? 0.045 : 0.032 },
      },
      vertexShader: `
        uniform float uSize;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uSize * (210.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uOpacity;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, d) * uOpacity;
          gl_FragColor = vec4(vec3(0.93), alpha);
        }
      `,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    localScene.add(particles);

    const shockwave = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.6, 160),
      new THREE.MeshBasicMaterial({ color: 0xf3f3f3, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    shockwave.rotation.x = Math.PI / 2;
    localScene.add(shockwave);

    const streakGeometry = new THREE.BufferGeometry();
    const streakMaterial = new THREE.LineBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0 });
    const streaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    localScene.add(streaks);

    return {
      update(progress, time) {
        const destruction = smoothProgress(progress, 0.62, 0.96);
        const impact = Math.exp(-Math.pow((progress - 0.58) / 0.045, 2));
        const crack = smoothProgress(progress, 0.54, 0.66);
        const burst = smoothProgress(progress, 0.56, 0.9);
        const surfaceCrack = Math.max(impact * 0.82, smoothProgress(progress, 0.58, 0.78));

        [...leftGroup.userData.crackSurfaces, ...rightGroup.userData.crackSurfaces].forEach((surface) => {
          surface.update(surfaceCrack);
        });

        fragments.forEach((fragment) => {
          fragment.visible = burst > 0.01;
          fragment.position.copy(fragment.userData.origin).addScaledVector(fragment.userData.velocity, burst * 4.25);
          fragment.position.y -= burst * burst * 2.45;
          fragment.rotation.x += fragment.userData.spin.x * (burst + impact * 0.8);
          fragment.rotation.y += fragment.userData.spin.y * (burst + impact * 0.8);
          fragment.rotation.z += fragment.userData.spin.z * (burst + impact * 0.8);
          fragment.material.opacity = 1 - burst * 0.96;
        });

        for (let index = 0; index < particleCount; index += 1) {
          positions[index * 3] = velocities[index * 3] * burst * 3.4 + Math.sin(time * 2 + index) * 0.04 * impact;
          positions[index * 3 + 1] =
            velocities[index * 3 + 1] * burst * 2.55 - burst * burst * 1.15;
          positions[index * 3 + 2] = velocities[index * 3 + 2] * burst;
        }
        particleGeometry.attributes.position.needsUpdate = true;
        particleMaterial.uniforms.uOpacity.value = impact * 0.9 + burst * (1 - burst) * 0.7;

        shockwave.material.opacity = impact * 0.82;
        shockwave.scale.setScalar(0.5 + impact * 7.4 + burst * 3.6);

        const streakPositions = new Float32Array(86 * 6);
        for (let index = 0; index < 86; index += 1) {
          const x = (index / 85 - 0.5) * 6.8;
          const height = (0.38 + (index % 11) * 0.2 + impact * 0.9) * crack;
          streakPositions[index * 6] = x;
          streakPositions[index * 6 + 1] = -height;
          streakPositions[index * 6 + 2] = 0.15;
          streakPositions[index * 6 + 3] = x + Math.sin(index) * 0.02;
          streakPositions[index * 6 + 4] = height;
          streakPositions[index * 6 + 5] = 0.15;
        }
        streakGeometry.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
        streakMaterial.opacity = (impact * 0.36 + crack * 0.7) * (1 - burst * 0.58);

      },
    };
  }

  function createSoundWaveRenderer(localScene) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color: 0xe8e8e8, transparent: true, opacity: 0.26 });
    const lines = new THREE.LineSegments(geometry, material);
    lines.position.z = -0.58;
    localScene.add(lines);

    return {
      update(progress, time) {
        const count = 96;
        const positions = new Float32Array(count * 6);
        const approach = smoothProgress(progress, 0.08, 0.54);
        const impact = Math.exp(-Math.pow((progress - 0.58) / 0.055, 2));
        const fade = smoothProgress(progress, 0.72, 0.98);
        const amplitude = (0.08 + approach * 0.28 + impact * 2.1) * (1 - fade * 0.72);

        for (let index = 0; index < count; index += 1) {
          const x = (index / (count - 1) - 0.5) * 13.2;
          const falloff = 1 - Math.min(1, Math.abs(x) / 6.8);
          const height = Math.abs(Math.sin(index * 0.55 + time * 4.8)) * amplitude * falloff;
          positions[index * 6] = x;
          positions[index * 6 + 1] = -height;
          positions[index * 6 + 2] = -0.58;
          positions[index * 6 + 3] = x;
          positions[index * 6 + 4] = height;
          positions[index * 6 + 5] = -0.58;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        material.opacity = (0.16 + impact * 0.48) * (1 - fade * 0.6);
      },
    };
  }

  function createScrollTimeline() {
    const state = { progress: 0 };

    if (window.ScrollTrigger && gsapInstance) {
      gsapInstance.timeline({
        scrollTrigger: {
          trigger: soundInteraction,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            state.progress = self.progress;
          },
        },
      });
    }

    return {
      get progress() {
        if (window.ScrollTrigger) {
          return state.progress;
        }
        const rect = soundInteraction.getBoundingClientRect();
        const distance = Math.max(1, soundInteraction.offsetHeight - window.innerHeight);
        return Math.min(1, Math.max(0, -rect.top / distance));
      },
    };
  }

  function resize() {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia("(max-width: 48em)").matches ? 1.25 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(timeSeconds) {
    const progress = scrollController.progress;
    const approach = smoothProgress(progress, 0.08, 0.52);
    const anticipation = smoothProgress(progress, 0.5, 0.58);
    const destruction = smoothProgress(progress, 0.62, 0.96);
    const impact = Math.exp(-Math.pow((progress - 0.58) / 0.045, 2));
    const shake = (anticipation * 0.075 + impact * 0.035) * Math.sin(timeSeconds * (18 + anticipation * 72));

    root.classList.toggle("is-active", progress > 0.01 && progress < 0.995);

    leftLetter.position.set(-9 + approach * 6.9 + shake, Math.sin(timeSeconds * 1.4) * 0.08, 0);
    rightLetter.position.set(9 - approach * 6.9 - shake, Math.cos(timeSeconds * 1.25) * 0.07, 0);
    leftLetter.rotation.z = -0.18 + approach * 0.12 + shake;
    rightLetter.rotation.z = 0.18 - approach * 0.12 - shake;
    leftLetter.rotation.y = -0.28 + anticipation * 0.08;
    rightLetter.rotation.y = 0.24 - anticipation * 0.08;

    const intactOpacity = 1 - destruction;
    [leftLetter, rightLetter].forEach((letter) => {
      letter.traverse((child) => {
        if (child.isMesh) {
          child.visible = intactOpacity > 0.02;
          child.material.opacity = intactOpacity;
        }
      });
    });

    camera.position.z = 15.5 - anticipation * 1.2 + destruction * 0.35;
    camera.position.x = Math.sin(timeSeconds * 36) * anticipation * 0.03;
    collision.update(progress, timeSeconds);
    waveform.update(progress, timeSeconds);
    renderer.render(scene, camera);
  }

  function lazyInit() {
    if (!("IntersectionObserver" in window)) {
      init();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        observer.disconnect();
        try {
          init();
        } catch (error) {
          console.error("Sound collision interaction failed to start.", error);
        }
      },
      { rootMargin: "80% 0" },
    );
    observer.observe(root);
  }

  lazyInit();
}

function initInkOverlay(container, menuEl) {
  if (!container || !menuEl) return;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const resolution = new THREE.Vector2(1, 1);

  let progress = 0;
  let targetProgress = 0;
  let lastTime = performance.now();
  let inkFrame = null;

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uResolution: { value: resolution },
      uProgress: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uResolution;
      uniform float uProgress;
      uniform float uTime;

      float hash(vec2 p) {
        p = fract(p * vec2(234.21, 83.17));
        p += dot(p, p + 19.19);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 6; i++) {
          v += noise(p) * a;
          p = p * 2.1 + 7.3;
          a *= 0.5;
        }
        return v;
      }

      // ?�묵(blobA) ?�용 ??블러�??�게 �??�이??
      float inkOuter(vec2 uv) {
        vec2 p = uv - vec2(1.0, 1.0);
        p.x *= uResolution.x / uResolution.y;
        float dist = length(p);
        float t = uTime * 0.02;
        float radius = uProgress * 1.68;
        vec2 dir = normalize(p + 0.001);

        float aL1 = fbm(dir * 1.7 + t * 0.16) * 0.34;
        float aL2 = fbm(dir * 4.8 - t * 0.13 + 2.3) * 0.10;
        float aL3 = fbm(dir * 10.5 + t * 0.26 + 5.2) * 0.03;
        float rA = radius * (0.52 + aL1 + aL2 + aL3);
        float blobA = 1.0 - smoothstep(rA * 0.50, rA, dist);

        float fade = 1.0 - smoothstep(radius * 0.72, radius * 0.92, dist);
        return clamp(blobA * 0.26 * fade, 0.0, 1.0);
      }

      // 중담�??�용
      float inkMid(vec2 uv) {
        vec2 p = uv - vec2(1.0, 1.0);
        p.x *= uResolution.x / uResolution.y;
        float dist = length(p);
        float t = uTime * 0.02;
        float radius = uProgress * 1.68;
        vec2 dir = normalize(p + 0.001);

        float mL1 = fbm(dir * 2.0 + t * 0.17 + 4.6) * 0.30;
        float mL2 = fbm(dir * 5.5 - t * 0.13 + 9.2) * 0.09;
        float rM = radius * (0.44 + mL1 + mL2);
        float blobM = 1.0 - smoothstep(rM * 0.50, rM, dist);

        float aL1 = fbm(dir * 1.7 + t * 0.16) * 0.34;
        float aL2 = fbm(dir * 4.8 - t * 0.13 + 2.3) * 0.10;
        float aL3 = fbm(dir * 10.5 + t * 0.26 + 5.2) * 0.03;
        float rA = radius * (0.52 + aL1 + aL2 + aL3);
        float blobA = 1.0 - smoothstep(rA * 0.50, rA, dist);

        blobM = min(blobM, blobA);

        float fade = 1.0 - smoothstep(radius * 0.72, radius * 0.92, dist);
        return clamp(blobM * 0.44 * fade, 0.0, 1.0);
      }

      // 중묵 + ?�묵
      float inkInner(vec2 uv) {
        vec2 p = uv - vec2(1.0, 1.0);
        p.x *= uResolution.x / uResolution.y;
        float dist = length(p);
        float t = uTime * 0.02;
        float radius = uProgress * 1.68;
        vec2 dir = normalize(p + 0.001);

        float cL = fbm(dir * 3.5 + t * 0.20 + 16.2) * 0.20;
        float rC = radius * (0.22 + cL);
        float blobC = 1.0 - smoothstep(rC * 0.94, rC * 1.40, dist);

        float bL1 = fbm(dir * 2.2 + t * 0.18 + 8.5) * 0.28;
        float bL2 = fbm(dir * 6.0 - t * 0.14 + 12.0) * 0.08;
        float rB = radius * (0.38 + bL1 + bL2);
        float blobB = 1.0 - smoothstep(rB * 0.94, rB * 1.25, dist);

        float mL1 = fbm(dir * 2.0 + t * 0.17 + 4.6) * 0.30;
        float mL2 = fbm(dir * 5.5 - t * 0.13 + 9.2) * 0.09;
        float rM = radius * (0.44 + mL1 + mL2);
        float blobM = 1.0 - smoothstep(rM * 0.50, rM, dist);

        float aL1 = fbm(dir * 1.7 + t * 0.16) * 0.34;
        float aL2 = fbm(dir * 4.8 - t * 0.13 + 2.3) * 0.10;
        float aL3 = fbm(dir * 10.5 + t * 0.26 + 5.2) * 0.03;
        float rA = radius * (0.52 + aL1 + aL2 + aL3);
        float blobA = 1.0 - smoothstep(rA * 0.50, rA, dist);

        blobM = min(blobM, blobA);
        blobB = min(blobB, blobM);
        blobC = min(blobC, blobB);

        float a = max(blobB * 0.62, blobC * 0.97);
        float fade = 1.0 - smoothstep(radius * 0.72, radius * 0.92, dist);
        return clamp(a * fade, 0.0, 1.0);
      }

      void main() {
        if (uProgress <= 0.001) {
          gl_FragColor = vec4(0.0);
          return;
        }

        // ?�묵
        vec2 sA = 1.0 / uResolution;
        float alphaOuter =
          inkOuter(vUv + vec2(-sA.x, -sA.y)) * 0.0625 +
          inkOuter(vUv + vec2(  0.0, -sA.y)) * 0.125  +
          inkOuter(vUv + vec2( sA.x, -sA.y)) * 0.0625 +
          inkOuter(vUv + vec2(-sA.x,   0.0)) * 0.125  +
          inkOuter(vUv                      ) * 0.25   +
          inkOuter(vUv + vec2( sA.x,   0.0)) * 0.125  +
          inkOuter(vUv + vec2(-sA.x,  sA.y)) * 0.0625 +
          inkOuter(vUv + vec2(  0.0,  sA.y)) * 0.125  +
          inkOuter(vUv + vec2( sA.x,  sA.y)) * 0.0625;

        // 중담�?
        vec2 sM = 5.0 / uResolution;
        float alphaMid =
          inkMid(vUv + vec2(-sM.x, -sM.y)) * 0.0625 +
          inkMid(vUv + vec2(  0.0, -sM.y)) * 0.125  +
          inkMid(vUv + vec2( sM.x, -sM.y)) * 0.0625 +
          inkMid(vUv + vec2(-sM.x,   0.0)) * 0.125  +
          inkMid(vUv                      ) * 0.25   +
          inkMid(vUv + vec2( sM.x,   0.0)) * 0.125  +
          inkMid(vUv + vec2(-sM.x,  sM.y)) * 0.0625 +
          inkMid(vUv + vec2(  0.0,  sM.y)) * 0.125  +
          inkMid(vUv + vec2( sM.x,  sM.y)) * 0.0625;

        // 중묵/?�묵
        vec2 sI = 12.0 / uResolution;
        float alphaInner =
          inkInner(vUv + vec2(-sI.x, -sI.y)) * 0.0625 +
          inkInner(vUv + vec2(  0.0, -sI.y)) * 0.125  +
          inkInner(vUv + vec2( sI.x, -sI.y)) * 0.0625 +
          inkInner(vUv + vec2(-sI.x,   0.0)) * 0.125  +
          inkInner(vUv                      ) * 0.25   +
          inkInner(vUv + vec2( sI.x,   0.0)) * 0.125  +
          inkInner(vUv + vec2(-sI.x,  sI.y)) * 0.0625 +
          inkInner(vUv + vec2(  0.0,  sI.y)) * 0.125  +
          inkInner(vUv + vec2( sI.x,  sI.y)) * 0.0625;

        float alpha = max(alphaOuter, max(alphaMid, alphaInner));
        vec3 inkColor = vec3(0.025);
        gl_FragColor = vec4(inkColor, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    resolution.set(w, h);
  }

  window.addEventListener("resize", resize);
  resize();

  function requestInkRender() {
    if (inkFrame !== null) {
      return;
    }

    inkFrame = requestAnimationFrame(render);
  }

  menuEl.addEventListener("mouseenter", () => {
    targetProgress = 0.6;
    menuEl.classList.add("ink-active");
    requestInkRender();
  });

  menuEl.addEventListener("mouseleave", () => {
    targetProgress = 0;
    requestInkRender();
  });

  function render(now) {
    inkFrame = null;

    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    const speed = targetProgress > progress ? 3.0 : 1.5;
    progress += (targetProgress - progress) * Math.min(1.0, delta * speed);

    if (targetProgress === 0 && progress < 0.02) {
      menuEl.classList.remove("ink-active");
    }

    if (progress > 0.001) {
      material.uniforms.uProgress.value = progress;
      material.uniforms.uTime.value = now * 0.001;
      renderer.render(scene, camera);
    }

    if (targetProgress > 0 || progress > 0.001) {
      requestInkRender();
    }
  }
}

function roundedRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M${x + r} ${y}`,
    `H${x + width - r}`,
    `Q${x + width} ${y} ${x + width} ${y + r}`,
    `V${y + height - r}`,
    `Q${x + width} ${y + height} ${x + width - r} ${y + height}`,
    `H${x + r}`,
    `Q${x} ${y + height} ${x} ${y + height - r}`,
    `V${y + r}`,
    `Q${x} ${y} ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

function tikeutReferencePath() {
  return [
    "M126 110",
    "H566",
    "Q618 110 618 162",
    "Q618 214 566 214",
    "H196",
    "V310",
    "H574",
    "Q626 310 626 362",
    "Q626 414 574 414",
    "H196",
    "V520",
    "H572",
    "Q624 520 624 572",
    "Q624 624 572 624",
    "H126",
    "Q70 624 70 568",
    "V166",
    "Q70 110 126 110",
    "Z",
  ].join(" ");
}

function createSeededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createSoundCollisionScrollTrigger(options) {
  const trigger = options.trigger;
  const onUpdate = options.onUpdate;
  const instance = {
    progress: 0,
    kill() {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    },
  };

  function update() {
    const rect = trigger.getBoundingClientRect();
    const scrollableDistance = Math.max(1, trigger.offsetHeight - window.innerHeight);
    instance.progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
    onUpdate(instance);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  return instance;
}

function initSoundCollisionInteraction(sticky) {
  const interaction = sticky.closest(".sound-interaction");
  if (!interaction) {
    return;
  }

  const React = window.React || {
    createElement(type, props = {}, ...children) {
      return { type, props, children };
    },
  };
  const ReactDOM = window.ReactDOM || {
    createRoot(root) {
      return {
        render(element) {
          root.appendChild(renderReactElement(element));
        },
      };
    },
  };

  function renderReactElement(element) {
    if (typeof element === "string") {
      return document.createTextNode(element);
    }

    if (typeof element.type === "function") {
      return renderReactElement(element.type(element.props || {}));
    }

    const node = document.createElement(element.type);
    Object.entries(element.props || {}).forEach(([key, value]) => {
      if (key === "className") {
        node.className = value;
      } else if (key === "html") {
        node.innerHTML = value;
      } else if (key.startsWith("aria-")) {
        node.setAttribute(key, value);
      }
    });
    element.children.flat().forEach((child) => node.appendChild(renderReactElement(child)));
    return node;
  }

  function SoundCollisionScene() {
    return React.createElement("div", {
      className: "sound-collision-root",
      "aria-hidden": "true",
      html: buildSoundCollisionMarkup(),
    });
  }

  const rootHost = document.createElement("div");
  rootHost.className = "sound-collision-mount";
  sticky.appendChild(rootHost);
  ReactDOM.createRoot(rootHost).render(React.createElement(SoundCollisionScene));

  const root = rootHost.querySelector(".sound-collision-root");
  const scene = root.querySelector(".sound-collision-scene");
  const svg = root.querySelector(".sound-collision-svg");
  const plosiveStage = sticky.querySelector(".sound-stage-plosive");
  const affricateStage = sticky.querySelector(".sound-stage-affricate");
  const fricativeStage = sticky.querySelector(".sound-stage-fricative");
  const plosiveTitle = plosiveStage.querySelector(".sound-stage-title");
  const affricateTitle = affricateStage.querySelector(".sound-stage-title");
  const fricativeTitle = fricativeStage.querySelector(".sound-stage-title");
  const leftLetter = root.querySelector('[data-letter="kieuk"]');
  const rightLetter = root.querySelector('[data-letter="tikeut"]');
  const affLeftLetter = root.querySelector('[data-aff-letter="jieut"]');
  const affRightLetter = root.querySelector('[data-aff-letter="chieut"]');
  const fricLeftLetter = root.querySelector('[data-fric-letter="siot"]');
  const fricRightLetter = root.querySelector('[data-fric-letter="ssangsiot"]');
  const fricLeftStrokes = fricLeftLetter ? Array.from(fricLeftLetter.querySelectorAll(":scope > .aff-letter-stroke")) : [];
  const fricRightStrokes = fricRightLetter ? Array.from(fricRightLetter.querySelectorAll(":scope > .aff-letter-stroke")) : [];
  const fricDissolveStrokes = [
    { el: fricLeftStrokes[1], delay: 0 },
    { el: fricRightStrokes[0], delay: 0 },
    { el: fricLeftStrokes[0], delay: 0.38 },
    { el: fricRightStrokes[1], delay: 0.22 },
    { el: fricRightStrokes[2], delay: 0.28 },
    { el: fricRightStrokes[3], delay: 0.48 },
  ].filter(({ el }) => el).map(({ el, delay }) => ({ el, delay, length: el.getTotalLength() }));
  const leftBody = root.querySelector('[data-body="kieuk"]');
  const rightBody = root.querySelector('[data-body="tikeut"]');
  const leftRim  = leftLetter.querySelector(':scope > .sound-letter-rim');
  const rightRim = rightLetter.querySelector(':scope > .sound-letter-rim');
  const fragments = Array.from(root.querySelectorAll(".sound-fragment"));
  const letterCracks = Array.from(root.querySelectorAll(".sound-letter-crack"));
  const strokeCracks = Array.from(root.querySelectorAll(".sound-stroke-crack"));
  const kieukStrokeEls = Array.from(root.querySelectorAll('[data-letter="kieuk"].sound-letter-stroke'));
  const tikeutStrokeEls = Array.from(root.querySelectorAll('[data-letter="tikeut"].sound-letter-stroke'));
  const kieukDrifts = [[-75, -110], [-85, 95], [40, 30]];
  const tikeutDrifts = [[55, -100], [85, 10], [55, 105], [-30, 60]];
  const dust = Array.from(root.querySelectorAll(".sound-dust"));
  const chips = Array.from(root.querySelectorAll(".sound-chip"));
  const impactCore = root.querySelector(".sound-impact-core");

  // Vibration arc lines and friction squiggles for affricate collision
  const SVG_NS = "http://www.w3.org/2000/svg";
  function makeAffPath(d, sw) {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#030303");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-width", String(sw));
    p.setAttribute("opacity", "0");
    return p;
  }

  // Bracket arc at a stroke tip:
  // (tx,ty) = tip position, (ox,oy) = outward unit vector,
  // off = how far out the center sits, r = half-span in perp direction, b = bulge in outward direction
  function bracketArc(tx, ty, ox, oy, off, r, b) {
    const cx = tx + off * ox, cy = ty + off * oy;
    const px = -oy, py = ox;
    const sx = +(cx + r * px).toFixed(1), sy = +(cy + r * py).toFixed(1);
    const ex = +(cx - r * px).toFixed(1), ey = +(cy - r * py).toFixed(1);
    const qx = +(cx + b * ox).toFixed(1), qy = +(cy + b * oy).toFixed(1);
    return `M ${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}`;
  }

  // stroke-width=104 �� cap radius=52, so arc center must be >52 units from tip.
  // Use off=70 (safely outside cap), r/b=32 for inner, 50 for outer.

  // ��: ���� �ݴ��� �ܰ� tip�� (bar-left, bar-right, bot-left) ? bot-right�� ���˺ζ� ����
  const jieutArcPaths = [
    makeAffPath(bracketArc(212,186, -1,0, 70,32,32), 13),
    makeAffPath(bracketArc(212,186, -1,0, 96,32,32), 13),
    makeAffPath(bracketArc(648,186,  1,0,  76,32,32), 13),
    makeAffPath(bracketArc(648,186,  1,0, 102,32,32), 13),
    makeAffPath(bracketArc(202,582, -0.546,0.838, 70,32,32), 13),
    makeAffPath(bracketArc(202,582, -0.546,0.838, 96,32,32), 13),
  ];
  if (affLeftLetter) jieutArcPaths.forEach(p => affLeftLetter.appendChild(p));

  // ��: ���� �ݴ��� �ܰ� tip�� (top, bar-right, bot-right) ? bot-left�� ���˺ζ� ����
  const chieutArcPaths = [
    makeAffPath(bracketArc(382,100, -1,0, 70,28,28), 13),
    makeAffPath(bracketArc(382,100, -1,0, 96,28,28), 13),
    makeAffPath(bracketArc(382,100,  1,0, 70,28,28), 13),
    makeAffPath(bracketArc(382,100,  1,0, 96,28,28), 13),
    makeAffPath(bracketArc(612,286,  1,0,  76,32,32), 13),
    makeAffPath(bracketArc(612,286,  1,0, 102,32,32), 13),
    makeAffPath(bracketArc(606,598,  0.726,0.687, 70,32,32), 13),
    makeAffPath(bracketArc(606,598,  0.726,0.687, 96,32,32), 13),
  ];
  if (affRightLetter) chieutArcPaths.forEach(p => affRightLetter.appendChild(p));

  // �� ������ �ٸ� ��(660,588) bracket arcs ? outward=(0.542,0.840)
  const frictionPaths = [
    makeAffPath(bracketArc(660,588, 0.542,0.840, 76,32,32), 13),
    makeAffPath(bracketArc(660,588, 0.542,0.840, 102,32,32), 13),
  ];
  if (affLeftLetter) frictionPaths.forEach(p => affLeftLetter.appendChild(p));

  // Fricative collision dust: fine grains that open from the contact edge.
  const fricParticles = [];
  {
    let rng = 83;
    const rand = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296; };
    for (let i = 0; i < 3200; i++) {
      const strokeIndex = i % 2;
      const side = strokeIndex === 0 ? -1 : 1;
      // Almost all particles are tiny dust: 85% micro dots, 15% small grains
      const sizeRoll = rand();
      const size = sizeRoll < 0.85
        ? 0.18 + Math.pow(rand(), 1.2) * 1.6   // micro dust ~0.18-1.8px
        : 1.4 + Math.pow(rand(), 2.8) * 3.2;   // small grains ~1.4-4.6px
      const band = Math.pow(rand(), 0.62);
      const spray = Math.pow(rand(), 1.25);
      const delay = rand() * 0.004;
      const spreadX = side * (40 + band * 360 + spray * 420);
      const spreadY = (rand() - 0.5) * (260 + band * 520) + Math.sin(band * Math.PI) * 95;
      const lift = -20 - rand() * 72;
      const fall = 26 + rand() * 210;
      const spin = (rand() - 0.5) * 800;
      // All particles are circles/ellipses — no polygons for dust
      const el = document.createElementNS(SVG_NS, "ellipse");
      const rx = size * (0.55 + rand() * 0.6);
      const ry = size * (0.45 + rand() * 0.55);
      el.setAttribute("rx", rx.toFixed(2));
      el.setAttribute("ry", ry.toFixed(2));
      const shade = rand();
      const fill = shade < 0.18 ? "#111111"
        : shade < 0.42 ? "#2a2a2a"
        : shade < 0.65 ? "#444444"
        : shade < 0.80 ? "#636363"
        : shade < 0.92 ? "#888888"
        : "#aaaaaa";
      el.setAttribute("fill", fill);
      el.setAttribute("opacity", "0");
      el.dataset.strokeIndex = strokeIndex;
      el.dataset.side = side;
      el.dataset.delay = delay.toFixed(3);
      el.dataset.band = band.toFixed(3);
      el.dataset.spreadX = spreadX.toFixed(2);
      el.dataset.spreadY = spreadY.toFixed(2);
      el.dataset.lift = lift.toFixed(2);
      el.dataset.fall = fall.toFixed(2);
      el.dataset.spin = spin.toFixed(2);
      el.dataset.size = size.toFixed(2);
      el.dataset.alpha = (0.45 + rand() * 0.55).toFixed(3);
      svg.appendChild(el);
      fricParticles.push(el);
    }
  }

  const gsapApi = window.gsap;
  const progressState = {
    scroll: 0,
    rendered: -1,
    velocity: 0,
    previous: 0,
  };
  const affricateStart = 0.60;
  const affricateDuration = 0.60;
  const fricativeTitleStart = 1.14;
  const fricativeTitleEnd = 1.20;
  const fricativeStart = 1.20;
  const fricativeDuration = 0.60;
  const soundTimelineDuration = fricativeStart + fricativeDuration;

  const ScrollTrigger = window.ScrollTrigger || {
    create: createSoundCollisionScrollTrigger,
  };

  ScrollTrigger.create({
    trigger: interaction,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate(self) {
      progressState.scroll = self.progress;
    },
  });

  function renderFrame(now) {
    const progress = progressState.scroll * soundTimelineDuration;
    const delta = progress - progressState.previous;
    progressState.velocity += (delta * 42 - progressState.velocity) * 0.18;
    progressState.previous = progress;

    const affPhase = Math.min(1, Math.max(0, (progress - affricateStart) / affricateDuration));
    const affApproach = smoothProgress(affPhase, 0.04, 0.42);
    const inAffContact = affApproach > 0.95 && smoothProgress(affPhase, 0.52, 0.62) < 1;
    if (Math.abs(progress - progressState.rendered) > 0.0005 || Math.abs(progressState.velocity) > 0.001 || inAffContact) {
      const plosiveProgress = Math.min(1, Math.max(0, progress / 0.60));
      updateSoundCollision(plosiveProgress, progressState.velocity, now * 0.001);
      updateAffricateCollision(progress, progressState.velocity, now * 0.001);
      updateFricativeCollision(progress, progressState.velocity, now * 0.001);
      progressState.rendered = progress;
    }

    requestAnimationFrame(renderFrame);
  }

  function updateSoundCollision(progress, velocity, time) {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    const viewportScale = Math.min(width / 1440, height / 900);
    const letterScale = Math.min(0.56, Math.max(0.36, viewportScale * 0.56));
    const approach = smoothProgress(progress, 0.02, 0.43);
    const impact = 1 - Math.min(1, Math.abs(progress - 0.455) / 0.07);
    const crackProgress = smoothProgress(progress, 0.35, 0.5);
    const fractureProgress = smoothProgress(progress, 0.43, 0.62);
    const breakProgress = smoothProgress(progress, 0.47, 0.72);
    const dissolveProgress = smoothProgress(progress, 0.62, 0.94);
    const heavy = 1 - Math.pow(1 - approach, 3.4);
    const vibration = Math.sin(time * 42) * 4 * approach * (1 - breakProgress) + Math.sin(time * 107) * 1.2 * impact;
    const travel = 760 / letterScale;
    const leftImpactX = -696 * letterScale;
    const rightImpactX = -70 * letterScale;
    const leftStartX = leftImpactX - travel;
    const rightStartX = rightImpactX + travel;
    const centerOffset = -204;

    // �浹 �� �ݵ�: ������ ƨ�ܳ��ٰ� ������ ���ߴ� ease-out
    const reboundProgress = smoothProgress(progress, 0.47, 0.72);
    const reboundEase = 1 - Math.pow(1 - reboundProgress, 2.8);
    const reboundDist = 60 / letterScale;  // ȭ��� �� 30px�� �ڷ�

    const leftX  = centerOffset + leftStartX  + (leftImpactX  - leftStartX)  * heavy + vibration - reboundDist * reboundEase;
    const rightX = centerOffset + rightStartX + (rightImpactX - rightStartX) * heavy - vibration + reboundDist * reboundEase;
    const baseY = 0;

    // Body fades out as strokes begin separating so original shape disappears simultaneously
    const bodyOpacity = 1 - smoothProgress(progress, 0.47, 0.62);
    const blur = 0;
    // �ݵ��ϸ鼭 ���Ⱑ ������� ���ƿ�
    const leftRotation  = -8 * (1 - heavy) * (1 - breakProgress) + 4 * breakProgress * (1 - reboundEase * 0.7) + vibration * 0.18;
    const rightRotation =  8 * (1 - heavy) * (1 - breakProgress) - 4 * breakProgress * (1 - reboundEase * 0.7) - vibration * 0.18;
    const isVisible = progress > 0.02 && progress < 0.96 ? 1 : 0;

    svg.style.transform = "none";
    setLetterTransform(leftLetter, leftX, -410 + baseY, letterScale, leftRotation, 430, 365);
    setLetterTransform(rightLetter, rightX, -415 - baseY, letterScale, rightRotation, 360, 370);

    gsapSet(leftLetter, {
      opacity: isVisible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42)) blur(${blur}px)`,
    });
    gsapSet(rightLetter, {
      opacity: isVisible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42)) blur(${blur}px)`,
    });
    gsapSet(leftBody, { opacity: bodyOpacity });
    gsapSet(rightBody, { opacity: bodyOpacity });
    if (leftRim)  leftRim.style.opacity  = bodyOpacity;
    if (rightRim) rightRim.style.opacity = bodyOpacity;

    // ȹ �и� + �׶��̼� �Ҹ� �ִϸ��̼�
    // Per-stroke spin and secondary drift for fragment tumble
    const kieukSpins  = [-22, 28, -15];
    const tikeutSpins = [18, -24, 20, -13];
    const kieukSecondary  = [[0, -18], [0, 20], [22, 0]];
    const tikeutSecondary = [[0, -16], [0, 14], [0, 22], [-18, 0]];

    function animateStrokes(strokeEls, drifts, isLeft) {
      const spins      = isLeft ? kieukSpins      : tikeutSpins;
      const secondary  = isLeft ? kieukSecondary  : tikeutSecondary;
      strokeEls.forEach((el, i) => {
        const [dx, dy]   = drifts[i]     || [0, 0];
        const [sx, sy]   = secondary[i]  || [0, 0];
        const stagger    = 0;

        // Three phases: break apart → dissolve → become dust
        const localBreak    = Math.max(0, smoothProgress(progress, 0.47 + stagger, 0.70));
        const localDissolve = Math.max(0, smoothProgress(progress, 0.52 + stagger, 0.80));
        const localDust     = Math.max(0, smoothProgress(progress, 0.58 + stagger, 0.92));

        if (localBreak <= 0) {
          el.style.opacity = "0";
          el.style.mask = "";
          el.style.webkitMask = "";
          el.style.filter = "";
          return;
        }

        // Fast-burst easing for break, slow drift for dust
        const breakEase = 1 - Math.pow(1 - localBreak, 2.4);
        const dustEase  = 1 - Math.pow(1 - localDust,  1.7);

        // Primary drift + secondary chaotic drift + spin + slight shrink as mass disintegrates
        const tx  = ((dx + sx * dustEase * 0.55) * breakEase * letterScale).toFixed(2);
        const ty  = ((dy + sy * dustEase * 0.55) * breakEase * letterScale).toFixed(2);
        const rot = ((spins[i] || 0) * breakEase).toFixed(2);
        const scl = (1 - dustEase * 0.06).toFixed(3);

        el.style.mask = "";
        el.style.webkitMask = "";

        // Blur grows as piece crumbles to dust (0 → ~7px)
        const blurPx = (dustEase * 7).toFixed(1);
        el.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : "";
        el.setAttribute("transform", `translate(${tx} ${ty}) rotate(${rot}) scale(${scl})`);

        // Break crack lines: flash white briefly at the moment of fracture then vanish
        const crackFlash = Math.min(1, localBreak * 10) * Math.max(0, 1 - localBreak * 4);
        el.querySelectorAll('.sound-stroke-break-crack').forEach(bc => {
          bc.setAttribute('opacity', crackFlash.toFixed(3));
        });

        // Whole stroke fades out uniformly
        const overallOpacity = Math.max(0, 1 - Math.pow(localDust, 1.3) * 1.18);
        el.style.opacity = (localBreak * overallOpacity).toFixed(3);
      });
    }

    animateStrokes(kieukStrokeEls, kieukDrifts, true);
    animateStrokes(tikeutStrokeEls, tikeutDrifts, false);

    root.style.setProperty("--sound-shake-x", `${Math.sin(time * 140) * impact * 10}px`);
    root.style.setProperty("--sound-shake-y", "0px");
    scene.style.setProperty("--sound-impact-blur", "0");

    gsapSet(impactCore, { opacity: Math.max(0, impact * 0.95 - breakProgress), scale: 0.35 + impact * 2.1 });

    // Stroke surface cracks: appear as strokes separate, in the non-masked interior zone
    // crackProgress (0.35-0.5 in outer progress) = plosiveProgress 0.58-0.83 = stroke-break phase
    strokeCracks.forEach(sc => {
      const fadeIn  = Math.min(crackProgress * 3.0, 0.92);   // quick fade-in
      const fadeOut = 1 - smoothProgress(progress, 0.44, 0.50); // fade before strokes dissolve
      sc.setAttribute("opacity", Math.max(0, fadeIn * fadeOut).toFixed(3));
    });

    letterCracks.forEach((crack, idx) => {
      const delay = Number(crack.dataset.delay);
      const local = Math.min(1, Math.max(0, crackProgress * 1.6 - delay));
      // Fade in with crack progress, then scatter outward and fade with the letter body
      const breakFade = smoothProgress(progress, 0.47, 0.70);
      const opacity = local * (1 - breakFade);
      // As letter breaks apart, each chunk drifts outward and falls slightly
      const isLeft = idx % 2 === 0;
      const driftX = breakFade * (isLeft ? -28 : 28) * (0.6 + (idx % 5) * 0.18);
      const driftY = breakFade * (18 + (idx % 7) * 12);
      const rotateDeg = breakFade * ((idx % 2 === 0 ? 1 : -1) * (12 + (idx % 6) * 8));
      crack.setAttribute("transform", `translate(${driftX.toFixed(1)} ${driftY.toFixed(1)}) rotate(${rotateDeg.toFixed(1)})`);
      crack.style.opacity = `${Math.max(0, opacity)}`;
    });

    fragments.forEach((fragment) => {
      const start = Number(fragment.dataset.start);
      const dir = Number(fragment.dataset.dir);
      const spin = Number(fragment.dataset.spin);
      const fall = Number(fragment.dataset.fall);
      const size = Number(fragment.dataset.size);
      const local = Math.min(1, Math.max(0, (fractureProgress - start) / (1 - start)));
      const gravity = fall * local * local * 0.72;
      const x = dir * local * (70 + 260 * size) + velocity * 16;
      const y = gravity + local * (6 + size * 18);
      const opacity = local <= 0 ? 0 : Math.max(0, (1 - smoothProgress(progress, 0.82, 0.98)) * (0.45 + size * 0.55));

      fragment.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(spin * local).toFixed(2)})`);
      fragment.style.opacity = `${opacity}`;
    });

    dust.forEach((particle) => {
      const start = Number(particle.dataset.start);
      const life = Number(particle.dataset.life);
      const angle = Number(particle.dataset.angle);
      const speed = Number(particle.dataset.speed);
      const rise = Number(particle.dataset.rise);
      const originX = Number(particle.dataset.originX);
      const originY = Number(particle.dataset.originY);
      const local = Math.min(1, Math.max(0, (progress - start) / life));
      const fade = 1 - smoothProgress(local, 0.58, 1);
      const finalFade = 1 - smoothProgress(progress, 0.82, 0.98);
      const spread = Math.sin(local * Math.PI * 0.5) * speed;
      const x = Math.cos(angle) * spread;
      const y = Math.sin(angle) * spread - rise * local + 95 * local * local;
      particle.style.opacity = `${Math.max(0, fade * local * finalFade * 0.62)}`;
      particle.style.transform = `translate3d(calc(-50% + ${originX + x}px), calc(-50% + ${originY + y}px), 0) scale(${0.45 + local * 3.15})`;
    });

    chips.forEach((chip) => {
      const start = Number(chip.dataset.start);
      const angle = Number(chip.dataset.angle);
      const speed = Number(chip.dataset.speed);
      const spin = Number(chip.dataset.spin);
      const originX = Number(chip.dataset.originX);
      const originY = Number(chip.dataset.originY);
      const local = Math.min(1, Math.max(0, (progress - start) / 0.34));
      const finalFade = 1 - smoothProgress(progress, 0.82, 0.98);
      const x = Math.cos(angle) * speed * local;
      const y = Math.sin(angle) * speed * local + 240 * local * local;
      chip.style.opacity = `${Math.max(0, (1 - smoothProgress(local, 0.62, 1)) * local * finalFade)}`;
      chip.style.transform = `translate3d(calc(-50% + ${originX + x}px), calc(-50% + ${originY + y}px), 0) rotate(${spin * local}deg)`;
    });
  }

  function gsapSet(target, values) {
    if (!target) {
      return;
    }

    if (gsapApi) {
      gsapApi.set(target, values);
      return;
    }

    Object.assign(target.style, values);
  }

  function setLetterTransform(target, x, y, scale, rotation, originX, originY) {
    target.setAttribute(
      "transform",
      `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(3)} ${originX} ${originY})`,
    );
  }

  function setAffricateTransform(target, x, y, scaleX, scaleY, rotation, originX, originY) {
    if (!target) {
      return;
    }

    target.setAttribute(
      "transform",
      `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scaleX.toFixed(4)} ${scaleY.toFixed(4)}) rotate(${rotation.toFixed(3)} ${originX} ${originY})`,
    );
  }

  function updateAffricateCollision(progress, velocity, time) {
    if (!affLeftLetter || !affRightLetter) {
      return;
    }

    const phase = Math.min(1, Math.max(0, (progress - affricateStart) / affricateDuration));
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    const viewportScale = Math.min(width / 1440, height / 900);
    const letterScale = Math.min(0.56, Math.max(0.36, viewportScale * 0.56));
    const titleMix = smoothProgress(progress, 0.66, 0.72);
    const approach = smoothProgress(phase, 0.04, 0.42);
    const release = smoothProgress(phase, 0.56, 0.98);
    const fade = 1 - smoothProgress(phase, 0.7, 1);
    const visible = smoothProgress(phase, 0.02, 0.1) * fade;
    const highX = 0;
    const highY = 0;
    const rotateJitter = 0;
    const compression = 0;
    const travel = 760 / letterScale;
    const centerOffset = -204;
    const leftImpactX = -660 * letterScale;
    const rightImpactX = -158 * letterScale;
    const leftStartX = leftImpactX - travel;
    const rightStartX = rightImpactX + travel;
    const heavy = 1 - Math.pow(1 - approach, 3.5);
    const exit = 210 / letterScale * release;
    const leftX = centerOffset + leftStartX + (leftImpactX - leftStartX) * heavy + highX - exit;
    const rightX = centerOffset + rightStartX + (rightImpactX - rightStartX) * heavy - highX + exit;

    const contact = smoothProgress(phase, 0.38, 0.46) * (1 - smoothProgress(phase, 0.52, 0.62));
    const vibAmp = contact * 2.5;
    const vibX = Math.sin(time * 90) * vibAmp;
    const vibY = Math.sin(time * 90 * 1.27 + 1.1) * vibAmp * 0.7;
    const vibRot = Math.sin(time * 90 * 0.83 + 0.5) * contact * 1.0;

    const slideAmount = 36;
    const fricTitleMix = smoothProgress(progress, fricativeTitleStart, fricativeTitleEnd);
    gsapSet(plosiveStage, { opacity: titleMix < 1 ? 1 : 0 });
    gsapSet(plosiveTitle, { opacity: 1 - titleMix, y: -slideAmount * titleMix });
    const affricateVisible = titleMix * (1 - smoothProgress(phase, 0.94, 1)) * (1 - fricTitleMix);
    gsapSet(affricateStage, { opacity: titleMix > 0 && fricTitleMix < 1 ? 1 : 0 });
    gsapSet(affricateTitle, { opacity: affricateVisible, y: slideAmount * (1 - titleMix) - slideAmount * fricTitleMix });
    gsapSet(fricativeStage, { opacity: fricTitleMix > 0 ? 1 : 0 });
    gsapSet(fricativeTitle, { opacity: fricTitleMix, y: slideAmount * (1 - fricTitleMix) });

    setAffricateTransform(
      affLeftLetter,
      leftX - vibX,
      -410 + highY + vibY,
      letterScale * (1 + compression),
      letterScale * (1 - compression * 0.62),
      -7 * (1 - heavy) + rotateJitter - vibRot,
      430,
      365,
    );
    setAffricateTransform(
      affRightLetter,
      rightX + vibX,
      -415 - highY - vibY,
      letterScale * (1 + compression),
      letterScale * (1 - compression * 0.62),
      7 * (1 - heavy) - rotateJitter + vibRot,
      360,
      370,
    );

    const glowBlur = contact * 12 * letterScale;
    gsapSet(affLeftLetter, {
      opacity: visible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42)) drop-shadow(0 0 ${glowBlur}px rgba(0,0,0,${(contact * 0.35).toFixed(3)}))`,
    });
    gsapSet(affRightLetter, {
      opacity: visible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42)) drop-shadow(0 0 ${glowBlur}px rgba(0,0,0,${(contact * 0.35).toFixed(3)}))`,
    });

    const arcOpacity = (contact * visible).toFixed(3);
    jieutArcPaths.forEach(p => p.setAttribute("opacity", arcOpacity));
    chieutArcPaths.forEach(p => p.setAttribute("opacity", arcOpacity));
    frictionPaths.forEach(p => p.setAttribute("opacity", arcOpacity));
  }

  function updateFricativeCollision(progress, velocity, time) {
    if (!fricLeftLetter || !fricRightLetter) return;

    const phase = Math.min(1, Math.max(0, (progress - fricativeStart) / fricativeDuration));
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    const viewportScale = Math.min(width / 1440, height / 900);
    const letterScale = Math.min(0.56, Math.max(0.36, viewportScale * 0.56));

    const approach = smoothProgress(phase, 0.04, 0.42);
    const visible = smoothProgress(phase, 0.02, 0.10);
    const heavy = 1 - Math.pow(1 - approach, 3.5);

    const travel = 760 / letterScale;
    const centerOffset = -204;
    // �� ������ �ٸ� ��(���� 660)�� �� ���� �ٸ� ��(���� 102)�� SVG x=0���� �������� ����
    const leftImpactX = -660 * letterScale;
    const rightImpactX = -102 * letterScale;
    const leftStartX = leftImpactX - travel;
    const rightStartX = rightImpactX + travel;

    const leftX = centerOffset + leftStartX + (leftImpactX - leftStartX) * heavy;
    const rightX = centerOffset + rightStartX + (rightImpactX - rightStartX) * heavy;

    setAffricateTransform(fricLeftLetter, leftX, -410, letterScale, letterScale, -7 * (1 - heavy), 430, 365);
    setAffricateTransform(fricRightLetter, rightX, -415, letterScale, letterScale, 7 * (1 - heavy), 360, 370);

    function localPointToSvg(target, x, y, fallbackX, fallbackY) {
      const targetMatrix = target.getScreenCTM ? target.getScreenCTM() : null;
      const svgMatrix = svg.getScreenCTM ? svg.getScreenCTM() : null;
      if (!targetMatrix || !svgMatrix || !svg.createSVGPoint) {
        return { x: fallbackX, y: fallbackY };
      }
      const point = svg.createSVGPoint();
      point.x = x;
      point.y = y;
      return point.matrixTransform(targetMatrix).matrixTransform(svgMatrix.inverse());
    }

    const fallbackLeftContactX = leftX + 660 * letterScale;
    const fallbackRightContactX = rightX + 102 * letterScale;
    const fallbackLeftContactY = -410 + 588 * letterScale;
    const fallbackRightContactY = -415 + 582 * letterScale;
    const leftContact = localPointToSvg(fricLeftLetter, 660, 588, fallbackLeftContactX, fallbackLeftContactY);
    const rightContact = localPointToSvg(fricRightLetter, 102, 582, fallbackRightContactX, fallbackRightContactY);
    const contactX = 0.5 * (leftContact.x + rightContact.x);
    const contactY = 0.5 * (leftContact.y + rightContact.y);

    const disintegrate = smoothProgress(phase, 0.32, 0.90);
    const finalFade = 1 - smoothProgress(disintegrate, 0.92, 1);

    fricLeftLetter.style.mask = "";
    fricLeftLetter.style.webkitMask = "";
    fricRightLetter.style.mask = "";
    fricRightLetter.style.webkitMask = "";

    const dissolveEdges = fricDissolveStrokes.map(({ el, delay, length }) => {
      const local = Math.min(1, Math.max(0, (disintegrate - delay) / Math.max(0.001, 1 - delay)));
      const eased = 1 - Math.pow(1 - local, 2.35);
      const visibleLength = Math.max(0.001, length * (1 - eased));
      el.style.strokeDasharray = `${visibleLength.toFixed(2)} ${length.toFixed(2)}`;
      el.style.strokeDashoffset = "0";
      const strokeFade = 1 - smoothProgress(local, 0.02, 1);
      el.style.opacity = String(visible * finalFade * strokeFade);
      const edgeLength = Math.min(length - 0.001, visibleLength);
      const edgePoint = el.getPointAtLength(edgeLength);
      const prevPoint = el.getPointAtLength(Math.max(0, edgeLength - 18));
      const svgPoint = localPointToSvg(el, edgePoint.x, edgePoint.y, contactX, contactY);
      const prevSvgPoint = localPointToSvg(el, prevPoint.x, prevPoint.y, contactX, contactY);
      const tx = svgPoint.x - prevSvgPoint.x;
      const ty = svgPoint.y - prevSvgPoint.y;
      const mag = Math.max(0.001, Math.hypot(tx, ty));
      return { x: svgPoint.x, y: svgPoint.y, tx: tx / mag, ty: ty / mag, nx: -ty / mag, ny: tx / mag, local, eased, delay };
    });

    gsapSet(fricLeftLetter, {
      opacity: visible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42))`,
    });
    gsapSet(fricRightLetter, {
      opacity: visible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42))`,
    });

    fricParticles.forEach(p => {
      if (visible <= 0 || disintegrate <= 0) {
        p.setAttribute("opacity", "0");
        return;
      }

      const delay = Number(p.dataset.delay);
      const side = Number(p.dataset.side);
      const band = Number(p.dataset.band);
      const streamIndex = Number(p.dataset.strokeIndex);
      const edge = dissolveEdges[streamIndex] || { x: contactX, y: contactY, local: disintegrate, eased: disintegrate };
      if (edge.local <= delay) {
        p.setAttribute("opacity", "0");
        return;
      }

      const localP = Math.min(1, Math.max(0, (edge.local - delay) / Math.max(0.001, 1 - delay)));
      const ssangsiotFollow = streamIndex === 1 ? Math.min(1, edge.local * 1.16 + 0.035) : edge.local;
      const particleP = streamIndex === 1 ? Math.max(localP, ssangsiotFollow) : localP;
      const ease = streamIndex === 1 ? 1 - Math.pow(1 - ssangsiotFollow, 2.35) : edge.eased;
      // Faster lateral spread for powder burst feel
      const along = Number(p.dataset.spreadY) * letterScale * Math.pow(ease, 0.98);
      // Faster initial horizontal explosion
      const powderBase = Number(p.dataset.spreadX) * letterScale * Math.pow(ease, 1.18);
      const powder = streamIndex === 1 ? powderBase * 0.70 : powderBase;
      // Stronger lift arc + sharper gravity fall for powder physics
      const drift = Number(p.dataset.lift) * letterScale * Math.sin(ease * Math.PI * 1.08)
        + Number(p.dataset.fall) * letterScale * Math.pow(ease, 1.55);
      // Air turbulence: subtle sinusoidal drift for fine dust
      const turbulence = Math.sin(time * 3.4 + band * 12.7 + Number(p.dataset.spreadX) * 0.031) * 6 * letterScale * ease;
      const outside = 78 * letterScale * (0.42 + edge.local * 0.58) * (streamIndex === 1 ? 0.05 : 1);
      const x = edge.x + edge.tx * along + edge.nx * (outside + powder) + velocity * 5;
      const y = edge.y + edge.ty * along + edge.ny * (outside + powder) + drift + turbulence;
      const scale = 0.38 + ease * (0.72 + band * 0.38);
      const spin = Number(p.dataset.spin) * ease + Math.sin(time * 2.6 + band * 11.3) * 8;
      // Fine dust lingers longer in air before fading
      const densityFade = 1 - smoothProgress(particleP, 0.84, 1);
      const opacity = Math.max(0, visible * Number(p.dataset.alpha) * densityFade * smoothProgress(particleP, 0, 0.18) * (1.10 + (1 - band) * 0.55));

      p.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${spin.toFixed(2)}) scale(${scale.toFixed(3)})`);
      p.setAttribute("opacity", opacity.toFixed(3));
    });
  }

  requestAnimationFrame(renderFrame);
}

function buildSoundCollisionMarkup() {
  const kieukPath = [
    roundedRectPath(170, 118, 520, 104, 52),
    roundedRectPath(170, 332, 502, 104, 52),
    roundedRectPath(580, 118, 116, 492, 52),
  ].join(" ");
  const tikeutPath = tikeutReferencePath();

  // �и��� ���� ȹ ��� ����
  const kieukStrokes = [
    roundedRectPath(170, 118, 520, 104, 52),  // �� ����ȹ
    roundedRectPath(170, 332, 502, 104, 52),  // �߰� ����ȹ
    roundedRectPath(580, 118, 116, 492, 52),  // ����ȹ
  ];
  const tikeutStrokes = [
    roundedRectPath(70, 110, 548, 104, 52),   // �� ����ȹ
    roundedRectPath(70, 310, 556, 104, 52),   // �߰� ����ȹ
    roundedRectPath(70, 520, 554, 104, 52),   // �Ʒ� ����ȹ
    roundedRectPath(70, 110, 126, 514, 52),   // ���� ����ȹ
  ];

  const leftFragments = buildImpactFragmentMarkup("kieuk", 18, 42);
  const rightFragments = buildImpactFragmentMarkup("tikeut", 20, 43);
  const leftLetterCracks = buildImpactLetterCrackMarkup("kieuk", 1, 211);
  const rightLetterCracks = buildImpactLetterCrackMarkup("tikeut", 1, 233);
  const dust = buildDustMarkup();
  const chips = buildChipMarkup();

  // Per-stroke crack line bounds (x, y, w, h of each rounded-rect stroke)
  const kieukBounds = [
    { x: 170, y: 118, w: 520, h: 104 },
    { x: 170, y: 332, w: 502, h: 104 },
    { x: 580, y: 118, w: 116, h: 492 },
  ];
  const tikeutBounds = [
    { x: 70, y: 110, w: 548, h: 104 },
    { x: 70, y: 310, w: 556, h: 104 },
    { x: 70, y: 520, w: 554, h: 104 },
    { x: 70, y: 110, w: 126, h: 514 },
  ];

  function buildStrokeCracks(isLeft, bounds, seed) {
    const rand = createSeededRandom(seed);
    const { x, y, w, h } = bounds;
    // The stroke mask dissolves from the contact edge (right for kieuk, left for tikeut).
    // Place cracks in the OPPOSITE interior zone so they stay in the visible (black-mask) area.
    // kieuk (isLeft): contact edge = right → cracks in left 15-65% of width
    // tikeut (!isLeft): contact edge = left → cracks in right 15-65% of width
    const zoneStart = isLeft ? x + w * 0.10 : x + w * 0.38;
    const zoneEnd   = isLeft ? x + w * 0.65 : x + w * 0.90;
    const insetY = Math.max(6, h * 0.14);

    const lines = [];
    const count = 4 + Math.floor(rand() * 3); // 4-6 cracks
    for (let i = 0; i < count; i++) {
      // Random interior start point
      const sx = zoneStart + rand() * (zoneEnd - zoneStart);
      const sy = y + insetY + rand() * (h - insetY * 2);
      const segs = 2 + Math.floor(rand() * 2);
      const pts = [[sx, sy]];
      let cx = sx, cy = sy;
      const totalLen = 18 + rand() * 48;
      const baseAngle = rand() * Math.PI * 2;
      for (let s = 0; s < segs; s++) {
        const a = baseAngle + (rand() - 0.5) * 0.9;
        cx += Math.cos(a) * (totalLen / segs) * (0.6 + rand() * 0.5);
        cy += Math.sin(a) * (totalLen / segs) * 0.55;
        cx = Math.max(zoneStart, Math.min(zoneEnd, cx));
        cy = Math.max(y + insetY, Math.min(y + h - insetY, cy));
        pts.push([cx, cy]);
      }
      const ptsStr = pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
      const sw = (0.9 + rand() * 1.3).toFixed(1);  // 0.9~2.2px
      const g  = Math.floor(90 + rand() * 100);     // #5a~#c8 gray
      lines.push(`<polyline class="sound-stroke-crack" points="${ptsStr}" stroke="rgb(${g},${g},${g})" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>`);
    }
    return lines.join('');
  }

  function buildStrokeBreakCracks(bounds, seed) {
    const rand = createSeededRandom(seed);
    const { x, y, w, h } = bounds;
    const isHoriz = w > h;
    const lines = [];
    const count = 2 + Math.floor(rand() * 2); // 2-3 cracks per stroke
    for (let ci = 0; ci < count; ci++) {
      const pts = [];
      if (isHoriz) {
        // Crack runs roughly vertically across the stroke (short axis)
        const cx = x + w * (0.25 + rand() * 0.50);
        const segs = 3 + Math.floor(rand() * 2);
        let px = cx + (rand() - 0.5) * 10;
        let py = y + h * 0.05;
        pts.push([px, py]);
        for (let s = 0; s < segs; s++) {
          px += (rand() - 0.5) * 18;
          py += (h * 0.9) / segs * (0.7 + rand() * 0.6);
          px = Math.max(cx - 22, Math.min(cx + 22, px));
          py = Math.min(y + h * 0.95, py);
          pts.push([px, py]);
        }
      } else {
        // Crack runs roughly horizontally across the stroke (short axis)
        const cy = y + h * (0.25 + rand() * 0.50);
        const segs = 3 + Math.floor(rand() * 2);
        let px = x + w * 0.05;
        let py = cy + (rand() - 0.5) * 10;
        pts.push([px, py]);
        for (let s = 0; s < segs; s++) {
          px += (w * 0.9) / segs * (0.7 + rand() * 0.6);
          py += (rand() - 0.5) * 18;
          py = Math.max(cy - 22, Math.min(cy + 22, py));
          px = Math.min(x + w * 0.95, px);
          pts.push([px, py]);
        }
      }
      const ptsStr = pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
      const sw = (1.2 + rand() * 1.4).toFixed(1);
      lines.push(`<polyline class="sound-stroke-break-crack" points="${ptsStr}" stroke="rgba(255,255,255,0.88)" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>`);
    }
    return lines.join('');
  }

  const kieukStrokeMarkup = kieukStrokes.map((d, i) => `
    <g class="sound-letter-stroke" data-letter="kieuk" data-idx="${i}" style="opacity:0">
      <path d="${d}" fill="#030303" />
      ${buildStrokeCracks(true, kieukBounds[i], 71 + i * 13)}
      ${buildStrokeBreakCracks(kieukBounds[i], 131 + i * 19)}
    </g>`).join("");

  const tikeutStrokeMarkup = tikeutStrokes.map((d, i) => `
    <g class="sound-letter-stroke" data-letter="tikeut" data-idx="${i}" style="opacity:0">
      <path d="${d}" fill="#030303" />
      ${buildStrokeCracks(false, tikeutBounds[i], 97 + i * 17)}
      ${buildStrokeBreakCracks(tikeutBounds[i], 173 + i * 23)}
    </g>`).join("");

  return `
    <div class="sound-collision-scene">
      <svg class="sound-collision-svg" viewBox="-760 -390 1520 780" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="soundConcreteDisplace" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.08" numOctaves="5" seed="9" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8" xChannelSelector="R" yChannelSelector="G" />
            <feDropShadow dx="0" dy="15" stdDeviation="10" flood-color="#000" flood-opacity="0.36" />
          </filter>
          <pattern id="soundConcreteMaterial" width="92" height="54" patternUnits="userSpaceOnUse">
            <rect width="92" height="54" fill="#0b0b0a" />
            <path d="M0 26.5H92M45 0V26.5M8 26.5V54M74 26.5V54" stroke="#1e1d1b" stroke-width="2" opacity="0.48" />
            <path d="M0 0H92V54H0Z" fill="url(#soundConcreteGrain)" opacity="0.56" />
          </pattern>
          <radialGradient id="soundConcreteGrain" cx="42%" cy="30%" r="78%">
            <stop offset="0" stop-color="#1f1e1c" />
            <stop offset="0.48" stop-color="#11100f" />
            <stop offset="1" stop-color="#020202" />
          </radialGradient>
          <clipPath id="sound-kieuk-clip"><path d="${kieukPath}" /></clipPath>
          <clipPath id="sound-tikeut-clip"><path d="${tikeutPath}" /></clipPath>
          <!-- �տ��� �׶��̼�: �浹 ��(���) �� ����(����) -->
          <!-- �տ� ������: ����(#e1e1e1)���� ä�� ���� ƴó�� ���̰� -->
          <linearGradient id="crack-grad-kieuk" gradientUnits="userSpaceOnUse" x1="700" y1="0" x2="600" y2="0">
            <stop offset="0"   stop-color="#e1e1e1" stop-opacity="1" />
            <stop offset="1"   stop-color="#e1e1e1" stop-opacity="0.7" />
          </linearGradient>
          <linearGradient id="crack-grad-tikeut" gradientUnits="userSpaceOnUse" x1="72" y1="0" x2="172" y2="0">
            <stop offset="0"   stop-color="#e1e1e1" stop-opacity="1" />
            <stop offset="1"   stop-color="#e1e1e1" stop-opacity="0.7" />
          </linearGradient>
        </defs>
        <ellipse class="sound-impact-core" cx="0" cy="12" rx="95" ry="54" />
        <g class="sound-letter" data-letter="kieuk" transform="translate(-1030 -250)">
          <path class="sound-letter-body" data-body="kieuk" d="${kieukPath}" fill="#030303" />
          <path class="sound-letter-rim" d="${kieukPath}" />
          <g clip-path="url(#sound-kieuk-clip)">${leftLetterCracks}</g>
          ${kieukStrokeMarkup}
          ${leftFragments}
        </g>
        <g class="sound-letter" data-letter="tikeut" transform="translate(365 -260)">
          <path class="sound-letter-body" data-body="tikeut" d="${tikeutPath}" fill="#030303" />
          <path class="sound-letter-rim" d="${tikeutPath}" />
          <g clip-path="url(#sound-tikeut-clip)">${rightLetterCracks}</g>
          ${tikeutStrokeMarkup}
          ${rightFragments}
        </g>
        <g class="aff-letter" data-aff-letter="jieut" transform="translate(-1030 -250)" style="opacity:0">
          <path class="aff-letter-stroke" d="M212 186H648" />
          <path class="aff-letter-stroke" d="M430 232C394 336 318 480 202 582" />
          <path class="aff-letter-stroke" d="M430 232C466 336 544 484 660 588" />
        </g>
        <g class="aff-letter" data-aff-letter="chieut" transform="translate(365 -260)" style="opacity:0">
          <path class="aff-letter-stroke" d="M382 100V392" />
          <path class="aff-letter-stroke" d="M150 286H612" />
          <path class="aff-letter-stroke" d="M382 386C342 474 258 540 158 598" />
          <path class="aff-letter-stroke" d="M382 386C422 474 506 540 606 598" />
        </g>
        <g class="aff-letter" data-fric-letter="siot" transform="translate(-1030 -250)" style="opacity:0">
          <path class="aff-letter-stroke" d="M430 186C394 336 318 480 202 582" />
          <path class="aff-letter-stroke" d="M430 186C466 336 544 484 660 588" />
        </g>
        <g class="aff-letter" data-fric-letter="ssangsiot" transform="translate(365 -260)" style="opacity:0">
          <path class="aff-letter-stroke" d="M330 186C294 336 218 480 102 582" />
          <path class="aff-letter-stroke" d="M330 186C355 310 426 450 430 574" />
          <path class="aff-letter-stroke" d="M530 186C505 310 434 450 430 574" />
          <path class="aff-letter-stroke" d="M530 186C566 336 642 480 758 582" />
        </g>
      </svg>
      <div class="sound-dust-layer">${dust}${chips}</div>
    </div>
  `;
}

function buildImpactFragmentMarkup(letter, count, seed) {
  const random = createSeededRandom(seed);
  const items = [];
  const isLeft = letter === "kieuk";
  const anchors = isLeft
    ? [
        [575, 130, 92, 66],
        [575, 340, 88, 76],
        [588, 492, 92, 98],
        [628, 260, 68, 120],
      ]
    : [
        [78, 120, 92, 74],
        [92, 318, 96, 82],
        [96, 524, 110, 78],
        [72, 240, 74, 126],
      ];

  for (let i = 0; i < count; i++) {
    const anchor = anchors[i % anchors.length];
    const isLarge = i > count * 0.68 || random() > 0.76;
    const x = anchor[0] + (random() - 0.5) * anchor[2];
    const y = anchor[1] + (random() - 0.5) * anchor[3];
    const w = isLarge ? 38 + random() * 62 : 14 + random() * 36;
    const h = isLarge ? 28 + random() * 54 : 10 + random() * 28;
    const skew = (random() - 0.5) * (isLarge ? 56 : 34);
    const points = [
      `${x + random() * 16},${y}`,
      `${x + w},${y + random() * 18}`,
      `${x + w - random() * 22},${y + h}`,
      `${x + random() * 26},${y + h - random() * 16}`,
      `${x + skew * 0.18},${y + h * 0.52}`,
    ].join(" ");
    const direction = (isLeft ? -1 : 1) * (0.7 + random() * 1.45);
    const size = Math.min(1, Math.max(0.18, (w * h) / 5600));
    items.push(`
      <polygon
        class="sound-fragment"
        points="${points}"
        fill="#030303"
        data-start="${(random() * 0.18).toFixed(3)}"
        data-dir="${direction.toFixed(3)}"
        data-spin="${((random() - 0.5) * (isLarge ? 520 : 860)).toFixed(2)}"
        data-fall="${(80 + random() * (isLarge ? 320 : 460)).toFixed(2)}"
        data-size="${size.toFixed(3)}"
      />
    `);
  }

  return items.join("");
}

// ���������̸� �ָ� ��ī�Ӱ� ���̴� �տ� �߽ɼ� ��θ� ��ȯ
function growCrack(startX, startY, angle, length, random) {
  const points = [[startX, startY]];
  let cur = angle;
  let remaining = length;
  let total = 0;
  while (remaining > 4) {
    // �⺻ ���� ��鸲
    cur += (random() - 0.5) * 0.45;
    // ���� ������ ��踦 ���� ��ó�� �ް��� ����
    if (random() < 0.18) cur += (random() - 0.5) * 1.1;
    // ���׸�Ʈ ���̸� �ұ����ϰ� (ª�� �Ͱ� �� ���� ����)
    const step = random() < 0.25
      ? 4 + random() * 8        // ª�� ���׸�Ʈ
      : 12 + random() * 22;     // �� ���׸�Ʈ
    const clamp = Math.min(step, remaining);
    const prev = points[points.length - 1];
    const nx = prev[0] + Math.cos(cur) * clamp;
    const ny = prev[1] + Math.sin(cur) * clamp;
    total += Math.hypot(nx - prev[0], ny - prev[1]);
    points.push([nx, ny]);
    remaining -= clamp;
  }
  return { points, length: total };
}

// �߽ɼ��� �������� Ȯ���� ä���� ������ �ٰ��� ����Ʈ ����
// �ʺ�� �������� ���� ? ���� �а� �����Ǵ� ������ �ް��� ������
function expandCrackToPolygon(points, startW, endW) {
  const n = points.length;
  if (n < 2) return null;
  const left = [], right = [];

  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    // ���� ������: t^2.2 ? ������ �а� �������� ��������
    const taper = Math.pow(t, 2.2);
    const hw = (startW * (1 - taper) + endW * taper) * 0.5;

    let tx, ty;
    if (i < n - 1) {
      tx = points[i + 1][0] - points[i][0];
      ty = points[i + 1][1] - points[i][1];
    } else {
      tx = points[i][0] - points[i - 1][0];
      ty = points[i][1] - points[i - 1][1];
    }
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny =  tx / tl;

    left.push( [points[i][0] + nx * hw, points[i][1] + ny * hw]);
    right.push([points[i][0] - nx * hw, points[i][1] - ny * hw]);
  }

  return [...left, ...[...right].reverse()];
}

function buildImpactLetterCrackMarkup(letter, count, seed) {
  const random = createSeededRandom(seed);
  const result = [];
  const isLeft = letter === "kieuk";

  // Collision edge x and inward direction
  const edgeX = isLeft ? 694 : 72;
  const inwardSign = isLeft ? -1 : 1;

  // Stress zones: where horizontal strokes meet the collision edge
  const stressY = isLeft ? [210, 390, 565] : [205, 390, 560];

  stressY.forEach((sy, si) => {
    // 4-6 large irregular broken chunks per stress zone
    const chunkCount = 4 + Math.floor(random() * 3);
    for (let i = 0; i < chunkCount; i++) {
      const spread = Math.pow(random(), 0.55) * 105;
      const cy = sy + (random() > 0.5 ? spread : -spread) * (random() * 0.85 + 0.15);
      const cx = edgeX + inwardSign * (random() * 12);

      // Large irregular polygon chunk — 5~8 vertices
      const vCount = 5 + Math.floor(random() * 4);
      const chunkW = 30 + random() * 75;
      const chunkH = 22 + random() * 62;
      const pts = [];
      for (let v = 0; v < vCount; v++) {
        const baseAngle = (v / vCount) * Math.PI * 2 + (random() - 0.5) * (Math.PI / vCount) * 1.4;
        // Bias chunk to extend inward from the collision edge
        const rx = chunkW * 0.5 * (0.35 + random() * 0.72);
        const ry = chunkH * 0.5 * (0.35 + random() * 0.72);
        const px = cx + inwardSign * Math.abs(Math.cos(baseAngle)) * rx * 0.9 + Math.cos(baseAngle) * rx * 0.35;
        const py = cy + Math.sin(baseAngle) * ry;
        pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      }

      // Randomise shade so chunks look like jagged broken material
      const shade = random();
      const fill = shade < 0.45 ? "#040404" : shade < 0.78 ? "#161616" : "#2a2a2a";
      const delay = (random() * 0.035 + si * 0.01).toFixed(3);

      result.push(
        `<polygon class="sound-letter-crack" points="${pts.join(" ")}" data-delay="${delay}" fill="${fill}" />`,
      );

      // One smaller sub-chunk adjacent to the main chunk (adds rubble texture)
      if (random() < 0.62) {
        const sx2 = cx + inwardSign * (chunkW * 0.3 + random() * chunkW * 0.5);
        const sy2 = cy + (random() - 0.5) * chunkH * 0.9;
        const sw = 12 + random() * 38;
        const sh = 10 + random() * 30;
        const sv = 4 + Math.floor(random() * 3);
        const spts = [];
        for (let v = 0; v < sv; v++) {
          const a = (v / sv) * Math.PI * 2 + (random() - 0.5) * 0.9;
          spts.push(`${(sx2 + Math.cos(a) * sw * (0.4 + random() * 0.6)).toFixed(1)},${(sy2 + Math.sin(a) * sh * (0.4 + random() * 0.6)).toFixed(1)}`);
        }
        const sfill = random() < 0.5 ? "#080808" : "#1e1e1e";
        result.push(
          `<polygon class="sound-letter-crack" points="${spts.join(" ")}" data-delay="${(random() * 0.06 + si * 0.01).toFixed(3)}" fill="${sfill}" />`,
        );
      }
    }
  });

  return result.join("");
}

function buildDustMarkup() {
  const random = createSeededRandom(112);
  const items = [];

  for (let i = 0; i < 96; i++) {
    const originX = (random() - 0.5) * 128;
    const originY = -54 + random() * 142;
    items.push(`
      <span
        class="sound-dust"
        style="--dust-size:${(4 + random() * 22).toFixed(1)}px; --dust-blur:${(2 + random() * 10).toFixed(1)}px"
        data-origin-x="${originX.toFixed(2)}"
        data-origin-y="${originY.toFixed(2)}"
        data-start="${(0.35 + random() * 0.16).toFixed(3)}"
        data-life="${(0.28 + random() * 0.42).toFixed(3)}"
        data-angle="${(random() * Math.PI * 2).toFixed(4)}"
        data-speed="${(60 + random() * 470).toFixed(2)}"
        data-rise="${(10 + random() * 180).toFixed(2)}"
      ></span>
    `);
  }

  return items.join("");
}

function buildChipMarkup() {
  const random = createSeededRandom(143);
  const items = [];

  for (let i = 0; i < 34; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const sideAngle = side < 0 ? Math.PI : 0;
    const downward = i > 20 ? 0.35 + random() * 0.45 : 0.12 + random() * 0.34;
    const angle = sideAngle + side * downward + (random() - 0.5) * 0.34;
    const originX = side * (18 + random() * 74);
    const originY = -36 + random() * 138;
    const isLarge = i > 25 || random() > 0.78;
    const chipWidth = isLarge ? 18 + random() * 34 : 6 + random() * 16;
    const chipHeight = isLarge ? 12 + random() * 26 : 4 + random() * 13;
    items.push(`
      <span
        class="sound-chip"
        style="--chip-w:${chipWidth.toFixed(1)}px; --chip-h:${chipHeight.toFixed(1)}px"
        data-origin-x="${originX.toFixed(2)}"
        data-origin-y="${originY.toFixed(2)}"
        data-start="${(0.35 + random() * 0.1).toFixed(3)}"
        data-angle="${angle.toFixed(4)}"
        data-speed="${(180 + random() * (isLarge ? 560 : 720)).toFixed(2)}"
        data-spin="${((random() - 0.5) * (isLarge ? 780 : 1160)).toFixed(2)}"
      ></span>
    `);
  }

  return items.join("");
}

function initHangulReveal(container, baseSrc, revealSrc, options = {}) {
  if (!container) {
    return;
  }

  const overlayOnly = Boolean(options.overlayOnly);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: overlayOnly,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(overlayOnly ? 0x000000 : 0xe1e1e1, overlayOnly ? 0 : 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const maskScene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const loader = new THREE.TextureLoader();
  const setLoadedImageSize = (texture) => {
    if (texture.image) {
      imageSize.set(texture.image.width || 1920, texture.image.height || 1080);
    }
  };
  const baseTexture = loader.load(baseSrc, setLoadedImageSize);
  const revealTexture = loader.load(revealSrc, setLoadedImageSize);

  [baseTexture, revealTexture].forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
  });

  const pointer = new THREE.Vector2(-10, -10);
  const targetPointer = new THREE.Vector2(-10, -10);
  const velocity = new THREE.Vector2(0, 0);
  const resolution = new THREE.Vector2(1, 1);
  const imageSize = new THREE.Vector2(1920, 1080);
  const coverPosition = new THREE.Vector2(0.5, options.coverPositionY ?? 0.5);
  const widthFit = Boolean(options.widthFit);
  const texelSize = new THREE.Vector2(1, 1);
  let pointerInside = 0;
  let renderTargetA;
  let renderTargetB;
  let lastTime = performance.now();
  let isVisible = true;
  let renderFrame = null;

  function requestRender() {
    if (renderFrame !== null) {
      return;
    }

    renderFrame = requestAnimationFrame(render);
  }

  const vertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const maskMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPrevious: { value: null },
      uPointer: { value: pointer },
      uResolution: { value: resolution },
      uTexel: { value: texelSize },
      uTime: { value: 0 },
      uDelta: { value: 0.016 },
      uRadius: { value: 195 },
      uStrength: { value: 0 },
      uVelocity: { value: velocity },
    },
    vertexShader,
    fragmentShader: `
      precision highp float;

      varying vec2 vUv;

      uniform sampler2D uPrevious;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      uniform vec2 uTexel;
      uniform float uTime;
      uniform float uDelta;
      uniform float uRadius;
      uniform float uStrength;
      uniform vec2 uVelocity;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += noise(p) * amplitude;
          p = p * 2.03 + 17.7;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        float previous = texture2D(uPrevious, vUv).r * 0.52;
        previous += texture2D(uPrevious, vUv + vec2(uTexel.x, 0.0)).r * 0.08;
        previous += texture2D(uPrevious, vUv - vec2(uTexel.x, 0.0)).r * 0.08;
        previous += texture2D(uPrevious, vUv + vec2(0.0, uTexel.y)).r * 0.08;
        previous += texture2D(uPrevious, vUv - vec2(0.0, uTexel.y)).r * 0.08;
        previous += texture2D(uPrevious, vUv + uTexel).r * 0.04;
        previous += texture2D(uPrevious, vUv - uTexel).r * 0.04;
        previous += texture2D(uPrevious, vUv + vec2(uTexel.x, -uTexel.y)).r * 0.04;
        previous += texture2D(uPrevious, vUv + vec2(-uTexel.x, uTexel.y)).r * 0.04;

        vec2 p = vUv - uPointer;
        p.x *= uResolution.x / uResolution.y;

        float radius = uRadius / uResolution.y;
        float angle = atan(p.y, p.x);
        vec2 motion = normalize(uVelocity + vec2(0.0001)) * min(length(uVelocity), 1.0);
        float motionWave = dot(normalize(p + vec2(0.0001)), motion);
        float motionAmount = min(length(uVelocity) * 2.4, 1.0);
        float idleFlow = fbm(vec2(angle * 2.1 + uTime * 0.16, length(p) * 10.0 + uTime * 0.1));
        float ripple = fbm(vec2(angle * 1.35 + uTime * 0.12 + motionWave * 0.28, length(p) * 8.0 - uTime * 0.08));
        float fiber = fbm(p * 15.0 + motion * 1.6 + vec2(uTime * 0.055, -uTime * 0.04));
        float absorbFiber = fbm(p * 34.0 - motion * 2.2 + vec2(-uTime * 0.095, uTime * 0.07));
        float organicRadius = radius * (0.88 + ripple * 0.14 + fiber * 0.055 + (absorbFiber - 0.5) * 0.055 * motionAmount + (idleFlow - 0.5) * 0.04);
        float d = length(p);
        float core = 1.0 - smoothstep(organicRadius * 0.36, organicRadius * 0.78, d);
        float absorb = 1.0 - smoothstep(organicRadius * 0.68, organicRadius * 1.02, d);
        float feather = smoothstep(0.2, 0.72, fiber * 0.66 + absorbFiber * 0.22 + idleFlow * 0.12);
        float ink = max(core, absorb * feather * 0.86);

        float decay = exp(-uDelta * 1.05);
        float mask = max(previous * decay, ink * uStrength);
        mask = clamp(mask, 0.0, 1.0);

        gl_FragColor = vec4(vec3(mask), 1.0);
      }
    `,
  });

  const displayMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: baseTexture },
      uReveal: { value: revealTexture },
      uMask: { value: null },
      uResolution: { value: resolution },
      uImageSize: { value: imageSize },
      uCoverPosition: { value: coverPosition },
      uWidthFit: { value: widthFit ? 1 : 0 },
      uTexel: { value: texelSize },
      uPointer: { value: pointer },
      uVelocity: { value: velocity },
      uTime: { value: 0 },
      uOverlayOnly: { value: overlayOnly ? 1 : 0 },
    },
    vertexShader,
    fragmentShader: `
      precision highp float;

      varying vec2 vUv;

      uniform sampler2D uBase;
      uniform sampler2D uReveal;
      uniform sampler2D uMask;
      uniform vec2 uResolution;
      uniform vec2 uImageSize;
      uniform vec2 uCoverPosition;
      uniform float uWidthFit;
      uniform vec2 uTexel;
      uniform vec2 uPointer;
      uniform vec2 uVelocity;
      uniform float uTime;
      uniform float uOverlayOnly;

      vec2 coverUv(vec2 uv) {
        float screenAspect = uResolution.x / uResolution.y;
        float imageAspect = uImageSize.x / uImageSize.y;
        vec2 visibleSize = vec2(1.0);

        if (screenAspect > imageAspect) {
          visibleSize.y = imageAspect / screenAspect;
        } else {
          visibleSize.x = screenAspect / imageAspect;
        }

        vec2 offset = vec2(
          (1.0 - visibleSize.x) * uCoverPosition.x,
          (1.0 - visibleSize.y) * (1.0 - uCoverPosition.y)
        );

        return uv * visibleSize + offset;
      }

      float luminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      float hash(vec2 p) {
        p = fract(p * vec2(234.21, 83.17));
        p += dot(p, p + 19.19);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += noise(p) * amplitude;
          p = p * 2.0 + 11.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 imageUv = coverUv(vUv);
        if (uWidthFit > 0.5) {
          float imageAspect = uImageSize.x / uImageSize.y;
          float visibleHeight = clamp((uResolution.y * imageAspect) / uResolution.x, 0.0, 1.0);
          imageUv = vec2(vUv.x, mix(1.0 - visibleHeight, 1.0, vUv.y));
        }

        float mask = texture2D(uMask, vUv).r;
        float maskLeft = texture2D(uMask, vUv - vec2(uTexel.x, 0.0)).r;
        float maskRight = texture2D(uMask, vUv + vec2(uTexel.x, 0.0)).r;
        float maskDown = texture2D(uMask, vUv - vec2(0.0, uTexel.y)).r;
        float maskUp = texture2D(uMask, vUv + vec2(0.0, uTexel.y)).r;

        vec2 flow = vec2(maskLeft - maskRight, maskDown - maskUp);
        vec2 pointerFlow = normalize(uVelocity + vec2(0.0001)) * min(length(uVelocity), 1.0);
        float edgePulse = smoothstep(0.04, 0.34, mask) * (1.0 - smoothstep(0.38, 0.78, mask));
        float livingNoise = fbm(imageUv * 8.0 + flow * 1.35 + pointerFlow * 1.55 + vec2(uTime * 0.075, -uTime * 0.055));
        float paperAbsorb = fbm(imageUv * 32.0 - pointerFlow * 2.0 + vec2(-uTime * 0.1, uTime * 0.075));
        float idleAbsorb = fbm(imageUv * 18.0 + flow * 1.8 + vec2(uTime * 0.065, uTime * 0.05));
        vec2 displacement = (flow * 0.0035 + pointerFlow * 0.0018 + (livingNoise - 0.5) * 0.0018) * mask;
        displacement += pointerFlow * edgePulse * (paperAbsorb - 0.32) * 0.0045;
        displacement += flow * edgePulse * (idleAbsorb - 0.5) * 0.0035;

        vec3 baseColor = vec3(0.88235294);
        vec3 revealColor = texture2D(uReveal, imageUv + displacement).rgb;

        float heightCenter = luminance(revealColor);
        float heightX = luminance(texture2D(uReveal, imageUv + displacement + vec2(0.0018, 0.0)).rgb);
        float heightY = luminance(texture2D(uReveal, imageUv + displacement + vec2(0.0, 0.0018)).rgb);
        vec3 normal = normalize(vec3((heightCenter - heightX) * 5.8 + flow.x * 2.2, (heightCenter - heightY) * 5.8 + flow.y * 2.2, 0.72));
        vec3 lightDirection = normalize(vec3(-0.38, 0.56, 0.74));
        float diffuse = clamp(dot(normal, lightDirection), 0.0, 1.0);
        float rim = pow(1.0 - clamp(normal.z, 0.0, 1.0), 2.0);

        float reveal = smoothstep(0.08, 0.58, mask);
        float edge = edgePulse * (0.72 + paperAbsorb * 0.18 + idleAbsorb * 0.1);
        float breath = 0.982 + sin(uTime * 0.72 + livingNoise * 3.14) * 0.018;
        reveal *= breath;

        vec3 lifted = revealColor;
        lifted += diffuse * 0.11 * reveal;
        lifted -= (1.0 - diffuse) * 0.13 * reveal;
        lifted += rim * 0.055 * reveal;
        lifted -= edge * vec3(0.032, 0.03, 0.026);

        vec3 color = mix(baseColor, lifted, clamp(reveal, 0.0, 1.0));
        color += edge * vec3(0.018);
        vec3 overlayColor = lifted + edge * vec3(0.018);
        float alpha = mix(1.0, clamp(reveal, 0.0, 1.0), uOverlayOnly);

        gl_FragColor = vec4(mix(color, overlayColor, uOverlayOnly), alpha);
      }
    `,
  });

  const maskQuad = new THREE.Mesh(geometry, maskMaterial);
  const displayQuad = new THREE.Mesh(geometry, displayMaterial);
  maskScene.add(maskQuad);
  scene.add(displayQuad);

  function createTarget(width, height) {
    return new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.max(1, Math.floor(width * dpr));
    const targetHeight = Math.max(1, Math.floor(height * dpr));

    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    resolution.set(width, height);
    texelSize.set(1 / targetWidth, 1 / targetHeight);
    maskMaterial.uniforms.uRadius.value = Math.min(220, Math.max(158, Math.min(width, height) * 0.24));

    if (renderTargetA) {
      renderTargetA.dispose();
      renderTargetB.dispose();
    }

    renderTargetA = createTarget(targetWidth, targetHeight);
    renderTargetB = createTarget(targetWidth, targetHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.setRenderTarget(renderTargetA);
    renderer.clear();
    renderer.setRenderTarget(renderTargetB);
    renderer.clear();
    renderer.setRenderTarget(null);
    renderer.setClearColor(overlayOnly ? 0x000000 : 0xe1e1e1, overlayOnly ? 0 : 1);
    maskMaterial.uniforms.uPrevious.value = renderTargetA.texture;
    displayMaterial.uniforms.uMask.value = renderTargetA.texture;
  }

  function setPointer(event) {
    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    const isInside = x >= 0 && x <= 1 && y >= 0 && y <= 1;

    if (isInside) {
      targetPointer.set(x, y);
    }

    pointerInside = isInside ? 1 : 0;
  }

  window.addEventListener("pointermove", setPointer);
  window.addEventListener("pointerleave", () => {
    pointerInside = 0;
  });
  window.addEventListener("resize", resize);

  resize();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          lastTime = performance.now();
          requestRender();
        }
      },
      { rootMargin: "15% 0px" },
    );

    observer.observe(container);
  }

  function render(now) {
    renderFrame = null;

    if (!isVisible) {
      return;
    }

    const delta = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    pointer.lerp(targetPointer, 1 - Math.pow(0.00008, delta));
    velocity.subVectors(targetPointer, pointer).multiplyScalar(10);

    maskMaterial.uniforms.uTime.value = now * 0.001;
    maskMaterial.uniforms.uDelta.value = delta;
    maskMaterial.uniforms.uStrength.value = pointerInside;
    maskMaterial.uniforms.uPrevious.value = renderTargetA.texture;

    renderer.setRenderTarget(renderTargetB);
    renderer.render(maskScene, camera);
    renderer.setRenderTarget(null);

    const swap = renderTargetA;
    renderTargetA = renderTargetB;
    renderTargetB = swap;

    displayMaterial.uniforms.uTime.value = now * 0.001;
    displayMaterial.uniforms.uMask.value = renderTargetA.texture;
    renderer.render(scene, camera);

    requestRender();
  }

  requestRender();
}

if (enablePointerReveal) {
  initHangulReveal(heroWebgl, "./assets/images/hero/hangeul-base.png", "./assets/images/hero/hangeul-reveal.png");
}

if (enablePointerReveal && storyPageIntro) {
  const storyIntroWebgl = document.createElement("div");
  storyIntroWebgl.className = "story-intro-webgl";
  storyIntroWebgl.setAttribute("aria-hidden", "true");
  storyPageIntro.prepend(storyIntroWebgl);
  initHangulReveal(
    storyIntroWebgl,
    "./assets/images/story/story-bg-flat.webp",
    "./assets/images/story/story-bg-base.webp",
    { widthFit: true },
  );
}

if (soundInteractionSticky) {
  initSoundCollisionInteraction(soundInteractionSticky);
}

if (enablePointerReveal && soundInteractionSticky) {
  const soundInteractionWebgl = document.createElement("div");
  soundInteractionWebgl.className = "sound-interaction-webgl";
  soundInteractionWebgl.setAttribute("aria-hidden", "true");
  soundInteractionSticky.prepend(soundInteractionWebgl);
  initHangulReveal(
    soundInteractionWebgl,
    "./assets/images/story/story-bg-flat.webp",
    "./assets/images/story/story-bg-base.webp",
    { widthFit: true },
  );
  try {
    initSoundCollisionExperience();
  } catch (error) {
    console.error("Sound collision interaction failed to initialize.", error);
  }
}

if (enablePointerReveal) {
  initHangulReveal(
    kingPeopleWebgl,
    "./assets/images/hero/hangeul-base.png",
    "./assets/images/hero/hangeul-reveal.png",
  );
  initHangulReveal(
    kingPeopleHeartWebgl,
    "./assets/images/king-people/king-people-bg-02.webp",
    "./assets/images/king-people/king-people-bg-02.webp",
  );
}


// Record 3D ?�기??카루?� (Codrops 구조)
(function initRecordCarousel() {
  const scenes = document.querySelectorAll(".scene-wrapper .scene");
  if (!scenes.length) return;

  function setupCells(scene) {
    const carousel = scene.querySelector(".carousel");
    const cells    = carousel.querySelectorAll(".carousel__cell");
    const radius   = (parseFloat(scene.dataset.radius) || 400) / 1920 * 100;
    const step     = 360 / cells.length;
    cells.forEach((cell, i) => {
      cell.style.transform = `rotateY(${i * step}deg) translateZ(${radius.toFixed(3)}vw)`;
    });
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ?�크롤과 ?�전 분리???�전 ?�태
  const rot = Array.from(scenes).map(() => ({ current: 0, target: 0 }));
  let rafId = null;
  let scrollFrameId = null;

  function render() {
    let needs = false;
    scenes.forEach((scene, i) => {
      const r = rot[i];
      r.current = lerp(r.current, r.target, 0.07);
      scene.querySelector(".carousel").style.transform = `rotateY(${-360 * r.current}deg)`;
      if (Math.abs(r.current - r.target) > 0.0003) needs = true;
    });
    rafId = needs ? requestAnimationFrame(render) : null;
  }

  // �?scene??viewport 중앙???�마??가까운지 (0=멀??1=?�중??
  function getActiveFactor(scene) {
    const rect  = scene.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return 0;
    const center = rect.top + rect.height / 2;
    const dist   = Math.abs(center - window.innerHeight / 2);
    const zone   = window.innerHeight * 0.55;
    return Math.max(0, 1 - dist / zone);
  }

  function updateCarouselFromScroll() {
    scenes.forEach((scene, i) => {
      const rect = scene.getBoundingClientRect();
      const inView = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!inView) return;

      const f = getActiveFactor(scene);
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      rot[i].target = progress * (0.72 + f * 0.38);
    });

    if (!rafId) rafId = requestAnimationFrame(render);
  }

  function requestCarouselScrollUpdate() {
    if (scrollFrameId !== null) {
      return;
    }

    scrollFrameId = requestAnimationFrame(() => {
      scrollFrameId = null;
      updateCarouselFromScroll();
    });
  }

  window.addEventListener("scroll", requestCarouselScrollUpdate, { passive: true });
  window.addEventListener("resize", updateCarouselFromScroll);

  scenes.forEach(setupCells);
  updateCarouselFromScroll();
  render();
})();

if (enableMenuInkOverlay) {
  initInkOverlay(inkOverlay, siteMenu);
}
