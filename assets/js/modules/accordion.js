export function accordion() {
  const accordionSections = document.querySelectorAll("[data-accordion]");
  if (!accordionSections) return;

  accordionSections.forEach((section) => {
    const items = section.querySelectorAll("[data-accordion-item]");

    items.forEach((item) => {
      const trigger = item.querySelector("[data-accordion-trigger]");
      const content = item.querySelector("[data-accordion-content]");
      const verticalBar = item.querySelector("[data-accordion-vertical]");

      trigger.addEventListener("click", () => {
        const isOpen = content.style.gridTemplateRows === "1fr";

        items.forEach((otherItem) => {
          const otherContent = otherItem.querySelector(
            "[data-accordion-content]",
          );
          const otherVertical = otherItem.querySelector(
            "[data-accordion-vertical]",
          );

          otherContent.style.gridTemplateRows = "0fr";
          otherVertical.classList.add("rotate-90");
        });

        if (!isOpen) {
          content.style.gridTemplateRows = "1fr";

          verticalBar.classList.remove("rotate-90");
        }
      });
    });
  });
}
