const API_BASE_URL = "http://localhost:5000";

export async function getGoldPrice() {
  const response = await fetch(`${API_BASE_URL}/api/gold-price`);

  if (!response.ok) {
    throw new Error("Failed to fetch gold price.");
  }

  const result = await response.json();

  return result.data;
}