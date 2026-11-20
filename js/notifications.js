(() => {
  const bell = document.getElementById("notificationBell");
  const panel = document.getElementById("notificationPanel");
  if (!bell || !panel) return;

  const closePanel = () => {
    panel.hidden = true;
    bell.setAttribute("aria-expanded", "false");
  };

  bell.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    bell.setAttribute("aria-expanded", String(willOpen));
  });

  panel.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
      bell.focus();
    }
  });
})();
