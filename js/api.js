export async function getProducts() {
  try {
    const res = await fetch("./data.json");
    const data = await res.json();
    return data.products;
  } catch (err) {
    console.error("JSON error:", err);
    return [];
  }
}