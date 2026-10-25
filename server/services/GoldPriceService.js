
const GOLD_PRICE_API_URL =
  "https://servix.cc/api/v1/assets/GOLD_18_RLS";

const CACHE_DURATION_MS = 60 * 1000; // 1 minute

let cachedGoldPrice = null;
let cachedAt = 0;

async function fetchGold18PriceFromProvider() {
  const apiKey = process.env.SERVIX_API_KEY;

  if (!apiKey) {
    throw new Error("SERVIX_API_KEY is not configured.");
  }

  const response = await fetch(GOLD_PRICE_API_URL, {
    headers: {
      "X-API-Key": apiKey,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(
      `Servix returned HTTP ${response.status}.`,
    );
  }

  const data = await response.json();

  if (
    !data ||
    data.code !== "GOLD_18_RLS" ||
    data.quoteUnit !== "RLS"
  ) {
    throw new Error("Invalid Servix gold-price response.");
  }

  const priceInRials = Number(data.value);

  if (!Number.isFinite(priceInRials) || priceInRials <= 0) {
    throw new Error("Invalid 18K gold price received from Servix.");
  }

  const updatedAt = new Date(data.businessTime);

  if (Number.isNaN(updatedAt.getTime())) {
    throw new Error("Invalid gold-price timestamp received from Servix.");
  }

  // Servix returns rials; Gold Gallery uses tomans.
  const pricePerGram = Math.round(priceInRials / 10);

  return {
    asset: "gold_18",
    currency: "toman",
    pricePerGram,
    updatedAt: updatedAt.toISOString(),
    status: "live",
    source: "servix",
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
  cachedAt = Date.now();

  return cachedGoldPrice;
}

module.exports = {
  fetchGold18Price,
};
