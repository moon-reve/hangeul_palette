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

setHeroTitleStep();
window.addEventListener("scroll", setHeroTitleStep, { passive: true });
window.addEventListener("resize", setHeroTitleStep);

function setKingPeopleScene() {
  if (!kingPeopleSection || !kingPeopleVideoScene || !kingPeopleVideoFrame) {
    return;
  }

  const rect = kingPeopleSection.getBoundingClientRect();
  const scrollableDistance = Math.max(1, kingPeopleSection.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
  const videoProgress = smoothProgress(progress, 0.05, 0.58);
  const baseWidth = Math.max(1, kingPeopleVideoFrame.offsetWidth);
  const baseHeight = Math.max(1, kingPeopleVideoFrame.offsetHeight);
  const coverScale = Math.max(window.innerWidth / baseWidth, window.innerHeight / baseHeight);
  const videoScale = 1 + (coverScale - 1) * videoProgress;

  kingPeopleVideoFrame.style.transform = `scale(${videoScale})`;
}

setKingPeopleScene();
window.addEventListener("scroll", setKingPeopleScene, { passive: true });
window.addEventListener("resize", setKingPeopleScene);

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
