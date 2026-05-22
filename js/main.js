import { getProducts } from "./api.js";
import { renderFeatured } from "./featured.js";
import { renderBestSellers } from "./bestSeller.js";
import { setupCategories } from "./categories.js";

document.addEventListener("DOMContentLoaded", async () => {
  const products = await getProducts();

  renderFeatured(products);
  renderBestSellers(products);
  setupCategories(products);
});

document.querySelector('.shop-now-button')?.addEventListener('click', () => {
  location.href = 'shop.html';
});

document.querySelector('.view-bundles-button')?.addEventListener('click', () => {
  location.href = 'shop.html?category=bundles';
});

document.querySelector('.shop-btn')?.addEventListener('click', () => {
  location.href = 'shop.html?category=bundles';
});

document.querySelectorAll('.categories article').forEach(article => {
  article.querySelector('button')?.addEventListener('click', () => {
    location.href = `shop.html?category=${article.dataset.category}`;
  });
});