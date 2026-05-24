import { getProducts, getUser, logout, setupAuthButton } from './api.js';
import { getCart, addToCart } from './utils.js';

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

setupAuthButton();
const user = getUser();

if (user?.role === 'admin') {
  const cart = document.getElementById('shoping-cart');
  if (cart) {
    cart.outerHTML = `<a href="admin.html" style="background:#1a2133;border-radius:20px;padding:8px 14px;display:flex;align-items:center;gap:6px;text-decoration:none;color:#00D4FF;font-size:13px;font-weight:600;">
      <i class="fa-solid fa-shield-halved"></i> Admin
    </a>`;
  }
}

function renderCart(products) {
  const cart = getCart();
  const emptyEl = document.querySelector('.cart-empty');
  const contentEl = document.querySelector('.cart-content');

  if (cart.length === 0) {
    emptyEl.style.display = '';
    contentEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  contentEl.style.display = '';

  const itemsList = document.querySelector('.cart-items');
  itemsList.innerHTML = '';

  let subtotal = 0;

  cart.forEach(({ id, qty }) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const price = product.price;
    subtotal += price * qty;
    const imgSrc = product.img.replace(/\\/g, '/');

    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${imgSrc}" alt="${product.name}">
      <div class="item-info">
        <h3>${product.name}</h3>
        <p class="item-price">₮${price.toLocaleString()}</p>
      </div>
      <div class="qty-controls">
        <button class="qty-btn minus">−</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-btn plus">+</button>
      </div>
      <span class="item-subtotal">₮${(price * qty).toLocaleString()}</span>
      <button class="remove-btn"><i class="fa-solid fa-trash"></i></button>
    `;

    item.querySelector('.minus').addEventListener('click', () => changeQty(id, -1, products));
    item.querySelector('.plus').addEventListener('click', () => changeQty(id, 1, products));
    item.querySelector('.remove-btn').addEventListener('click', () => removeItem(id, products));

    itemsList.appendChild(item);
  });

  document.querySelector('.summary-subtotal').textContent = `₮${subtotal.toLocaleString()}`;
  document.querySelector('.summary-total').textContent = `₮${subtotal.toLocaleString()}`;
}

function changeQty(id, delta, products) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart(products);
}

function removeItem(id, products) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCart(products);
}

getProducts().then(renderCart);
