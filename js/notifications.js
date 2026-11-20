(() => {
  const bell = document.getElementById("notificationBell");
  const panel = document.getElementById("notificationPanel");
  const viewer = document.getElementById("notificationViewer");
  const title = document.getElementById("notificationDocumentTitle");
  const content = document.getElementById("notificationDocumentContent");
  const closeButton = document.getElementById("notificationDocumentClose");
  if (!bell || !panel || !viewer || !title || !content || !closeButton) return;

  let previousFocus = null;

  const closePanel = () => {
    panel.hidden = true;
    bell.setAttribute("aria-expanded", "false");
  };

  const closeViewer = () => {
    if (viewer.hidden) return;
    viewer.hidden = true;
    document.body.classList.remove("notification-viewer-open");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  };

  bell.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    bell.setAttribute("aria-expanded", String(willOpen));
  });

  panel.addEventListener("click", (event) => event.stopPropagation());
  panel.querySelectorAll(".notification-option").forEach((option) => {
    option.addEventListener("click", () => {
      previousFocus = option;
      title.textContent = option.dataset.noticeTitle || "Lộ trình";
      content.replaceChildren();
      closePanel();
      viewer.hidden = false;
      document.body.classList.add("notification-viewer-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeViewer);
  viewer.querySelector("[data-close-notice]").addEventListener("click", closeViewer);
  document.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!viewer.hidden) closeViewer();
      else closePanel();
    }
  });
})();
