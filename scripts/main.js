import * as THREE from "../assets/vendor/three.module.js";

const hero = document.querySelector(".hero");
const initialTitle = document.querySelector(".hero-title-initial");
const nextTitle = document.querySelector(".hero-title-next");
const kingPeopleSection = document.querySelector(".section-king-people");
const kingPeopleVideoScene = document.querySelector(".king-people-scene-video");
const kingPeopleVideoFrame = document.querySelector(".king-people-video-frame");
const kingPeopleHeartSection = document.querySelector(".section-king-heart");
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
let kingPeopleHeartAnimationFrame = null;
let kingPeopleHeartAnimationStart = null;
let kingPeopleHeartAnimationFrom = 0;
let kingPeopleHeartAnimationTo = 0;
let kingPeopleHeartTextProgress = 0;
const KING_PEOPLE_HEART_TEXT_DURATION = 860;
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
  setKingPeopleHeartText();
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
      opacity: 0,
    });

    if (routeFlow) {
      gsapInstance.set(routeFlow, {
        strokeDasharray: routeLength,
        strokeDashoffset: routeLength,
        opacity: 1,
      });
    }

    return { route, routeLength, routeFlow };
  });

  // Irregular left-right order: L, R, L, R, R, L — avoids predictable alternation
  const flowOrder = [0, 2, 3, 5, 1, 4];
  const flowDuration = 0.55;
  const flowStagger = flowDuration * 0.7;

  flowOrder.forEach((routeIndex, orderIndex) => {
    const { routeFlow } = routeMetrics[routeIndex];
    if (!routeFlow) return;

    timeline.to(routeFlow, {
      strokeDashoffset: 0,
      duration: flowDuration,
      ease: "power2.inOut",
    }, orderIndex * flowStagger);
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

  let mapHovered = false;

  window.addEventListener("mousemove", (e) => {
    const rect = worldMapInteraction.getBoundingClientRect();
    const inRange = e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (inRange && !mapHovered) {
      mapHovered = true;
      timeline.timeScale(1).play();
    } else if (!inRange && mapHovered) {
      mapHovered = false;
      timeline.timeScale(3).reverse();
    }
  });

  window.addEventListener("mouseleave", () => {
    if (mapHovered) {
      mapHovered = false;
      timeline.timeScale(3).reverse();
    }
  });

  worldMapInteraction.addEventListener("focusin", () => timeline.timeScale(1).play());
  worldMapInteraction.addEventListener("focusout", () => timeline.timeScale(3).reverse());
}

initWorldMapInteraction();

function initRecordCylinderReveal() {
  const clip = document.querySelector(".record-cylinder-clip");
  const items = Array.from(document.querySelectorAll(".record-cylinder-item"));
  if (!clip || !items.length) return;

  items.forEach(item => {
    const inner = document.createElement("div");
    inner.className = "record-reveal-inner";
    while (item.firstChild) inner.appendChild(item.firstChild);
    item.appendChild(inner);
  });

  const inners = Array.from(document.querySelectorAll(".record-reveal-inner"));

  const order = inners.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const shuffled = order.map(i => inners[i]);

  const offsets = [
    { x: -28, y: 0 }, { x: 28, y: 0 }, { x: 0, y: -28 }, { x: 0, y: 28 },
    { x: 28, y: 0 }, { x: -28, y: 0 }, { x: 0, y: 28 }, { x: 0, y: -28 },
    { x: -28, y: 0 }, { x: 0, y: 28 }, { x: 28, y: 0 }, { x: 0, y: -28 },
    { x: -28, y: 0 },
  ];

  shuffled.forEach((inner, i) => {
    const d = offsets[i];
    inner.style.opacity = "0";
    inner.style.transform = `translate(${d.x}px, ${d.y}px)`;
    inner.style.transition = "opacity 0.42s ease, transform 0.42s ease";
  });

  let revealedCount = 0;
  let wheelAccum = 0;
  let isPinned = false;
  let exitAccum = 0;
  let targetScrollY = null;
  const WHEEL_PER_IMAGE = 100;
  const EXIT_THRESHOLD = 60;

  function getTarget() {
    if (targetScrollY === null) {
      targetScrollY = Math.round(clip.getBoundingClientRect().top + window.scrollY);
    }
    return targetScrollY;
  }

  function pin() {
    if (isPinned) return;
    isPinned = true;
    exitAccum = 0;
    wheelAccum = revealedCount * WHEEL_PER_IMAGE;
    window.scrollTo({ top: getTarget(), left: window.scrollX, behavior: "instant" });
  }

  function unpin() {
    if (!isPinned) return;
    isPinned = false;
  }

  window.addEventListener("wheel", (e) => {
    if (isPinned) {
      if (e.deltaY < 0 && revealedCount <= 0) {
        exitAccum += Math.abs(e.deltaY);
        e.preventDefault();
        if (exitAccum >= EXIT_THRESHOLD) { exitAccum = 0; unpin(); }
        return;
      }
      if (e.deltaY > 0 && revealedCount >= shuffled.length) {
        exitAccum += e.deltaY;
        e.preventDefault();
        if (exitAccum >= EXIT_THRESHOLD) { exitAccum = 0; unpin(); }
        return;
      }
      exitAccum = 0;
      e.preventDefault();
      wheelAccum = Math.max(0, Math.min(shuffled.length * WHEEL_PER_IMAGE, wheelAccum + e.deltaY));
      const target = Math.floor(wheelAccum / WHEEL_PER_IMAGE);
      while (revealedCount < target) {
        shuffled[revealedCount].style.opacity = "1";
        shuffled[revealedCount].style.transform = "translate(0, 0)";
        revealedCount++;
      }
      while (revealedCount > target) {
        revealedCount--;
        const d = offsets[revealedCount];
        shuffled[revealedCount].style.opacity = "0";
        shuffled[revealedCount].style.transform = `translate(${d.x}px, ${d.y}px)`;
      }
      return;
    }

    const scrollY = window.scrollY;
    const tgt = getTarget();
    // Pin when this scroll would pass through the clip's natural position
    const passingDown = e.deltaY > 0 && scrollY < tgt && scrollY + e.deltaY >= tgt;
    const passingUp   = e.deltaY < 0 && scrollY > tgt && scrollY + e.deltaY <= tgt;
    const atTarget    = Math.abs(scrollY - tgt) <= 2;

    if (passingDown && revealedCount < shuffled.length) { e.preventDefault(); pin(); return; }
    if ((passingUp || atTarget) && e.deltaY < 0 && revealedCount > 0) { e.preventDefault(); pin(); return; }
    if (atTarget && e.deltaY > 0 && revealedCount < shuffled.length) { e.preventDefault(); pin(); return; }
  }, { passive: false });
}

initRecordCylinderReveal();

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

function animateKingPeopleHeartText(now) {
  if (kingPeopleHeartAnimationStart === null) {
    kingPeopleHeartAnimationStart = now;
  }

  const elapsed = now - kingPeopleHeartAnimationStart;
  const progress = Math.min(1, elapsed / KING_PEOPLE_HEART_TEXT_DURATION);
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  kingPeopleHeartTextProgress = kingPeopleHeartAnimationFrom + (kingPeopleHeartAnimationTo - kingPeopleHeartAnimationFrom) * easedProgress;
  setKingPeopleHeartText();

  if (progress < 1) {
    kingPeopleHeartAnimationFrame = requestAnimationFrame(animateKingPeopleHeartText);
  } else {
    kingPeopleHeartTextProgress = kingPeopleHeartAnimationTo;
    kingPeopleHeartAnimationFrame = null;
    kingPeopleHeartAnimationStart = null;
    setKingPeopleHeartText();
  }
}

function goToKingPeopleHeartTextProgress(progress) {
  const nextProgress = Math.min(1, Math.max(0, progress));

  if (nextProgress === kingPeopleHeartTextProgress || kingPeopleHeartAnimationFrame !== null) {
    return;
  }

  kingPeopleHeartAnimationStart = null;
  kingPeopleHeartAnimationFrom = kingPeopleHeartTextProgress;
  kingPeopleHeartAnimationTo = nextProgress;
  kingPeopleHeartAnimationFrame = requestAnimationFrame(animateKingPeopleHeartText);
}

function handleKingPeopleHeartWheel(event) {
  if (!kingPeopleHeartSection) {
    return;
  }

  const rect = kingPeopleHeartSection.getBoundingClientRect();
  const isActive = rect.top <= 0 && rect.bottom > window.innerHeight;

  if (!isActive) {
    return;
  }

  if (kingPeopleHeartAnimationFrame !== null) {
    event.preventDefault();
    return;
  }

  if (event.deltaY > 0 && kingPeopleHeartTextProgress < 1) {
    event.preventDefault();
    goToKingPeopleHeartTextProgress(1);
    return;
  }

  if (event.deltaY < 0 && kingPeopleHeartTextProgress > 0) {
    event.preventDefault();
    goToKingPeopleHeartTextProgress(0);
  }
}

function setKingPeopleHeartText() {
  if (!kingPeopleHeartSection) {
    return;
  }

  const rect = kingPeopleHeartSection.getBoundingClientRect();

  if (rect.top > 0 && kingPeopleHeartAnimationFrame === null) {
    kingPeopleHeartTextProgress = 0;
  }

  const progress = Math.min(1, Math.max(0, kingPeopleHeartTextProgress));
  const blur = (1 - progress) * 18;
  const offset = (1 - progress) * 2.4;

  kingPeopleHeartSection.style.setProperty("--king-heart-text-opacity", progress.toFixed(3));
  kingPeopleHeartSection.style.setProperty("--king-heart-text-blur", blur.toFixed(2) + "px");
  kingPeopleHeartSection.style.setProperty("--king-heart-text-offset", offset.toFixed(3) + "vw");
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
setKingPeopleHeartText();
window.addEventListener("wheel", handleKingPeopleHeartWheel, { passive: false });
window.addEventListener("resize", setKingPeopleScene);
window.addEventListener("resize", setKingPeopleHeartText);

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
  const leftBody = root.querySelector('[data-body="kieuk"]');
  const rightBody = root.querySelector('[data-body="tikeut"]');
  const leftRim  = leftLetter.querySelector(':scope > .sound-letter-rim');
  const rightRim = rightLetter.querySelector(':scope > .sound-letter-rim');
  const fragments = Array.from(root.querySelectorAll(".sound-fragment"));
  const letterCracks = Array.from(root.querySelectorAll(".sound-letter-crack"));
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
    makeAffPath(bracketArc(648,186, -1,0, -76,32,32), 13),
    makeAffPath(bracketArc(648,186, -1,0, -102,32,32), 13),
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
    makeAffPath(bracketArc(612,286, -1,0, -76,32,32), 13),
    makeAffPath(bracketArc(612,286, -1,0, -102,32,32), 13),
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

  // Fricative collision particles
  const fricParticles = [];
  {
    let rng = 83;
    const rand = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296; };
    for (let i = 0; i < 65; i++) {
      const isChip = rand() > 0.42;
      const size = isChip ? 12 + rand() * 28 : 5 + rand() * 14;
      const angle = rand() * Math.PI;           // 0(��) ~ ��(��): �Ʒ��� �ݿ� ��ü
      const speed = 60 + rand() * 360;
      const delay = rand() * 0.38;
      let el;
      if (isChip) {
        el = document.createElementNS(SVG_NS, "rect");
        el.setAttribute("width", size.toFixed(1));
        el.setAttribute("height", (size * 0.65).toFixed(1));
        el.setAttribute("rx", "2");
      } else {
        el = document.createElementNS(SVG_NS, "circle");
        el.setAttribute("r", (size * 0.5).toFixed(1));
      }
      el.setAttribute("fill", "#030303");
      el.setAttribute("opacity", "0");
      el.dataset.angle = angle;
      el.dataset.speed = speed;
      el.dataset.delay = delay;
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
    const progress = progressState.scroll;
    const delta = progress - progressState.previous;
    progressState.velocity += (delta * 42 - progressState.velocity) * 0.18;
    progressState.previous = progress;

    const affPhase = Math.min(1, Math.max(0, (progress - 0.70) / 0.17));
    const affApproach = smoothProgress(affPhase, 0.04, 0.42);
    const inAffContact = affApproach > 0.95 && smoothProgress(affPhase, 0.52, 0.62) < 1;
    if (Math.abs(progress - progressState.rendered) > 0.0005 || Math.abs(progressState.velocity) > 0.001 || inAffContact) {
      const plosiveProgress = Math.min(1, Math.max(0, progress / 0.68));
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
    const fractureProgress = smoothProgress(progress, 0.43, 0.76);
    const breakProgress = smoothProgress(progress, 0.58, 0.82);
    const dissolveProgress = smoothProgress(progress, 0.74, 0.99);
    const heavy = 1 - Math.pow(1 - approach, 3.4);
    const vibration = Math.sin(time * 42) * 4 * approach * (1 - breakProgress) + Math.sin(time * 107) * 1.2 * impact;
    const travel = 760 / letterScale;
    const leftImpactX = -696 * letterScale;
    const rightImpactX = -70 * letterScale;
    const leftStartX = leftImpactX - travel;
    const rightStartX = rightImpactX + travel;
    const centerOffset = -204;

    // �浹 �� �ݵ�: ������ ƨ�ܳ��ٰ� ������ ���ߴ� ease-out
    const reboundProgress = smoothProgress(progress, 0.58, 0.84);
    const reboundEase = 1 - Math.pow(1 - reboundProgress, 2.8);
    const reboundDist = 60 / letterScale;  // ȭ��� �� 30px�� �ڷ�

    const leftX  = centerOffset + leftStartX  + (leftImpactX  - leftStartX)  * heavy + vibration - reboundDist * reboundEase;
    const rightX = centerOffset + rightStartX + (rightImpactX - rightStartX) * heavy - vibration + reboundDist * reboundEase;
    const baseY = 0;

    // �ݵ� ���Ŀ� body + rim ���̵� (��¦ ������ ���¿��� �����)
    const bodyOpacity = 1 - smoothProgress(progress, 0.66, 0.82);
    const blur = 0;
    // �ݵ��ϸ鼭 ���Ⱑ ������� ���ƿ�
    const leftRotation  = -8 * (1 - heavy) * (1 - breakProgress) + 4 * breakProgress * (1 - reboundEase * 0.7) + vibration * 0.18;
    const rightRotation =  8 * (1 - heavy) * (1 - breakProgress) - 4 * breakProgress * (1 - reboundEase * 0.7) - vibration * 0.18;
    const isVisible = progress > 0.02 && progress < 0.98 ? 1 : 0;

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
    function animateStrokes(strokeEls, drifts, isLeft) {
      strokeEls.forEach((el, i) => {
        const [dx, dy] = drifts[i] || [0, 0];
        // ȹ���� ��¦ �ٸ� Ÿ�̹����� �и�
        const stagger = i * 0.04;
        const localBreak = Math.max(0, smoothProgress(progress, 0.65 + stagger, 0.84));
        const localDissolve = Math.max(0, smoothProgress(progress, 0.72 + stagger, 0.92));

        if (localBreak <= 0) {
          el.style.opacity = "0";
          return;
        }

        // �и� �̵� (SVG transform)
        const ease = 1 - Math.pow(1 - localBreak, 2.8);
        const tx = (dx * ease * letterScale).toFixed(2);
        const ty = (dy * ease * letterScale).toFixed(2);
        el.setAttribute("transform", `translate(${tx} ${ty})`);

        // �׶��̼� ����ũ: �浹 �� ������� ������ ��������
        const fadeStart = (localDissolve * 85).toFixed(1);
        const fadeEnd = Math.min(Number(fadeStart) + 40, 100).toFixed(1);
        const gradDir = isLeft ? "to left" : "to right";
        el.style.mask = `linear-gradient(${gradDir}, transparent ${fadeStart}%, black ${fadeEnd}%)`;
        el.style.webkitMask = el.style.mask;

        // ��ü opacity�� �������� ������ �Ҹ�
        const overallOpacity = Math.max(0, 1 - localDissolve * 1.2);
        el.style.opacity = (localBreak * overallOpacity).toFixed(3);
      });
    }

    animateStrokes(kieukStrokeEls, kieukDrifts, true);
    animateStrokes(tikeutStrokeEls, tikeutDrifts, false);

    root.style.setProperty("--sound-shake-x", `${Math.sin(time * 140) * impact * 10}px`);
    root.style.setProperty("--sound-shake-y", "0px");
    scene.style.setProperty("--sound-impact-blur", "0");

    gsapSet(impactCore, { opacity: Math.max(0, impact * 0.95 - breakProgress), scale: 0.35 + impact * 2.1 });

    letterCracks.forEach((crack) => {
      const delay = Number(crack.dataset.delay);
      const local = Math.min(1, Math.max(0, crackProgress * 1.6 - delay));
      crack.style.opacity = `${local * (1 - smoothProgress(progress, 0.72, 0.90))}`;
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

    const phase = Math.min(1, Math.max(0, (progress - 0.70) / 0.17));
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
    const leftImpactX = -696 * letterScale;
    const rightImpactX = -70 * letterScale;
    const leftStartX = leftImpactX - travel;
    const rightStartX = rightImpactX + travel;
    const centerOffset = -204;
    const heavy = 1 - Math.pow(1 - approach, 3.5);
    const exit = 210 / letterScale * release;
    const leftX = centerOffset + leftStartX + (leftImpactX - leftStartX) * heavy + highX - exit;
    const rightX = centerOffset + rightStartX + (rightImpactX - rightStartX) * heavy - highX + exit;

    const contact = smoothProgress(phase, 0.38, 0.46) * (1 - smoothProgress(phase, 0.52, 0.62));
    const vibAmp = contact * 6;
    const vibX = Math.sin(time * 90) * vibAmp;
    const vibY = Math.sin(time * 90 * 1.27 + 1.1) * vibAmp * 0.7;
    const vibRot = Math.sin(time * 90 * 0.83 + 0.5) * contact * 2.5;

    const slideAmount = 36;
    const fricTitleMix = smoothProgress(progress, 0.88, 0.92);
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

    const phase = Math.min(1, Math.max(0, (progress - 0.90) / 0.10));
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
    const leftImpactX = -centerOffset - 660 * letterScale;   // 204 - 660*ls
    const rightImpactX = -centerOffset - 102 * letterScale;  // 204 - 102*ls
    const leftStartX = leftImpactX - travel;
    const rightStartX = rightImpactX + travel;

    // ���� �ð��� �߽��� SVG x=0�� ���߱� ���� ������ (-100*ls �̵�)
    const fricCenterShift = -100 * letterScale;
    const leftX = centerOffset + leftStartX + (leftImpactX - leftStartX) * heavy + fricCenterShift;
    const rightX = centerOffset + rightStartX + (rightImpactX - rightStartX) * heavy + fricCenterShift;

    setAffricateTransform(fricLeftLetter, leftX, -410, letterScale, letterScale, -7 * (1 - heavy), 430, 365);
    setAffricateTransform(fricRightLetter, rightX, -415, letterScale, letterScale, 7 * (1 - heavy), 360, 370);

    gsapSet(fricLeftLetter, {
      opacity: visible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42))`,
    });
    gsapSet(fricRightLetter, {
      opacity: visible,
      filter: `drop-shadow(0 ${30 * letterScale}px ${34 * letterScale}px rgba(0,0,0,.42))`,
    });

    // �浹 ����: �� ������ �ٸ� ��(660,588)�� �� ���� �ܰ� �ٸ� ��(102,582)�� �߰�
    const contactX = 0.5 * (centerOffset + leftImpactX + 660 * letterScale)
                   + 0.5 * (centerOffset + rightImpactX + 102 * letterScale);
    const contactY = 0.5 * (-410 + 588 * letterScale) + 0.5 * (-415 + 582 * letterScale);

    const disintegrate = smoothProgress(phase, 0.40, 0.92);

    fricParticles.forEach(p => {
      if (visible <= 0 || disintegrate <= 0) {
        p.setAttribute("opacity", "0");
        return;
      }
      const delay = Number(p.dataset.delay);
      if (disintegrate <= delay) {
        p.setAttribute("opacity", "0");
        return;
      }
      const localP = Math.min(1, (disintegrate - delay) / (1 - delay));
      const ease = 1 - Math.pow(1 - localP, 2.4);
      const scatter = ease * Number(p.dataset.speed);
      const gravity = ease * ease * 220;
      const angle = Number(p.dataset.angle);
      const x = contactX + Math.cos(angle) * scatter;
      const y = contactY + Math.sin(angle) * scatter + gravity;
      const opacity = Math.max(0, (1 - smoothProgress(localP, 0.44, 1.0)) * visible);

      if (p.tagName === "circle") {
        p.setAttribute("cx", x.toFixed(1));
        p.setAttribute("cy", y.toFixed(1));
      } else {
        const w = Number(p.getAttribute("width"));
        const h = Number(p.getAttribute("height"));
        p.setAttribute("x", (x - w * 0.5).toFixed(1));
        p.setAttribute("y", (y - h * 0.5).toFixed(1));
      }
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

  const kieukStrokeMarkup = kieukStrokes.map((d, i) => `
    <g class="sound-letter-stroke" data-letter="kieuk" data-idx="${i}" style="opacity:0">
      <path d="${d}" fill="url(#soundConcreteMaterial)" />
      <path d="${d}" class="sound-letter-rim" />
    </g>`).join("");

  const tikeutStrokeMarkup = tikeutStrokes.map((d, i) => `
    <g class="sound-letter-stroke" data-letter="tikeut" data-idx="${i}" style="opacity:0">
      <path d="${d}" fill="url(#soundConcreteMaterial)" />
      <path d="${d}" class="sound-letter-rim" />
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
          <path class="sound-letter-body" data-body="kieuk" d="${kieukPath}" fill="url(#soundConcreteMaterial)" />
          <path class="sound-letter-rim" d="${kieukPath}" />
          <g clip-path="url(#sound-kieuk-clip)">${leftLetterCracks}</g>
          ${kieukStrokeMarkup}
          ${leftFragments}
        </g>
        <g class="sound-letter" data-letter="tikeut" transform="translate(365 -260)">
          <path class="sound-letter-body" data-body="tikeut" d="${tikeutPath}" fill="url(#soundConcreteMaterial)" />
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
        fill="url(#soundConcreteMaterial)"
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

  // �浹 �� x / ���� ���� ���� ����
  const edgeX   = isLeft ? 694 : 72;
  const inward  = isLeft ? Math.PI : 0;          // ���� ����, ���� ���������� �տ� ����
  const zoneTop = 140;
  const zoneBot = 600;

  const gradId = isLeft ? "crack-grad-kieuk" : "crack-grad-tikeut";

  // �߽ɼ� + �ʺ� �޾� ä���� ������ �ٰ����� ����� �߰�
  function emit(centerPoints, startW, endW, delay) {
    if (centerPoints.length < 2) return;
    const polyPts = expandCrackToPolygon(centerPoints, startW, endW);
    if (!polyPts || polyPts.length < 3) return;
    const pl = polyPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    result.push(
      `<polygon class="sound-letter-crack" points="${pl}" data-delay="${delay.toFixed(3)}" fill="url(#${gradId})" />`,
    );
  }

  // ���� ���� ������: ���� ����� ���ߵǴ� ��ġ 2~3�� ����
  // ȹ�� �𼭸�/�� �κп� ���� (���� ���� ��� Ŭ������)
  const stressY = isLeft
    ? [210, 390, 565]   // ��: �� ȹ ��, �߾�, �Ʒ� ȹ �� ��ó
    : [205, 390, 560];  // ��: �� ȹ ��, �߾�, �Ʒ� ȹ �� ��ó

  const mainCracks = [];

  stressY.forEach((sy, si) => {
    // �� ������ �ֺ��� 3~5�� �տ� Ŭ������ ����
    const clusterCount = 3 + Math.floor(random() * 3);
    for (let i = 0; i < clusterCount; i++) {
      // ������ �ֺ��� �ұ����ϰ� ���� (�ּ��� �幰��)
      const spread = Math.pow(random(), 0.7) * 95;
      const startY = sy + (random() > 0.5 ? spread : -spread) * (random() * 0.9 + 0.1);
      const startX = edgeX + (random() - 0.5) * 10;

      // ����: ������ �߽ɿ����� �� ����, �ٱ����� ������ �� ������
      const distRatio = Math.abs(startY - sy) / 95;
      const maxSpread = 1.1 + distRatio * 0.8;
      const angle = inward + (random() - 0.5) * maxSpread;

      // ������ �߽� �տ��� ��� ����, �ֺ��� ª�� ���
      const centerDist = Math.abs(startY - sy) / 95;
      const crackLen = (55 + random() * 55) * (1 - centerDist * 0.5);
      // ���⸦ 3�ܰ�� �ڿ������� ����: ����(40%) / �߰�(35%) / ����(25%)
      const widthTier = random();
      const baseMult = widthTier < 0.40 ? (22 + random() * 14)   // ���� �տ�: 22~36
                     : widthTier < 0.75 ? (10 + random() * 10)   // �߰� �տ�: 10~20
                     :                    (3  + random() * 6);    // ���� �տ�: 3~9
      const startW = baseMult * (1 - centerDist * 0.4);
      const endW   = 0.2 + random() * 0.8;

      const { points } = growCrack(startX, startY, angle, crackLen, random);
      emit(points, startW, endW, random() * 0.04 + si * 0.01);
      mainCracks.push({ points, angle, startW });

      // ���� (������ ��ó�ϼ��� �� ����)
      const branchProb = 0.55 + (1 - centerDist) * 0.3;
      if (random() < branchProb && points.length > 2) {
        const bIdx = Math.floor(points.length * (0.25 + random() * 0.45));
        const safeIdx = Math.min(bIdx, points.length - 1);
        const [bx, by] = points[safeIdx];

        // �б� ������ ���� �β� ��� (���� ������ ����)
        const bT     = safeIdx / Math.max(1, points.length - 1);
        const bTaper = Math.pow(bT, 2.2);
        const widthAtBranch = startW * (1 - bTaper) + endW * bTaper;

        const bSign  = random() > 0.5 ? 1 : -1;
        // ����: �ֱտ����� 20~55�� �� ������ (�ʹ� ������ ���� �ʵ���)
        const bAngle = angle + bSign * (0.35 + random() * 0.6);
        const bLen   = 12 + random() * 32;
        const br     = growCrack(bx, by, bAngle, bLen, random);
        // ���� ���� �ʺ� = �б� ���� �β��� 45~65% (���Ӽ� �ְ�, ���� ���� ����)
        const bStartW = widthAtBranch * (0.45 + random() * 0.20);
        emit(br.points, bStartW, 0.2, 0.02 + random() * 0.07);

        // 2�� �б� (35% Ȯ��, �� ���)
        if (random() < 0.35 && br.points.length > 2) {
          const b2Idx  = Math.floor(br.points.length * (0.3 + random() * 0.4));
          const safe2  = Math.min(b2Idx, br.points.length - 1);
          const [b2x, b2y] = br.points[safe2];
          const b2T    = safe2 / Math.max(1, br.points.length - 1);
          const b2W    = bStartW * (1 - Math.pow(b2T, 2.2)) * (0.45 + random() * 0.15);
          const b2Angle = bAngle + (random() - 0.5) * 0.8;
          const b2Len  = 6 + random() * 18;
          const br2    = growCrack(b2x, b2y, b2Angle, b2Len, random);
          emit(br2.points, b2W, 0.2, 0.04 + random() * 0.08);
        }
      }
    }
  });

  // ���� �̼� �տ�: �ֱտ� ��ó���� �Ļ��Ǵ� ���� �� ����
  const microCount = 4 + Math.floor(random() * 3);
  for (let m = 0; m < microCount; m++) {
    // �ֱտ� �� �ϳ��� ��� �� ��� ���� �� ��ó���� ����
    const parentCrack = mainCracks[Math.floor(random() * mainCracks.length)];
    if (!parentCrack) continue;
    const pIdx = Math.floor(parentCrack.points.length * (0.1 + random() * 0.7));
    const [px, py] = parentCrack.points[Math.min(pIdx, parentCrack.points.length - 1)];

    // �θ� �տ��� �ش� ���� �β� ���
    const pT = pIdx / Math.max(1, parentCrack.points.length - 1);
    const widthAtP = parentCrack.startW * (1 - Math.pow(pT, 2.2));

    // �̼��տ� ���� �ʺ� = �θ� �տ� �β��� 20~35% (���)
    const mStartW = widthAtP * (0.20 + random() * 0.15);
    const mAngle  = parentCrack.angle + (random() - 0.5) * 1.4;
    const mLen    = 5 + random() * 16;
    const { points: mp } = growCrack(px + (random()-0.5)*6, py + (random()-0.5)*6, mAngle, mLen, random);
    emit(mp, mStartW, 0.1, 0.07 + random() * 0.12);
  }

  // ���� ���� �տ�: ���� �տ� ���̸� �幮�幮 �մ� ���� �� ����
  for (let a = 0; a < mainCracks.length - 1; a++) {
    for (let b = a + 2; b < Math.min(a + 5, mainCracks.length); b++) {
      if (random() > 0.22) continue;
      const ptsA = mainCracks[a].points;
      const ptsB = mainCracks[b].points;
      const ia = Math.floor(ptsA.length * (0.3 + random() * 0.4));
      const ib = Math.floor(ptsB.length * (0.3 + random() * 0.4));
      const safeA = Math.min(ia, ptsA.length - 1);
      const safeB = Math.min(ib, ptsB.length - 1);
      const [ax, ay] = ptsA[safeA];
      const [bx, by] = ptsB[safeB];
      const dist = Math.hypot(bx - ax, by - ay);
      if (dist < 20 || dist > 80) continue;

      // ���ἱ �β� = ���� ���� ���� �β��� ��� �� 40%
      const tA = safeA / Math.max(1, ptsA.length - 1);
      const tB = safeB / Math.max(1, ptsB.length - 1);
      const wA = mainCracks[a].startW * (1 - Math.pow(tA, 2.2));
      const wB = mainCracks[b].startW * (1 - Math.pow(tB, 2.2));
      const bridgeW = (wA + wB) * 0.5 * (0.35 + random() * 0.12);

      const bAngle = Math.atan2(by - ay, bx - ax);
      const br = growCrack(ax, ay, bAngle, dist, random);
      emit(br.points, bridgeW, 0.1, 0.05 + random() * 0.1);
    }
  }

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
