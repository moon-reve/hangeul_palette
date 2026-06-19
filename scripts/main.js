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
let heroTitleAnimationFrame = null;
let heroTitleAnimationStart = null;
let heroTitleAnimationFrom = 0;
let heroTitleAnimationTo = 0;
let heroTitleAutoProgress = 0;
const HERO_TITLE_AUTO_DURATION = 860;
let kingPeopleMaskAnimationFrame = null;
let kingPeopleMaskAnimationStart = null;
let kingPeopleMaskAutoProgress = 0;
let kingPeopleCopyAnimationFrame = null;
let kingPeopleCopyAnimationStart = null;
let kingPeopleCopyAnimationFrom = 0;
let kingPeopleCopyAnimationTo = 0;
let kingPeopleCopyAutoProgress = 0;
const KING_PEOPLE_MASK_FINAL_SIZE = 100;
const KING_PEOPLE_MASK_AUTO_DURATION = 1400;
const KING_PEOPLE_COPY_AUTO_DURATION = 820;
let changeObjectStep = -1;
let changeObjectProgress = 0;
let changeObjectAnimationFrame = null;
let changeObjectAnimationStart = null;
let changeObjectAnimationFrom = 0;
let changeObjectAnimationTo = 0;
const CHANGE_OBJECT_STEP_DISTANCE = 0.2;
const CHANGE_OBJECT_STEP_CENTER_OFFSET = 0.16;
const CHANGE_OBJECT_AUTO_DURATION = 760;

function updateScrollLinkedScenes() {
  setHeroTitleStep();
  setChangeObjectInteraction();
  setHeartVideoInteraction();
  setKingPeopleScene();
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


function animateHeroTitle(now) {
  if (heroTitleAnimationStart === null) {
    heroTitleAnimationStart = now;
  }

  const elapsed = now - heroTitleAnimationStart;
  const progress = Math.min(1, elapsed / HERO_TITLE_AUTO_DURATION);
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  heroTitleAutoProgress = heroTitleAnimationFrom + (heroTitleAnimationTo - heroTitleAnimationFrom) * easedProgress;
  setHeroTitleStep();

  if (progress < 1) {
    heroTitleAnimationFrame = requestAnimationFrame(animateHeroTitle);
  } else {
    heroTitleAutoProgress = heroTitleAnimationTo;
    heroTitleAnimationFrame = null;
    heroTitleAnimationStart = null;
    setHeroTitleStep();
  }
}

function goToHeroTitleProgress(progress) {
  const nextProgress = Math.min(1, Math.max(0, progress));

  if (nextProgress === heroTitleAutoProgress || heroTitleAnimationFrame !== null) {
    return;
  }

  heroTitleAnimationStart = null;
  heroTitleAnimationFrom = heroTitleAutoProgress;
  heroTitleAnimationTo = nextProgress;
  heroTitleAnimationFrame = requestAnimationFrame(animateHeroTitle);
}

function handleHeroWheel(event) {
  if (!hero) {
    return;
  }

  const rect = hero.getBoundingClientRect();
  const isActive = rect.top <= 0 && rect.bottom > window.innerHeight;

  if (!isActive) {
    return;
  }

  if (heroTitleAnimationFrame !== null) {
    event.preventDefault();
    return;
  }

  if (event.deltaY > 0 && heroTitleAutoProgress < 1) {
    event.preventDefault();
    goToHeroTitleProgress(1);
    return;
  }

  if (event.deltaY < 0 && heroTitleAutoProgress > 0) {
    event.preventDefault();
    goToHeroTitleProgress(0);
  }
}

function setHeroTitleStep() {
  if (!hero || !initialTitle || !nextTitle) {
    return;
  }

  const progress = heroTitleAutoProgress;
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

function getChangeObjectTargetProgress(step) {
  if (step < 0) {
    return 0;
  }

  return step * CHANGE_OBJECT_STEP_DISTANCE + CHANGE_OBJECT_STEP_CENTER_OFFSET;
}

function easeChangeObjectProgress(value) {
  return 1 - Math.pow(1 - value, 3);
}

function animateChangeObjectProgress(now) {
  if (changeObjectAnimationStart === null) {
    changeObjectAnimationStart = now;
  }

  const elapsed = now - changeObjectAnimationStart;
  const progress = Math.min(1, elapsed / CHANGE_OBJECT_AUTO_DURATION);
  const easedProgress = easeChangeObjectProgress(progress);
  changeObjectProgress = changeObjectAnimationFrom + (changeObjectAnimationTo - changeObjectAnimationFrom) * easedProgress;
  setChangeObjectInteraction();

  if (progress < 1) {
    changeObjectAnimationFrame = requestAnimationFrame(animateChangeObjectProgress);
  } else {
    changeObjectProgress = changeObjectAnimationTo;
    changeObjectAnimationFrame = null;
    changeObjectAnimationStart = null;
    setChangeObjectInteraction();
  }
}

function goToChangeObjectStep(step) {
  const maxStep = changeObjects.length - 1;
  const nextStep = Math.min(maxStep, Math.max(-1, step));

  if (nextStep === changeObjectStep || changeObjectAnimationFrame !== null) {
    return;
  }

  changeObjectStep = nextStep;
  changeObjectAnimationStart = null;
  changeObjectAnimationFrom = changeObjectProgress;
  changeObjectAnimationTo = getChangeObjectTargetProgress(nextStep);
  changeObjectAnimationFrame = requestAnimationFrame(animateChangeObjectProgress);
}

function setChangeObjectInteraction() {
  if (!storyPageChange || !storyChangeTextPanel || !changeObjects.length) {
    return;
  }

  const rect = storyPageChange.getBoundingClientRect();
  const scrollableDistance = Math.max(1, storyPageChange.offsetHeight - window.innerHeight);
  const scrollProgress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const releaseProgress = 0.92;
  const isPinned = rect.top <= 0 && scrollProgress < releaseProgress && rect.bottom > window.innerHeight;
  const isReleased = rect.top <= 0 && scrollProgress >= releaseProgress;

  if (scrollProgress <= 0 && rect.top > 0) {
    changeObjectStep = -1;
    changeObjectProgress = 0;
  }

  if (isReleased && changeObjectAnimationFrame === null) {
    changeObjectStep = changeObjects.length - 1;
    changeObjectProgress = getChangeObjectTargetProgress(changeObjectStep);
  }

  storyPageChange.classList.toggle("is-change-pinned", isPinned);
  storyPageChange.classList.toggle("is-change-released", isReleased);

  storyPageChange.style.setProperty("--change-object-top", "50svh");

  const objectProgress = changeObjectProgress;

  changeObjects.forEach((object, index) => {
    const start = index * CHANGE_OBJECT_STEP_DISTANCE;
    const end = start + 0.32;
    const localProgress = Math.min(1, Math.max(0, (objectProgress - start) / (end - start)));
    const approachProgress = smoothProgress(localProgress, 0, 0.42);
    const exitProgress = smoothProgress(localProgress, 0.58, 1);
    const visibility = isPinned ? Math.max(0, Math.min(1, approachProgress * (1 - exitProgress) * 1.35)) : 0;
    const translateY = 150 * (1 - approachProgress) - 110 * exitProgress;
    const scale = 0.46 + approachProgress * 0.72 + exitProgress * 1.65;
    const blur = exitProgress * 5;

    object.style.opacity = String(visibility);
    object.style.filter = blur > 0.1 ? "blur(" + (blur / 1920 * 100).toFixed(3) + "vw)" : "";
    object.style.zIndex = String(changeObjects.length - index);
    object.style.transform = "translate3d(-50%, calc(-50% + " + (translateY / 1920 * 100).toFixed(3) + "vw), 0) scale(" + scale + ")";
  });
}

function handleChangeObjectWheel(event) {
  if (!storyPageChange || !changeObjects.length) {
    return;
  }

  const rect = storyPageChange.getBoundingClientRect();
  const scrollableDistance = Math.max(1, storyPageChange.offsetHeight - window.innerHeight);
  const scrollProgress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const isActive = rect.top <= 0 && scrollProgress < 0.92 && rect.bottom > window.innerHeight;

  if (!isActive) {
    return;
  }

  if (changeObjectAnimationFrame !== null) {
    event.preventDefault();
    return;
  }

  const direction = event.deltaY > 0 ? 1 : -1;
  const maxStep = changeObjects.length - 1;

  if (direction > 0 && changeObjectStep < maxStep) {
    event.preventDefault();
    goToChangeObjectStep(changeObjectStep + 1);
    return;
  }

  if (direction < 0 && changeObjectStep > 0) {
    event.preventDefault();
    goToChangeObjectStep(changeObjectStep - 1);
  }
}

setHeroTitleStep();
window.addEventListener("scroll", requestScrollLinkedUpdate, { passive: true });
window.addEventListener("wheel", handleHeroWheel, { passive: false });
window.addEventListener("resize", setHeroTitleStep);

setChangeObjectInteraction();
window.addEventListener("wheel", handleChangeObjectWheel, { passive: false });
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

function startKingPeopleMaskAnimation() {
  if (kingPeopleMaskAutoProgress >= 1 || kingPeopleMaskAnimationFrame !== null) {
    return;
  }

  kingPeopleMaskAnimationStart = null;
  kingPeopleMaskAnimationFrame = requestAnimationFrame(animateKingPeopleMask);
}

function animateKingPeopleMask(now) {
  if (kingPeopleMaskAnimationStart === null) {
    kingPeopleMaskAnimationStart = now - kingPeopleMaskAutoProgress * KING_PEOPLE_MASK_AUTO_DURATION;
  }

  const elapsed = now - kingPeopleMaskAnimationStart;
  kingPeopleMaskAutoProgress = Math.min(1, elapsed / KING_PEOPLE_MASK_AUTO_DURATION);
  setKingPeopleScene();

  if (kingPeopleMaskAutoProgress < 1) {
    kingPeopleMaskAnimationFrame = requestAnimationFrame(animateKingPeopleMask);
  } else {
    kingPeopleMaskAnimationFrame = null;
  }
}

function animateKingPeopleCopy(now) {
  if (kingPeopleCopyAnimationStart === null) {
    kingPeopleCopyAnimationStart = now;
  }

  const elapsed = now - kingPeopleCopyAnimationStart;
  const progress = Math.min(1, elapsed / KING_PEOPLE_COPY_AUTO_DURATION);
  const easedProgress = easeChangeObjectProgress(progress);
  kingPeopleCopyAutoProgress = kingPeopleCopyAnimationFrom + (kingPeopleCopyAnimationTo - kingPeopleCopyAnimationFrom) * easedProgress;
  setKingPeopleScene();

  if (progress < 1) {
    kingPeopleCopyAnimationFrame = requestAnimationFrame(animateKingPeopleCopy);
  } else {
    kingPeopleCopyAutoProgress = kingPeopleCopyAnimationTo;
    kingPeopleCopyAnimationFrame = null;
    kingPeopleCopyAnimationStart = null;
    setKingPeopleScene();
  }
}

function goToKingPeopleCopyProgress(progress) {
  const nextProgress = Math.min(1, Math.max(0, progress));

  if (nextProgress === kingPeopleCopyAutoProgress || kingPeopleCopyAnimationFrame !== null) {
    return;
  }

  kingPeopleCopyAnimationStart = null;
  kingPeopleCopyAnimationFrom = kingPeopleCopyAutoProgress;
  kingPeopleCopyAnimationTo = nextProgress;
  kingPeopleCopyAnimationFrame = requestAnimationFrame(animateKingPeopleCopy);
}

function handleKingPeopleWheel(event) {
  if (!kingPeopleSection) {
    return;
  }

  const rect = kingPeopleSection.getBoundingClientRect();
  const isActive = rect.top <= 0 && rect.bottom > window.innerHeight * 0.28;

  if (!isActive) {
    return;
  }

  if (kingPeopleMaskAnimationFrame !== null || kingPeopleCopyAnimationFrame !== null) {
    event.preventDefault();
    return;
  }

  if (event.deltaY > 0 && kingPeopleMaskAutoProgress >= 1 && kingPeopleCopyAutoProgress < 1) {
    event.preventDefault();
    goToKingPeopleCopyProgress(1);
    return;
  }

  if (event.deltaY < 0 && kingPeopleCopyAutoProgress > 0) {
    event.preventDefault();
    goToKingPeopleCopyProgress(0);
  }
}

function setKingPeopleScene() {
  if (!kingPeopleSection || !kingPeopleVideoScene || !kingPeopleVideoFrame) {
    return;
  }

  const rect = kingPeopleSection.getBoundingClientRect();
  const scrollableDistance = Math.max(1, kingPeopleSection.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const hasEnteredVideoScene = progress > 0.02 && rect.bottom > window.innerHeight * 0.28;

  if (progress <= 0 && rect.top > 0) {
    kingPeopleMaskAutoProgress = 0;
    kingPeopleMaskAnimationStart = null;
    kingPeopleCopyAutoProgress = 0;
    kingPeopleCopyAnimationStart = null;
  }

  if (hasEnteredVideoScene) {
    startKingPeopleMaskAnimation();
  }

  const maskProgress = smoothProgress(kingPeopleMaskAutoProgress, 0, 1);
  const videoOpacity = smoothProgress(kingPeopleMaskAutoProgress, 0.24, 0.72);
  const copyProgress = smoothProgress(kingPeopleCopyAutoProgress, 0, 1);
  const frameFillOpacity = Math.max(0, Math.min(0.38, maskProgress * (1 - videoOpacity) * 0.38));
  const videoMaskSize = 1 + maskProgress * (KING_PEOPLE_MASK_FINAL_SIZE - 1);
  const videoOffset = (1 - videoOpacity) * 5;
  const copyOffset = (1 - copyProgress) * (18 / 1920 * 100);
  const scrimOpacity = copyProgress * 0.7;

  kingPeopleSection.style.setProperty("--king-video-mask-size", videoMaskSize.toFixed(2) + "%");
  kingPeopleSection.style.setProperty("--king-frame-fill-opacity", frameFillOpacity.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-opacity", videoOpacity.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-offset", videoOffset.toFixed(2) + "svh");
  kingPeopleSection.style.setProperty("--king-video-scrim-opacity", scrimOpacity.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-copy-opacity", copyProgress.toFixed(3));
  kingPeopleSection.style.setProperty("--king-video-copy-offset", copyOffset.toFixed(3) + "vw");
}

setKingPeopleScene();
window.addEventListener("wheel", handleKingPeopleWheel, { passive: false });
window.addEventListener("resize", setKingPeopleScene);

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
