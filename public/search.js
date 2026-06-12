window.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#search");
  if (!root || typeof window.PagefindUI !== "function") return;

  new window.PagefindUI({
    element: "#search",
    showImages: false,
    showSubResults: true,
    excerptLength: 30,
    resetStyles: false
  });
});
