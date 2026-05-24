import { getProducts, getUser, logout, setupAuthButton, addProduct, updateProduct, deleteProduct } from './api.js';

const user = getUser();
if (!user || user.role !== 'admin') {
  alert('Admins only. Please log in.');
  location.href = 'login.html';
}

setupAuthButton();

const form = document.querySelector('.main-container form');
const table = document.querySelector('.main-container table');

let editingId = null;

function buildForm(product = null) {
  editingId = product ? product.id : null;
  form.innerHTML = `
    <h3>${product ? 'Edit Product' : 'Add Product'}</h3>
    <label>Name <input type="text" id="a-name" value="${product?.name || ''}" placeholder="Product name" /></label>
    <label>Category
      <select id="a-category">
        <option value="mini-weapons"   ${product?.category === 'mini-weapons'    ? 'selected' : ''}>Mini Weapon Models</option>
        <option value="keychain"       ${product?.category === 'keychain'        ? 'selected' : ''}>Keychains</option>
        <option value="desktop-figure" ${product?.category === 'desktop-figure'  ? 'selected' : ''}>Desk Display Pieces</option>
        <option value="bundles"        ${product?.category === 'bundles'         ? 'selected' : ''}>Bundles</option>
      </select>
    </label>
    <label>Price <input type="number" id="a-price" value="${product?.price || ''}" placeholder="Price" min="0" /></label>
    <label>Quantity <input type="number" id="a-quantity" value="${product?.quantity || ''}" placeholder="Quantity" min="0" /></label>
    <label>Discount % <input type="number" id="a-discount" value="${product?.discount || 0}" placeholder="Discount" min="0" max="100" /></label>
    <label>Image path <input type="text" id="a-img" value="${(product?.img || '').replace(/\\/g, '/')}" placeholder="img/filename.jpg" /></label>
    <label>Rating
      <select id="a-rating">
        ${[1,2,3,4,5].map(n => `<option value="${n}" ${product?.rating === n ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
    </label>
    <div class="form-actions">
      <button type="button" id="save-btn">${product ? 'Update' : 'Save'}</button>
      <button type="button" id="cancel-btn">Cancel</button>
    </div>
  `;
  form.style.display = 'flex';

  document.getElementById('cancel-btn').addEventListener('click', () => {
    form.style.display = 'none';
    editingId = null;
  });

  document.getElementById('save-btn').addEventListener('click', async () => {
    const name     = document.getElementById('a-name').value.trim();
    const category = document.getElementById('a-category').value;
    const price    = parseInt(document.getElementById('a-price').value);
    const quantity = parseInt(document.getElementById('a-quantity').value);
    const discount = parseInt(document.getElementById('a-discount').value) || 0;
    const rating   = parseInt(document.getElementById('a-rating').value);

    if (!name || !price || !quantity) {
      alert('Please fill in all fields.');
      return;
    }

    const img = document.getElementById('a-img').value.trim();
    const data = { name, category, price, quantity, discount, rating, img, description: name };

    let result;
    if (editingId) {
      result = await updateProduct(editingId, data);
    } else {
      result = await addProduct(data);
    }

    if (result.error) {
      alert(result.error);
      return;
    }

    form.style.display = 'none';
    editingId = null;
    await refreshTable();
  });
}

function buildTable(products) {
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Price</th>
        <th>Qty</th>
        <th>Rating</th>
        <th>Discount</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${products.map(p => `
        <tr data-id="${p.id}">
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>₮${p.price.toLocaleString()}</td>
          <td>${p.quantity}</td>
          <td>${p.rating}/5</td>
          <td>${p.discount}%</td>
          <td>
            <button class="edit-btn" data-id="${p.id}">Edit</button>
            <button class="delete-btn" data-id="${p.id}">Delete</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  table.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = products.find(p => p.id === parseInt(btn.dataset.id));
      buildForm(product);
    });
  });

  table.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this product?')) return;
      const result = await deleteProduct(btn.dataset.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      await refreshTable();
    });
  });
}

document.querySelector('.main-container > article button')?.addEventListener('click', () => buildForm());

async function updateStats(products) {
  const total    = products.length;
  const inStock  = products.filter(p => p.quantity > 0).length;
  const value    = products.reduce((sum, p) => sum + p.price, 0);
  const avgRating= products.filter(p => p.rating > 0).length
    ? (products.reduce((sum, p) => sum + p.rating, 0) / products.filter(p => p.rating > 0).length).toFixed(1)
    : '0.0';

  document.querySelector('#box-icon').closest('article').querySelector('h1').textContent = total;
  document.querySelector('#correct-icon').closest('article').querySelector('h1').textContent = inStock;
  document.querySelector('#dollar-icon').closest('article').querySelector('h1').textContent = `₮${value.toLocaleString()}`;
  document.querySelector('#up-trending-icon').closest('article').querySelector('h1').textContent = avgRating;
}

async function refreshTable() {
  const products = await getProducts();
  buildTable(products);
  updateStats(products);
}

refreshTable();
