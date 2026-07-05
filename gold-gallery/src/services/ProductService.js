import products from "../data/products.json";

/**
 * Get all products
 */
export function getProducts() {
  return products;
}

/**
 * Get single product by ID
 */
export function getProductById(id) {
  return products.find(
    (product) => product.id === Number(id)
  );
}

/**
 * Get products by category
 */
export function getProductsByCategory(category) {
  if (!category) return products;

  return products.filter(
    (product) => product.category === category
  );
}

/**
 * Get products by seller
 */
export function getProductsBySeller(sellerId) {
  return products.filter(
    (product) => product.sellerId === Number(sellerId)
  );
}

/**
 * Search products by title
 */
export function searchProducts(query) {
  if (!query || !query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return products.filter((product) =>
    product.title.toLowerCase().includes(lowerQuery)
  );
}

// ✅ NEW: related products helper
export function getRelatedProducts(productId, category) {
  return products
    .filter(
      (p) =>
        p.id !== Number(productId) &&
        p.category === category,
    )
    .slice(0, 4);
}