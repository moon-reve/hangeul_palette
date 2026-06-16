const hero = document.querySelector(".hero");
const initialTitle = document.querySelector(".hero-title-initial");
const nextTitle = document.querySelector(".hero-title-next");
const kingPeopleSection = document.querySelector(".section-king-people");
const kingPeopleVideoScene = document.querySelector(".king-people-scene-video");
const kingPeopleHeartScene = document.querySelector(".king-people-scene-heart");

function setHeroTitleStep() {
  if (!hero || !initialTitle || !nextTitle) {
    return;
  }

  const rect = hero.getBoundingClientRect();
  const scrollableDistance = Math.max(1, hero.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const showNextTitle = progress >= 0.5;

  initialTitle.classList.toggle("is-active", !showNextTitle);
  nextTitle.classList.toggle("is-active", showNextTitle);
}

setHeroTitleStep();
window.addEventListener("scroll", setHeroTitleStep, { passive: true });
window.addEventListener("resize", setHeroTitleStep);

function setKingPeopleScene() {
  if (!kingPeopleSection || !kingPeopleVideoScene || !kingPeopleHeartScene) {
    return;
  }

  const rect = kingPeopleSection.getBoundingClientRect();
  const scrollableDistance = Math.max(1, kingPeopleSection.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const showHeartScene = progress >= 0.5;

  kingPeopleVideoScene.classList.toggle("is-active", !showHeartScene);
  kingPeopleHeartScene.classList.toggle("is-active", showHeartScene);
}

setKingPeopleScene();
window.addEventListener("scroll", setKingPeopleScene, { passive: true });
window.addEventListener("resize", setKingPeopleScene);
