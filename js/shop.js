import { getProducts, getUser, logout, setupAuthButton } from './api.js';

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

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

const productsPerPage = 4;
let currentPage = 1;
let allProducts = [];

const filters = {
  category: 'all',
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  hot: false,
  new: false,
  bestseller: false,
  search: '',
};

const categoryMap = {
  'All': 'all',
  'Mini Weapon Models': 'mini-weapons',
  'Keychains': 'keychain',
  'Desk Display Pieces': 'desktop-figure',
  'Bundles': 'bundles',
};

function getFiltered() {
  return allProducts.filter(p => {
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.minPrice !== null && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && p.price > filters.maxPrice) return false;
    if (filters.hot && p.rating < 3) return false;
    if (filters.new && p.quantity <= 80) return false;
    if (filters.bestseller && p.quantity >= 50) return false;
    if (filters.inStockOnly && p.quantity <= 0) return false;
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

function renderStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function createCard(product) {
  const imgSrc = product.img.replace(/\\/g, '/');
  const hasDiscount = product.discount > 0;
  const oldPrice = hasDiscount ? Math.round(product.price / (1 - product.discount / 100)) : null;

  const card = document.createElement('article');
  card.className = 'product-card';
  card.innerHTML = `
    <figure class="card-image">
      <img src="${imgSrc}" alt="${product.name}">
      ${hasDiscount ? `<span class="badge red">-${product.discount}%</span>` : ''}
    </figure>
    <div class="card-body">
      <h3 class="product-name">${product.name}</h3>
      <div class="stars">${renderStars(product.rating)}</div>
      <div class="bottom">
        <span class="price">₮${product.price.toLocaleString()}</span>
        ${hasDiscount ? `<span class="old-price">₮${oldPrice.toLocaleString()}</span>` : ''}
        <button class="add-btn">+ Add</button>
      </div>
    </div>
  `;
  const addBtn = card.querySelector('.add-btn');
  if (user?.role === 'admin') {
    addBtn.style.display = 'none';
  } else {
    addBtn.addEventListener('click', () => {
      addToCart(product.id);
      addBtn.textContent = '✓ Added';
      setTimeout(() => { addBtn.textContent = '+ Add'; }, 1000);
    });
  }

  return card;
}

function showPage(page) {
  const list = document.querySelector('.products ul');
  const filtered = getFiltered();
  list.innerHTML = '';
  const start = (page - 1) * productsPerPage;
  filtered.slice(start, start + productsPerPage).forEach(product => {
    list.appendChild(createCard(product));
  });
}

function updateButtons() {
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent == currentPage) btn.classList.add('active');
  });
}

function updatePagination() {
  const totalPages = Math.ceil(getFiltered().length / productsPerPage);
  document.querySelectorAll('.page-btn').forEach(btn => {
    if (!btn.textContent.includes('Prev') && !btn.textContent.includes('Next')) {
      btn.style.display = Number(btn.textContent) <= totalPages ? '' : 'none';
    }
  });
}

function applyFilters() {
  currentPage = 1;
  showPage(currentPage);
  updateButtons();
  updatePagination();
}

// Category buttons
document.querySelectorAll('.category button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filters.category = categoryMap[btn.textContent] ?? 'all';
    applyFilters();
  });
});

// Price range inputs
const [minInput, maxInput] = document.querySelectorAll('.price-range input');
minInput.addEventListener('input', () => {
  filters.minPrice = minInput.value ? Number(minInput.value) : null;
  applyFilters();
});
maxInput.addEventListener('input', () => {
  filters.maxPrice = maxInput.value ? Number(maxInput.value) : null;
  applyFilters();
});

// Status buttons
document.querySelectorAll('.status button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.status button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const text = btn.textContent.trim();
    filters.hot = text === 'Hot';
    filters.new = text === 'New Arrivals';
    filters.bestseller = text === 'Best Sellers';
    filters.inStockOnly = text === 'In stock only';
    applyFilters();
  });
});

// Pagination buttons
document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const totalPages = Math.ceil(getFiltered().length / productsPerPage);
    if (btn.textContent.includes('Prev') && currentPage > 1) {
      currentPage--;
    } else if (btn.textContent.includes('Next') && currentPage < totalPages) {
      currentPage++;
    } else if (!isNaN(btn.textContent)) {
      currentPage = Number(btn.textContent);
    }
    showPage(currentPage);
    updateButtons();
  });
});

// Search button
const searchInput = document.querySelector('.search-bar input');
document.querySelector('.search-bar button')?.addEventListener('click', () => {
  filters.search = searchInput.value.trim();
  applyFilters();
});
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    filters.search = searchInput.value.trim();
    applyFilters();
  }
});

getProducts().then(products => {
  allProducts = products;

  const params = new URLSearchParams(location.search);

  // Pre-select category from URL param (e.g. shop.html?category=bundles)
  const urlCategory = params.get('category');
  if (urlCategory) {
    filters.category = urlCategory;
    document.querySelectorAll('.category button').forEach(btn => {
      btn.classList.remove('active');
      if (categoryMap[btn.textContent] === urlCategory) btn.classList.add('active');
    });
  }

  // Pre-fill search from URL param (e.g. shop.html?search=knife)
  const urlSearch = params.get('search');
  if (urlSearch) {
    filters.search = urlSearch;
    if (searchInput) searchInput.value = urlSearch;
  }

  showPage(currentPage);
  updateButtons();
  updatePagination();
});
