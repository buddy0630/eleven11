import { getProducts, getUser, logout, setupAuthButton } from "./api.js";
import { renderFeatured } from "./featured.js";
import { renderBestSellers } from "./bestSeller.js";
import { setupCategories } from "./categories.js";
import { addToCart } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const products = await getProducts();

  renderFeatured(products);
  renderBestSellers(products);
  setupCategories(products);

  setupAuthButton();
  const user = getUser();

  if (user?.role === 'admin') {
    const cart = document.getElementById("shoping-cart");
    if (cart) {
      cart.outerHTML = `<a href="admin.html" style="background:#1a2133;border-radius:20px;padding:8px 14px;display:flex;align-items:center;gap:6px;text-decoration:none;color:#00D4FF;font-size:13px;font-weight:600;">
        <i class="fa-solid fa-shield-halved"></i> Admin
      </a>`;
    }
    document.querySelectorAll('.add-btn').forEach(btn => btn.style.display = 'none');
  } else {
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        addToCart(id);
        btn.textContent = '✓ Added';
        setTimeout(() => btn.textContent = '+ Add', 1000);
      });
    });
  }
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