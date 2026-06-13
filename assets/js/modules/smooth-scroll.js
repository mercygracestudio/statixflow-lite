import gsap from "gsap";

import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother;

export function smoothScroll() {
  const wrapper = document.getElementById("smooth-wrapper");
  const smoothAmount = wrapper && wrapper.dataset.smoothScrollAmount ? parseFloat(wrapper.dataset.smoothScrollAmount) : 2;

  smoother = ScrollSmoother.create({
    smooth: smoothAmount,
    effects: true,
    normalizeScroll: true,
  });

  // Add smooth scrolling to anchor links
  document
    .querySelectorAll('a[href^="#"]:not([href="#"])')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const duration = parseFloat(this.dataset.smoothScrollDuration) || 0.5;
          const headerTrigger =
            ScrollTrigger.getById("headerAnimation");
          if (headerTrigger) headerTrigger.disable(false);

          gsap.to(smoother, {
            scrollTop: Math.min(
              ScrollTrigger.maxScroll(window),
              smoother.offset(targetId, "top top"),
            ),
            duration,
            onComplete: () => {
              if (headerTrigger) headerTrigger.enable(false);
            },
          });
        }
      });
    });
}

export function getSmoother() {
  return smoother;
}
