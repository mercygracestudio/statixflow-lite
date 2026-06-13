import { getSmoother } from "./smooth-scroll";

export function mobileNav() {
  const trigger = document.querySelector("[data-mobile-nav-trigger]");
  const sheet = document.querySelector("[data-mobile-nav-sheet]");
  const overlay = document.querySelector("[data-mobile-nav-overlay]");

  if (!trigger || !sheet || !overlay) return;

  function open() {
    trigger.setAttribute("open", true);
    sheet.setAttribute("open", true);
    overlay.setAttribute("open", true);
    document.body.style.overflow = "hidden";

    const smoother = getSmoother();
    if (smoother) smoother.paused(true);
  }

  function close() {
    trigger.removeAttribute("open");
    sheet.removeAttribute("open");
    overlay.removeAttribute("open");
    document.body.style.overflow = "";

    const smoother = getSmoother();
    if (smoother) smoother.paused(false);
  }

  function toggle() {
    const isOpen = sheet.getAttribute("open");
    isOpen ? close() : open();
  }

  trigger.addEventListener("click", toggle);

  overlay.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.getAttribute("open")) {
      close();
    }
  });

  const mq = window.matchMedia("(min-width: 1281px)");
  mq.addEventListener("change", (e) => {
    if (e.matches && sheet.getAttribute("open")) {
      close();
    }
  });

  sheet.querySelectorAll("[data-mobile-nav-link]").forEach((link) => {
    link.addEventListener("click", close);
  });
}
