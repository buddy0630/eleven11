const BASE = "http://localhost:3000";

export async function getProducts() {
  try {
    const res = await fetch(`${BASE}/products`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}

export async function getProduct(id) {
  try {
    const res = await fetch(`${BASE}/products/${id}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

export async function signup(first_name, last_name, email, password) {
  try {
    const res = await fetch(`${BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, password }),
    });
    return await res.json();
  } catch {
    return { error: "Cannot connect to server. Make sure it is running." };
  }
}

export async function login(email, password) {
  try {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch {
    return { error: "Cannot connect to server. Make sure it is running." };
  }
}

export async function addProduct(data) {
  try {
    const res = await fetch(`${BASE}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { error: "Cannot connect to server." };
  }
}

export async function updateProduct(id, data) {
  try {
    const res = await fetch(`${BASE}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { error: "Cannot connect to server." };
  }
}

export async function deleteProduct(id) {
  try {
    const res = await fetch(`${BASE}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return await res.json();
  } catch {
    return { error: "Cannot connect to server." };
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
  location.href = "login.html";
}

export function setupAuthButton() {
  const user = getUser();
  const btn = document.getElementById("auth-btn");
  if (!btn) return;

  if (!user) {
    btn.onclick = () => location.href = "login.html";
    return;
  }

  btn.innerHTML = `<i class="fa-regular fa-user" style="color:rgb(139,142,153)"></i> ${user.first_name}`;
  btn.onclick = null;

  const dropdown = document.createElement("div");
  dropdown.id = "auth-dropdown";
  dropdown.style.cssText = `
    display:none; position:absolute; top:52px; right:0;
    background:#131926; border:1px solid #2E3140; border-radius:12px;
    padding:8px; min-width:180px; z-index:999; box-shadow:0 8px 24px rgba(0,0,0,0.4);
  `;
  dropdown.innerHTML = `
    <div style="padding:10px 12px; border-bottom:1px solid #2E3140; margin-bottom:6px;">
      <p style="color:#F0F0F2; font-weight:600; font-size:14px;">${user.first_name} ${user.last_name || ''}</p>
      <p style="color:#8B8E99; font-size:12px;">${user.email}</p>
      <p style="color:#00D4FF; font-size:11px; margin-top:2px;">${user.role}</p>
    </div>
    <button id="signout-btn" style="width:100%;padding:8px 12px;background:rgba(239,68,68,0.12);color:#ef4444;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;text-align:left;">
      <i class="fa-solid fa-right-from-bracket"></i> Sign Out
    </button>
  `;

  btn.parentElement.style.position = "relative";
  btn.parentElement.appendChild(dropdown);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  });

  dropdown.querySelector("#signout-btn").addEventListener("click", logout);

  document.addEventListener("click", () => {
    dropdown.style.display = "none";
  });
}