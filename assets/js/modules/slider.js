import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";

function parseSliderConfig(sliderEl) {
  const raw = sliderEl.getAttribute("data-slider-config");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Invalid data-slider-config JSON:", e);
    return {};
  }
}

export function slider() {
  const sliderEls = document.querySelectorAll("[data-slider]");

  sliderEls.forEach((sliderEl) => {
    const swiperEl = sliderEl.querySelector(".swiper");

    if (!swiperEl) return;

    const sliderPaginationEl = sliderEl.querySelector(
      "[data-slider-pagination]",
    );
    const sliderBtnPrevEl = sliderEl.querySelector("[data-slider-btn='prev']");
    const sliderBtnNextEl = sliderEl.querySelector("[data-slider-btn='next']");

    const instanceConfig = parseSliderConfig(sliderEl);

    const defaults = {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      speed: 600,
      autoHeight: false,
      pagination: {
        el: sliderPaginationEl,
        clickable: true,
        renderBullet: function (_, className) {
          return `<span class="${className}"></span>`;
        },
      },
      navigation: {
        prevEl: sliderBtnPrevEl,
        nextEl: sliderBtnNextEl,
      },
    };

    const swiper = new Swiper(swiperEl, { ...defaults, ...instanceConfig });

    return swiper;
  });
}
