/**
 * 먹물 번짐 인터랙션
 * - Hover: 우상단 기준 비정형 먹물 확장
 * - Click: 100vw×100vh 확장 후 GNB 페이드인
 */

const siteMenu = document.querySelector('.site-menu');
const inkOverlay = document.querySelector('.ink-overlay');
const inkDisplacement = document.getElementById('ink-displacement');

if (siteMenu && inkOverlay && inkDisplacement) {
  init();
}

function init() {
  let isFullscreen = false;
  let activeTl = null;

  // ─── 호버 진입 ────────────────────────────────────────────────
  siteMenu.addEventListener('mouseenter', () => {
    if (isFullscreen) return;
    if (activeTl) activeTl.kill();

    siteMenu.classList.add('ink-active');
    inkOverlay.classList.add('is-hovered');

    activeTl = gsap.timeline();
    activeTl
      .set(inkOverlay, {
        opacity: 1,
        '--ink-wash-scale': 0,
        '--ink-wash-opacity': 0,
        '--ink-branch-scale': 0,
        '--ink-branch-opacity': 0,
      })
      .to(
        inkOverlay,
        {
          '--ink-wash-scale': 1.04,
          '--ink-wash-opacity': 0.18,
          duration: 2.6,
          ease: 'power2.out',
        },
        0
      )
      .to(
        inkOverlay,
        {
          '--ink-spread': 1,
          duration: 2.35,
          ease: 'power3.out',
        },
        0.28
      )
      .to(
        inkOverlay,
        {
          '--ink-branch-scale': 1,
          '--ink-branch-opacity': 1,
          duration: 2.55,
          ease: 'power2.out',
        },
        0.38
      )
      .to(
        inkDisplacement,
        {
          attr: { scale: 54 },
          duration: 2.45,
          ease: 'power2.out',
        },
        0
      );
  });

  // ─── 호버 이탈 ────────────────────────────────────────────────
  siteMenu.addEventListener('mouseleave', () => {
    if (isFullscreen) return;
    if (activeTl) activeTl.kill();

    siteMenu.classList.remove('ink-active');

    activeTl = gsap.timeline();
    activeTl
      .to(
        inkOverlay,
        {
          '--ink-spread': 0,
          '--ink-wash-scale': 0,
          '--ink-wash-opacity': 0,
          '--ink-branch-scale': 0,
          '--ink-branch-opacity': 0,
          opacity: 0,
          duration: 1.25,
          ease: 'power2.inOut',
          onComplete: () => {
            inkOverlay.classList.remove('is-hovered');
          },
        },
        0
      )
      .to(
        inkDisplacement,
        {
          attr: { scale: 0 },
          duration: 1.25,
          ease: 'power2.inOut',
        },
        0
      );
  });

  // ─── 클릭: 전체화면 확장 ──────────────────────────────────────
  siteMenu.addEventListener('click', (e) => {
    e.preventDefault();
    if (isFullscreen) return;
    isFullscreen = true;

    if (activeTl) activeTl.kill();

    siteMenu.classList.add('ink-active');
    inkOverlay.classList.add('is-hovered');

    activeTl = gsap.timeline({
      onComplete: onFullscreenComplete,
    });

    activeTl
      .set(inkOverlay, {
        opacity: 1,
        '--ink-wash-scale': 0,
        '--ink-wash-opacity': 0,
        '--ink-branch-scale': 0,
        '--ink-branch-opacity': 0,
      })
      .to(
        inkOverlay,
        {
          '--ink-wash-scale': 1.12,
          '--ink-wash-opacity': 0.22,
          duration: 1.85,
          ease: 'power2.out',
        },
        0
      )
      .to(
        inkOverlay,
        {
          '--ink-spread': 1.16,
          duration: 1.65,
          ease: 'power3.out',
        },
        0.18
      )
      .to(
        inkOverlay,
        {
          '--ink-branch-scale': 1.12,
          '--ink-branch-opacity': 1,
          duration: 1.75,
          ease: 'power2.out',
        },
        0.36
      )
      .to(
        inkDisplacement,
        {
          attr: { scale: 58 },
          duration: 1.9,
          ease: 'power2.out',
        },
        0
      );
  });

  function onFullscreenComplete() {
    inkOverlay.classList.add('is-fullscreen');
    inkOverlay.classList.remove('is-hovered');

    // GNB 페이드인 (GNB 준비 시 자동 동작)
    const gnb = document.querySelector('.gnb');
    if (gnb) {
      gsap.fromTo(
        gnb,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
      );
    }
  }

  // 리사이즈 대응: 전체화면 상태면 뷰포트에 맞게 재조정
  window.addEventListener('resize', () => {
    if (!isFullscreen) return;
    gsap.set(inkOverlay, {
      '--ink-spread': 1.16,
      '--ink-wash-scale': 1.12,
      '--ink-wash-opacity': 0.22,
      '--ink-branch-scale': 1.12,
      '--ink-branch-opacity': 1,
    });
  });
}
