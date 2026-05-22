import { formatStars, fixImagePath } from "./utils.js";

export function renderBestSellers(products) {
  const container = document.getElementById("best-sellers");
  if (!container) return;

  const best = [...products]
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 4);

  container.innerHTML = best.map(p => {
    const img = fixImagePath(p.img);
    const stars = formatStars(p.rating);
    const oldPrice = Math.round(p.price * (1-p.discount / 100));

    return `
      <article class="product-card">
        <figure class="card-image">
          <img src="${img}" alt="${p.description}">
          <span class="badge purple">Best Seller</span>
         ${p.discount > 0 ? `<span class="badge red">-${p.discount}%</span>` : ''}
        </figure>

        <div class="card-body">
          <h3 class="product-name">${p.description}</h3>

          <div class="stars">
            ${stars}
            <span class="review-count">(${p.quantity} left)</span>
          </div>

          <div class="bottom">
            <span class="price">₮${p.price.toLocaleString()}</span>
           ${p.discount > 0 ? `<span class="old-price">₮${oldPrice.toLocaleString()}</span>` : ''}
            <button class="add-btn">+ Add</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}