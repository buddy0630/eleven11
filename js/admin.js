import { getProducts } from './api.js';

const form = document.querySelector('.main-container form');
const table = document.querySelector('.main-container table');

function buildForm() {
  form.innerHTML = `
    <h3>Add Product</h3>
    <label>Name <input type="text" id="a-name" placeholder="Product name" /></label>
    <label>Category
      <select id="a-category">
        <option value="mini-weapons">Mini Weapon Models</option>
        <option value="keychain">Keychains</option>
        <option value="desktop-figure">Desk Display Pieces</option>
        <option value="bundles">Bundles</option>
      </select>
    </label>
    <label>Price <input type="number" id="a-price" placeholder="Price" min="0" /></label>
    <label>Quantity <input type="number" id="a-quantity" placeholder="Quantity" min="0" /></label>
    <label>Rating
      <select id="a-rating">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5" selected>5</option>
      </select>
    </label>
    <div class="form-actions">
      <button type="button" id="save-btn">Save</button>
      <button type="button" id="cancel-btn">Cancel</button>
    </div>
  `;
  form.style.display = 'flex';

  document.getElementById('cancel-btn').addEventListener('click', () => {
    form.style.display = 'none';
  });

  document.getElementById('save-btn').addEventListener('click', () => {
    const name = document.getElementById('a-name').value.trim();
    const price = document.getElementById('a-price').value;
    const quantity = document.getElementById('a-quantity').value;
    if (!name || !price || !quantity) {
      alert('Please fill in all fields.');
      return;
    }
    alert(`Product "${name}" added.`);
    form.style.display = 'none';
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
      </tr>
    </thead>
    <tbody>
      ${products.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>₮${p.price.toLocaleString()}</td>
          <td>${p.quantity}</td>
          <td>${p.rating}/5</td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

document.querySelector('.main-container > article button')?.addEventListener('click', buildForm);

getProducts().then(products => {
  buildTable(products);
});
