import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import lottie from 'lottie-web';
import astronaut from './assets/Astronaut.json';
import { Observer } from 'gsap/Observer';

import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText, Observer);

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

let scrollDirection = 'down';
let lastScrollY = 0;

lenis.on('scroll', ({ scroll }) => {
  scrollDirection = scroll > lastScrollY ? 'down' : 'up';
  lastScrollY = scroll;
});

const heroImg = document.querySelector('.hero-img');
const lottieContainer = document.querySelector('.lottie');

const anim = lottie.loadAnimation({
  container: lottieContainer,
  /* path: "/assets/Astronaut.json", */
  renderer: 'svg',
  autoplay: false,
  animationData: astronaut,
});

const heroImgInitialWidth = heroImg.offsetWidth;
const heroImgTargetWidth = 300;

ScrollTrigger.create({
  trigger: '.about',
  start: 'top bottom',
  end: 'top 30%',
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
  trigger: '.about',
  start: 'top 30%',
  end: 'bottom top',
  scrub: 1,
  onUpdate: (self) => {
    const lottieOffset = self.progress * window.innerHeight * 1.1;

    animationPaused = self.progress > 0;

    gsap.set(lottieContainer, {
      y: -lottieOffset,
      rotateY: scrollDirection === 'up' ? -180 : 0,
    });
  },
});

ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: 'bottom top',
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
      rotateY: scrollDirection === 'up' ? -180 : 0,
    });
  },
});

let sections = document.querySelectorAll('.section'),
  images = document.querySelectorAll('.bg'),
  headings = gsap.utils.toArray('.section-heading'),
  outerWrappers = gsap.utils.toArray('.outer'),
  innerWrappers = gsap.utils.toArray('.inner'),
  splitHeadings = headings.map(
    (heading) =>
      new SplitText(heading, {
        type: 'chars,words,lines',
        linesClass: 'clip-text',
      }),
  ),
  currentIndex = -1,
  wrap = gsap.utils.wrap(0, sections.length),
  animating;

gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

function gotoSection(index, direction) {
  index = wrap(index); // make sure it's valid
  animating = true;
  let fromTop = direction === -1,
    dFactor = fromTop ? -1 : 1,
    tl = gsap.timeline({
      defaults: { duration: 1.25, ease: 'power1.inOut' },
      onComplete: () => (animating = false),
    });
  if (currentIndex >= 0) {
    // The first time this function runs, current is -1
    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(images[currentIndex], { yPercent: -15 * dFactor }).set(
      sections[currentIndex],
      { autoAlpha: 0 },
    );
  }
  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
  tl.fromTo(
    [outerWrappers[index], innerWrappers[index]],
    {
      yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor),
    },
    {
      yPercent: 0,
    },
    0,
  )
    .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
    .fromTo(
      splitHeadings[index].chars,
      {
        autoAlpha: 0,
        yPercent: 150 * dFactor,
      },
      {
        autoAlpha: 1,
        yPercent: 0,
        duration: 1,
        ease: 'power2',
        stagger: {
          each: 0.02,
          from: 'random',
        },
      },
      0.2,
    );

  currentIndex = index;
}

Observer.create({
  type: 'wheel,touch,pointer',
  wheelSpeed: -1,
  onDown: () => !animating && gotoSection(currentIndex - 1, -1),
  onUp: () => !animating && gotoSection(currentIndex + 1, 1),
  tolerance: 10,
  preventDefault: false,
});

gotoSection(0, 1);
