const GOLD_PRICE_API_URL =
  "https://api.brsapi.ir/Market/Gold_Currency.php";

const CACHE_DURATION_MS = 60 * 1000; // 1 minute

let cachedGoldPrice = null;
let cachedAt = 0;

async function fetchGold18PriceFromProvider() {
  const apiKey = process.env.BRSAPI_KEY;

  if (!apiKey) {
    throw new Error("BRSAPI_KEY is not configured.");
  }

  const url = `${GOLD_PRICE_API_URL}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `BRSAPI returned HTTP ${response.status}.`,
    );
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.gold)) {
    throw new Error("Invalid BRSAPI response: gold data is missing.");
  }

  const gold18 = data.gold.find(
    (item) => item.symbol === "IR_GOLD_18K",
  );

  if (!gold18) {
    throw new Error("18K gold was not found in BRSAPI response.");
  }

  const pricePerGram = Number(gold18.price);

  if (!Number.isFinite(pricePerGram) || pricePerGram <= 0) {
    throw new Error("Invalid 18K gold price received from BRSAPI.");
  }

  return {
    asset: "gold_18",
    currency: "toman",
    pricePerGram,
    updatedAt: new Date(
      gold18.time_unix * 1000,
    ).toISOString(),
    status: "live",
    source: "brsapi",
  };
}

async function fetchGold18Price() {
  const now = Date.now();

  if (
    cachedGoldPrice &&
    now - cachedAt < CACHE_DURATION_MS
  ) {
    return cachedGoldPrice;
  }

  const goldPrice = await fetchGold18PriceFromProvider();

  cachedGoldPrice = goldPrice;
  cachedAt = now;

  return goldPrice;
}

module.exports = {
  fetchGold18Price,
};