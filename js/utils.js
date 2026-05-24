export function formatStars(rating = 0) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function fixImagePath(path) {
  if (!path) return '';
  return path.replace(/\\/g, "/");
}

export function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

export function addToCart(id) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}