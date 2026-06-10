const burgerMenu = document.getElementById("burger-menu");
const openBurgerButtons = document.querySelectorAll("[data-open-burger]");
const closeBurgerButtons = document.querySelectorAll("[data-close-burger]");

function openBurgerMenu() {
  if (!burgerMenu) return;

  burgerMenu.setAttribute("aria-hidden", "false");
}

function closeBurgerMenu() {
  if (!burgerMenu) return;

  burgerMenu.setAttribute("aria-hidden", "true");

  openBurgerButtons[0]?.focus();
}

export function initBurgerMenu() {
  openBurgerButtons.forEach((btn) =>
    btn.addEventListener("click", openBurgerMenu),
  );
  closeBurgerButtons.forEach((btn) =>
    btn.addEventListener("click", closeBurgerMenu),
  );
}

export { openBurgerMenu, closeBurgerMenu };
