import { smoothScroll } from "./modules/smooth-scroll";
import { lucideIcons } from "./modules/lucide-icons";
import { scrollHeaderAnimation } from "./modules/scroll-header-animation";
import { slider } from "./modules/slider";
import { accordion } from "./modules/accordion";
import { mobileNav } from "./modules/mobile-nav";
import { pageIntroAnimation } from "./modules/page-intro-animation";

document.addEventListener("DOMContentLoaded", () => {
  smoothScroll();
  lucideIcons();
  scrollHeaderAnimation();
  slider();
  accordion();
  mobileNav();
  pageIntroAnimation();
});
