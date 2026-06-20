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

  const bindSearchLabel = () => {
    const input = root.querySelector(".pagefind-ui__search-input");
    if (!input) return false;
    input.id = "site-search-input";
    return true;
  };

  if (!bindSearchLabel()) {
    const observer = new MutationObserver(() => {
      if (bindSearchLabel()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
  }
});
