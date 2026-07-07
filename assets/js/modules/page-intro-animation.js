import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

function initPageIntroAnimation(root) {
  if (root.dataset.pageIntroAnimationGenerated) return;
  root.dataset.pageIntroAnimationGenerated = "true";

  const unmaskYPercent =
    parseFloat(root.dataset.pageIntroAnimationUnmaskYPercent) || 120;
  const unmaskStagger =
    parseFloat(root.dataset.pageIntroAnimationUnmaskStagger) || 0.3;
  const unmaskDuration =
    parseFloat(root.dataset.pageIntroAnimationUnmaskDuration) || 1.2;

  const moveUpYPercent =
    parseFloat(root.dataset.pageIntroAnimationMoveUpYPercent) || 120;
  const moveUpDuration =
    parseFloat(root.dataset.pageIntroAnimationMoveUpDuration) || 1.5;
  const moveUpStagger =
    parseFloat(root.dataset.pageIntroAnimationMoveUpStagger) || 0.3;

  const unmaskTextElements = root.querySelectorAll(
    "[data-page-intro-animation-unmask-text]",
  );
  const moveUpElements = root.querySelectorAll(
    "[data-page-intro-animation-move-up]",
  );

  unmaskTextElements.forEach((el) => {
    SplitText.create(el, {
      type: "words,lines",
      mask: "lines",
      linesClass: "unmask-text-line",
      autoSplit: true,
      onSplit: (instance) => {
        return gsap.from(instance.lines, {
          yPercent: unmaskYPercent,
          stagger: unmaskStagger,
          duration: unmaskDuration,
          ease: "power2.out",
        });
      },
    });
  });

  let introTl = gsap.timeline();
  introTl.from(moveUpElements, {
    yPercent: moveUpYPercent,
    opacity: 0,
    duration: moveUpDuration,
    stagger: moveUpStagger,
  });
}

export function pageIntroAnimation() {
  document.fonts.ready.then(() => {
    document.querySelectorAll("[data-page-intro-animation]").forEach((root) => {
      initPageIntroAnimation(root);
    });
  });
}
