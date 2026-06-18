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

const storyPageChange = document.querySelector(".story-page-change");
const storyChangeTextPanel = document.querySelector(".story-change-text-panel");
const changeObjects = Array.from(document.querySelectorAll(".change-object"));

const inkOverlay = document.querySelector(".ink-overlay");
const siteMenu = document.querySelector(".site-menu");

const gsapInstance = window.gsap || null;


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
  initialTitle.style.transform = `translate3d(0, ${-34 * initialProgress}px, 0)`;
  nextTitle.style.opacity = `${nextProgress}`;
  nextTitle.style.transform = `translate3d(0, ${34 * (1 - nextProgress)}px, 0)`;
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
  const objectGap = Math.min(170, Math.max(88, window.innerHeight * 0.1));
  const objectTop = Math.min(window.innerHeight * 0.82, textRect.bottom + objectGap);
  storyPageChange.style.setProperty("--change-object-top", `${objectTop}px`);

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
    object.style.filter = blur > 0.1 ? `blur(${blur}px)` : "";
    object.style.zIndex = `${changeObjects.length - index}`;
    object.style.transform = `translate3d(-50%, calc(-50% + ${translateY}px), 0) scale(${scale})`;
  });
}

setHeroTitleStep();
window.addEventListener("scroll", setHeroTitleStep, { passive: true });
window.addEventListener("resize", setHeroTitleStep);

setChangeObjectInteraction();
window.addEventListener("scroll", setChangeObjectInteraction, { passive: true });
window.addEventListener("resize", setChangeObjectInteraction);
window.addEventListener("load", setChangeObjectInteraction);

function setKingPeopleScene() {
  if (!kingPeopleSection || !kingPeopleVideoScene || !kingPeopleVideoFrame) {
    return;
  }

  const rect = kingPeopleSection.getBoundingClientRect();
  const scrollableDistance = Math.max(1, kingPeopleSection.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const maskProgress = smoothProgress(progress, 0.02, 0.82);
  const videoOpacity = smoothProgress(progress, 0.25, 0.42);
  const copyProgress = smoothProgress(progress, 0.84, 0.96);
  const frameFillOpacity = Math.max(0, Math.min(0.38, maskProgress * (1 - videoOpacity) * 0.38));
  const videoMaskSize = 1 + maskProgress * 99;
  const videoOffset = (1 - videoOpacity) * 5;
  const copyOffset = (1 - copyProgress) * 34;

  kingPeopleSection.style.setProperty("--king-video-mask-size", `${videoMaskSize.toFixed(2)}%`);
  kingPeopleSection.style.setProperty("--king-frame-fill-opacity", frameFillOpacity.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-opacity", videoOpacity.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-offset", `${videoOffset.toFixed(2)}svh`);
  kingPeopleSection.style.setProperty("--king-video-copy-opacity", copyProgress.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-copy-offset", `${copyOffset.toFixed(2)}px`);
}

setKingPeopleScene();
window.addEventListener("scroll", setKingPeopleScene, { passive: true });
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
window.addEventListener("scroll", setSoundInteractionPin, { passive: true });
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

        cracks.forEach((crackLine) => {
          const lineProgress = Math.min(1, Math.max(0, (progress - crackLine.delay) / 0.34));
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
    group.scale.setScalar(window.matchMedia("(max-width: 768px)").matches ? 0.76 : 1.08);
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

    const particleCount = window.matchMedia("(max-width: 768px)").matches ? 760 : 1900;
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
        uSize: { value: window.matchMedia("(max-width: 768px)").matches ? 0.045 : 0.032 },
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia("(max-width: 768px)").matches ? 1.25 : 1.75));
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
      { rootMargin: "80% 0px" },
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

      // 담묵(blobA) 전용 — 블러를 적게 줄 레이어
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

      // 중담묵 전용
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

      // 중묵 + 농묵
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

        // 담묵: σ ≈ 1px
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

        // 중담묵: σ ≈ 5px
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

        // 중묵/농묵: σ ≈ 12px
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

  menuEl.addEventListener("mouseenter", () => {
    targetProgress = 0.6;
    menuEl.classList.add("ink-active");
  });

  menuEl.addEventListener("mouseleave", () => {
    targetProgress = 0;
  });

  function render(now) {
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

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
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

  function render(now) {
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

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

initHangulReveal(heroWebgl, "./assets/images/hero/hangeul-base.png", "./assets/images/hero/hangeul-reveal.png");
if (storyPageIntro) {
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

initInkOverlay(inkOverlay, siteMenu);
