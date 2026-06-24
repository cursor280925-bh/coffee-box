import {
  COFFEE_ITEMS,
  ITEMS_PER_SLIDE,
  SYRUP_PRICE,
  FREE_MILK,
  CREAM,
  STORAGE_KEY,
} from "./coffee-items.js";

import plusIcon from "../images/plus.svg";
import minusIcon from "../images/minus.svg";

function formatCardPrice(value) {
  return value.toFixed(2).replace(".", ",");
}

function formatTotalPrice(value) {
  return value.toFixed(2);
}

function createDefaultState() {
  return {
    quantities: COFFEE_ITEMS.map(() => 1),
    activeItems: COFFEE_ITEMS.map(() => false),
    syrupCount: 0,
    milkCount: 0,
    creamCount: 0,
    currentSlide: 0,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();

    const saved = JSON.parse(raw);
    const defaults = createDefaultState();

    return {
      quantities: COFFEE_ITEMS.map(
        (_, index) => saved.quantities?.[index] ?? defaults.quantities[index],
      ),
      activeItems: COFFEE_ITEMS.map(
        (_, index) => saved.activeItems?.[index] ?? defaults.activeItems[index],
      ),
      syrupCount: saved.syrupCount ?? 0,
      milkCount: saved.milkCount ?? 0,
      creamCount: saved.creamCount ?? 0,
      currentSlide: saved.currentSlide ?? 0,
    };
  } catch {
    return createDefaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calculateTotal(state) {
  const itemsTotal = state.quantities.reduce((sum, qty, index) => {
    if (!state.activeItems[index]) return sum;
    return sum + qty * COFFEE_ITEMS[index].unitPrice;
  }, 0);

  return (
    itemsTotal +
    state.syrupCount * SYRUP_PRICE +
    state.milkCount * FREE_MILK +
    state.creamCount * CREAM
  );
}

function chunkItems(items, size) {
  const slides = [];

  for (let index = 0; index < items.length; index += size) {
    slides.push(items.slice(index, index + size));
  }

  return slides;
}

function createCard(item, globalIndex, quantity, isActive) {
  const card = document.createElement("article");
  card.className = `card${isActive ? " card_active" : ""}`;
  card.dataset.index = String(globalIndex);

  const lineTotal = item.unitPrice * quantity;

  card.innerHTML = `
    <div class="price-box">
      <p class="price">${formatCardPrice(lineTotal)}</p>
    </div>
    <h3 class="card-title${item.longTitle ? " card-title_long" : ""}">${item.name}</h3>
    <div class="counter-box">
      <button class="btn-counter minus" type="button" aria-label="Зменшити кількість">
        <img src="${minusIcon}" alt="minus icon" width="15" height="15" />
      </button>
      <p class="number">${quantity}</p>
      <button class="btn-counter plus" type="button" aria-label="Збільшити кількість">
        <img src="${plusIcon}" alt="plus icon" width="15" height="15" />
      </button>
    </div>
  `;

  return card;
}

function renderSlides(track, state) {
  track.innerHTML = "";
  const slides = chunkItems(COFFEE_ITEMS, ITEMS_PER_SLIDE);

  slides.forEach((slideItems, slideIndex) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.dataset.slide = String(slideIndex);

    const cards = document.createElement("div");
    cards.className = "cards";

    slideItems.forEach((item, itemIndex) => {
      const globalIndex = slideIndex * ITEMS_PER_SLIDE + itemIndex;
      cards.appendChild(
        createCard(
          item,
          globalIndex,
          state.quantities[globalIndex],
          state.activeItems[globalIndex],
        ),
      );
    });

    slide.appendChild(cards);
    track.appendChild(slide);
  });
}

function updateCardUI(card, item, quantity) {
  card.querySelector(".price").textContent = formatCardPrice(
    item.unitPrice * quantity,
  );
  card.querySelector(".number").textContent = String(quantity);
}

function updateCardState(card, isActive) {
  card.classList.toggle("card_active", isActive);
}

function updateTotalDisplay(totalEl, state) {
  totalEl.textContent = formatTotalPrice(calculateTotal(state));
}

function getSlideCount() {
  return Math.ceil(COFFEE_ITEMS.length / ITEMS_PER_SLIDE);
}

function updateSliderPosition(track, slideIndex) {
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
}

function updateArrowState(section, slideIndex) {
  const backBtn = section.querySelector(".arrow-back");
  const nextBtn = section.querySelector(".arrow-next");
  const lastSlide = getSlideCount() - 1;

  backBtn.disabled = slideIndex <= 0;
  nextBtn.disabled = slideIndex >= lastSlide;

  backBtn.classList.toggle("arrow_disabled", slideIndex <= 0);
  nextBtn.classList.toggle("arrow_disabled", slideIndex >= lastSlide);
}

function goToSlide(section, track, state, slideIndex) {
  const lastSlide = getSlideCount() - 1;
  const nextSlide = Math.max(0, Math.min(slideIndex, lastSlide));

  if (nextSlide === state.currentSlide) return;

  state.currentSlide = nextSlide;
  updateSliderPosition(track, nextSlide);
  updateArrowState(section, nextSlide);
  saveState(state);
}

function initSwipe(section, track, state) {
  let startX = 0;
  let isDragging = false;
  const threshold = 50;

  const onStart = (clientX) => {
    startX = clientX;
    isDragging = true;
  };

  const onEnd = (clientX) => {
    if (!isDragging) return;

    const delta = clientX - startX;
    isDragging = false;

    if (Math.abs(delta) < threshold) return;

    if (delta < 0) {
      goToSlide(section, track, state, state.currentSlide + 1);
    } else {
      goToSlide(section, track, state, state.currentSlide - 1);
    }
  };

  track.addEventListener(
    "touchstart",
    (event) => onStart(event.changedTouches[0].clientX),
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    (event) => onEnd(event.changedTouches[0].clientX),
    { passive: true },
  );

  track.addEventListener("mousedown", (event) => onStart(event.clientX));
  track.addEventListener("mouseup", (event) => onEnd(event.clientX));
  track.addEventListener("mouseleave", () => {
    isDragging = false;
  });
}

// те що імпортується в index.js
export function initCoffeeList() {
  const section = document.querySelector(".coffe-list");
  const footer = document.querySelector(".coffee-footer");

  if (!section || !footer) return;

  const track = section.querySelector(".slider-track");
  const totalEl = footer.querySelector(".example-amount");
  const resetBtn = footer.querySelector(".calculation");
  const syrupPlusBtn = footer.querySelector(".syrup-plus");
  const syrupMinusBtn = footer.querySelector(".syrup-minus");
  const milkPlusBtn = footer.querySelector(".milk-plus");
  const milkMinusBtn = footer.querySelector(".milk-minus");
  const creamPlusBtn = footer.querySelector(".cream-plus");
  const creamMinusBtn = footer.querySelector(".cream-minus");
  const backBtn = section.querySelector(".arrow-back");
  const nextBtn = section.querySelector(".arrow-next");

  const state = loadState();

  renderSlides(track, state);
  updateSliderPosition(track, state.currentSlide);
  updateArrowState(section, state.currentSlide);
  updateTotalDisplay(totalEl, state);

  section.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card) return;

    const index = Number(card.dataset.index);
    const item = COFFEE_ITEMS[index];
    if (!item) return;

    if (event.target.closest(".plus")) {
      if (!state.activeItems[index]) {
        state.activeItems[index] = true;
        updateCardState(card, true);
      } else {
        state.quantities[index] += 1;
      }
      updateCardUI(card, item, state.quantities[index]);
    }

    if (event.target.closest(".minus") && state.activeItems[index]) {
      if (state.quantities[index] > 1) {
        state.quantities[index] -= 1;
        updateCardUI(card, item, state.quantities[index]);
      } else {
        state.activeItems[index] = false;
        state.quantities[index] = 1;
        updateCardUI(card, item, 1);
        updateCardState(card, false);
      }
    }

    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  syrupPlusBtn.addEventListener("click", () => {
    state.syrupCount += 1;
    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  syrupMinusBtn.addEventListener("click", () => {
    if (state.syrupCount <= 0) return;

    state.syrupCount -= 1;
    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  milkPlusBtn.addEventListener("click", () => {
    state.milkCount += 1;
    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  milkMinusBtn.addEventListener("click", () => {
    if (state.milkCount <= 0) return;

    state.milkCount -= 1;
    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  creamPlusBtn.addEventListener("click", () => {
    state.creamCount += 1;
    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  creamMinusBtn.addEventListener("click", () => {
    if (state.creamCount <= 0) return;

    state.creamCount -= 1;
    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  resetBtn.addEventListener("click", () => {
    state.quantities = COFFEE_ITEMS.map(() => 1);
    state.activeItems = COFFEE_ITEMS.map(() => false);
    state.syrupCount = 0;
    state.milkCount = 0;
    state.creamCount = 0;
    // state.currentSlide = 0;

    section.querySelectorAll(".card").forEach((card) => {
      const index = Number(card.dataset.index);
      updateCardUI(card, COFFEE_ITEMS[index], 1);
      updateCardState(card, false);
    });

    goToSlide(section, track, state, 0);
    updateTotalDisplay(totalEl, state);
    saveState(state);
  });

  backBtn.addEventListener("click", () => {
    goToSlide(section, track, state, state.currentSlide - 1);
  });

  nextBtn.addEventListener("click", () => {
    goToSlide(section, track, state, state.currentSlide + 1);
  });

  initSwipe(section, track, state);
}
