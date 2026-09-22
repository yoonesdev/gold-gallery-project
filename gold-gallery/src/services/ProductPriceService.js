const API_BASE_URL = "http://localhost:5000";

export async function getProductPrice(productId) {
  const response = await fetch(
    `${API_BASE_URL}/api/products/${productId}/price`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product price.");
  }

  const result = await response.json();

  return result.data;
}