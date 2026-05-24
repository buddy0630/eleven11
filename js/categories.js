import { fixImagePath } from "./utils.js";

export function setupCategories(products) {
  const productsByCategory = {};

  products.forEach(p => {
    if (!productsByCategory[p.category]) {
      productsByCategory[p.category] = [];
    }
    productsByCategory[p.category].push(fixImagePath(p.img));
  });

  const cards = document.querySelectorAll(".categories article");

  cards.forEach(card => {
    const category = card.dataset.category;
    const imgEl = card.querySelector("img");
    const images = productsByCategory[category];

    if (!images || images.length === 0) return;

    imgEl.src = images[0];

    if (images.length === 1) return;

    let index = 0;

    setInterval(() => {
      index = (index + 1) % images.length;

      imgEl.style.opacity = "0";

      setTimeout(() => {
        imgEl.src = images[index];
        imgEl.style.opacity = "1";
      }, 300);
    }, 5000);
  });
}