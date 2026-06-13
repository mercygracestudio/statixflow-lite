import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const headerDuration = 0.2;

export function scrollHeaderAnimation() {
  const headerNav = document.querySelector("[data-animated-scroll-header]");
  if (!headerNav) return;

  const headerNavHeight = headerNav.offsetHeight;
  const mainContainer = document.querySelector("[data-main-container]");

  const headerPlaceholder = document.createElement("div");
  headerPlaceholder.style.height = `${headerNavHeight}px`;
  mainContainer.parentNode.insertBefore(headerPlaceholder, mainContainer);

  const animationSetup = gsap
    .from(headerNav, {
      yPercent: -100,
      paused: true,
      duration: headerDuration,
    })
    .progress(1);

  ScrollTrigger.create({
    id: "headerAnimation",
    start: "top top",
    end: 99999,
    onUpdate: (self) => {
      if (self.direction === -1) {
        animationSetup.play();
        headerNav.classList.add("is-visible");
      } else {
        animationSetup.reverse();
        headerNav.classList.remove("is-visible");
      }
    },
  });
}
