import { COFFEES } from "./coffee-data.js";

function createCoffeeCard(coffee) {
  return `
    <article class="coffee-profile-item">
      <h3 class="coffee-profile-item__title">${coffee.name} <span class="${coffee.subText ? "subText" : ""}">${coffee.secondaryName ? coffee.secondaryName : ""}</span></h3>

      <ul class="coffee-profile-item__list">
        <li class="test">
          <span>Насиченість</span>
          <span>${coffee.saturation}</span>
        </li>

        <li>
          <span>Кислинка</span>
          <span>${coffee.acidity}</span>
        </li>

        <li>
          <span>Гірчинка</span>
          <span>${coffee.bitterness}</span>
        </li>

        <li>
          <span>Міцність</span>
          <span>${coffee.strength}</span>
        </li>

        ${
          coffee.aroma != null
            ? `<li>
          <span>${"Аромат" ? "Аромат" : ""}</span>
          <span>${coffee.aroma}</span>
        </li>`
            : ""
        }
      </ul>
    </article>
    `;
}

export function initCoffeeCharacteristics() {
  const container = document.getElementById("coffee-grid");

  if (!container) return;

  container.innerHTML = COFFEES.map((coffee) => createCoffeeCard(coffee)).join(
    "",
  );
}
