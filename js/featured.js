import { formatStars, fixImagePath } from "./utils.js";

export function renderFeatured(products) {
  const container = document.getElementById("featured-products");
  if (!container) return;

  const top = products.slice(0, 4);

  container.innerHTML = top.map(product => {
    const stars = formatStars(product.rating);
    const img = fixImagePath(product.img);

    return `
      <article class="product-card">
        <figure class="card-image">
          <img src="${img}" alt="${product.name}"
            onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <span class="badge purple">Featured</span>
          ${product.discount > 0 ? `<span class="badge red">-${product.discount}%</span>` : ''}
        </figure>

        <div class="card-body">
          <h3 class="product-name">${product.name}</h3>

          <div class="stars">${stars}</div>

          <div class="bottom">
            <span class="price">₮${product.price.toLocaleString()}</span>
           ${product.discount > 0 ? `<span class="old-price">₮${Math.round((product.price*100) /(100-product.discount )).toLocaleString()}</span>` : ''}
            <button class="add-btn">+ Add</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}