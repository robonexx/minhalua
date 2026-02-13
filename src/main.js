import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import lottie from "lottie-web";
import astronaut from "./assets/Astronaut.json";
import audioSrc from "./assets/scroll-audio.mp3";

gsap.registerPlugin(ScrollTrigger);
/* 
const audio = new Audio(audioSrc);
audio.preload = "auto";
audio.loop = false;
audio.volume = 1;

let audioUnlocked = false;
let hasPlayedThisLoad = false;

const enterOverlay = document.getElementById("enterOverlay");
const enterBtn = document.getElementById("enterBtn");

async function unlockAndEnter() {
  try {
    await audio.play();
    audio.pause();
    audio.currentTime = 0;

    audioUnlocked = true;

    enterOverlay.style.opacity = "0";
    enterOverlay.style.pointerEvents = "none";
    setTimeout(() => enterOverlay.remove(), 250);
  } catch (e) {
    console.warn("Audio still blocked:", e);
  }
}

enterBtn.addEventListener("click", unlockAndEnter);

enterBtn.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") unlockAndEnter();
});

ScrollTrigger.create({
  trigger: document.body,
  start: "top top",
  end: () => `+=${window.innerHeight * 2}`,
  onUpdate: (self) => {
    if (
      audioUnlocked &&
      !hasPlayedThisLoad &&
      self.direction === 1 &&
      self.progress > 0.001
    ) {
      hasPlayedThisLoad = true;
      audio.play().catch(() => {});
    }

    if (self.progress >= 1 && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  },
}); */

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

let scrollDirection = "down";
let lastScrollY = 0;

lenis.on("scroll", ({ scroll }) => {
  scrollDirection = scroll > lastScrollY ? "down" : "up";
  lastScrollY = scroll;
});

const heroImg = document.querySelector(".hero-img");
const lottieContainer = document.querySelector(".lottie");

const anim = lottie.loadAnimation({
  container: lottieContainer,
  /* path: "/assets/Astronaut.json", */
  renderer: "svg",
  autoplay: false,
  animationData: astronaut,
});

const heroImgInitialWidth = heroImg.offsetWidth;
const heroImgTargetWidth = 300;

ScrollTrigger.create({
  trigger: ".about",
  start: "top bottom",
  end: "top 30%",
  scrub: 1,
  onUpdate: (self) => {
    const heroImgCurrentWidth =
      heroImgInitialWidth -
      self.progress * (heroImgInitialWidth - heroImgTargetWidth);

    gsap.set(heroImg, { width: heroImgCurrentWidth });
  },
});

let animationPaused = false;

ScrollTrigger.create({
  trigger: ".about",
  start: "top 30%",
  end: "bottom top",
  scrub: 1,
  onUpdate: (self) => {
    const lottieOffset = self.progress * window.innerHeight * 1.1;

    animationPaused = self.progress > 0;

    gsap.set(lottieContainer, {
      y: -lottieOffset,
      rotateY: scrollDirection === "up" ? -180 : 0,
    });
  },
});

ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom top",
  scrub: 1,
  onUpdate: (self) => {
    if (!animationPaused) {
      const scrollDistance = self.scroll() - self.start;
      const pixelPerFrame = 3;
      const frame =
        Math.floor(scrollDistance / pixelPerFrame) % anim.totalFrames;
      anim.goToAndStop(frame, true);
    }

    gsap.set(lottieContainer, {
      rotateY: scrollDirection === "up" ? -180 : 0,
    });
  },
});

/* 
ScrollTrigger.create({
  trigger: document.body,
  start: () => `top+=${window.innerHeight * 2} top`, 
  end: () => `top+=${window.innerHeight * 3} top`, 
  scrub: 1,
  onUpdate: (self) => {
   
    gsap.set(heroImg, {
      x: self.progress * window.innerWidth * 1.2, 
      opacity: 1 - self.progress,
    });
  },
}); */


console.clear();

gsap.registerPlugin(ScrollTrigger);

const COUNT = 75;
const REPEAT_COUNT = 3;

const capture = document.querySelector("#capture");
const img = document.querySelector("#targetImg");

// --- helpers
function waitForImage(el) {
  return new Promise((resolve, reject) => {
    if (el.complete && el.naturalWidth > 0) return resolve();
    el.onload = () => resolve();
    el.onerror = (e) => reject(e);
  });
}

function cleanupOldEffect() {
  // remove old canvases
  document.querySelectorAll(".capture-canvas").forEach((c) => c.remove());
  // kill old ScrollTriggers/timelines
  ScrollTrigger.getAll().forEach((st) => st.kill());
  gsap.globalTimeline.clear(); // optional, keeps things tidy
  // show original again
  capture.style.display = "";
}

async function createCanvases(captureEl) {
  cleanupOldEffect();

  // wait for current image to be ready
  await waitForImage(img);

  // html2canvas needs CORS enabled for external images
  const canvas = await html2canvas(captureEl, {
    backgroundColor: null,
    useCORS: true,
    allowTaint: false
  });

  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, width, height);

  let dataList = [];
  captureEl.style.display = "none";

  for (let i = 0; i < COUNT; i++) {
    dataList.push(ctx.createImageData(width, height));
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      for (let l = 0; l < REPEAT_COUNT; l++) {
        const index = (x + y * width) * 4;
        const dataIndex = Math.floor((COUNT * (Math.random() + (2 * x) / width)) / 3);
        for (let p = 0; p < 4; p++) {
          dataList[dataIndex].data[index + p] = imageData.data[index + p];
        }
      }
    }
  }

  dataList.forEach((data, i) => {
    let clonedCanvas = canvas.cloneNode();
    clonedCanvas.getContext("2d").putImageData(data, 0, 0);
    clonedCanvas.className = "capture-canvas";
    document.body.appendChild(clonedCanvas);

    const randomAngle = (Math.random() - 0.5) * 2 * Math.PI;
    const randomRotationAngle = 30 * (Math.random() - 0.5);

    gsap.timeline({
      scrollTrigger: {
        scrub: 1,
        start: 0,
        end: window.innerHeight * 2
      }
    }).to(clonedCanvas, {
      duration: 1,
      rotate: randomRotationAngle,
      translateX: 40 * Math.sin(randomAngle),
      translateY: 40 * Math.cos(randomAngle),
      opacity: 0,
      delay: (i / dataList.length) * 2
    });
  });
}

// --- UI wiring
document.querySelector("#file").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  img.crossOrigin = "anonymous"; // fine for blob URLs too
  img.src = URL.createObjectURL(file);
  await createCanvases(capture);
});

document.querySelector("#loadUrl").addEventListener("click", async () => {
  const url = document.querySelector("#url").value.trim();
  if (!url) return;
  img.crossOrigin = "anonymous";
  img.src = url;
  await createCanvases(capture);
});

document.querySelector("#rebuild").addEventListener("click", async () => {
  await createCanvases(capture);
});

// set an initial image (optional)
img.src = "https://picsum.photos/1200/800";
createCanvases(capture).catch(() => {
  // if CORS blocks it, use upload instead
  console.warn("Initial URL likely blocked by CORS; try uploading an image.");
});
