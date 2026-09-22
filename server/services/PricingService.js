const WEIGHT_BASED_PRICING_MODEL = "weight_based";

function assertNonNegativeNumber(value, fieldName) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new TypeError(
      `${fieldName} must be a non-negative number.`,
    );
  }
}

function assertRate(value, fieldName) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new RangeError(
      `${fieldName} must be a number between 0 and 1.`,
    );
  }
}

function roundToman(value) {
  return Math.round(value);
}

function supportsLiveGoldPricing(product) {
  return (
    product?.karat === 18 &&
    product?.pricing?.model === WEIGHT_BASED_PRICING_MODEL &&
    typeof product.pricing.weightGrams === "number" &&
    typeof product.pricing.makingFeePerGramToman === "number" &&
    typeof product.pricing.sellerProfitRate === "number" &&
    typeof product.pricing.stonePriceToman === "number"
  );
}

function calculateLiveGoldQuote(product, marketPrice) {
  if (!supportsLiveGoldPricing(product)) {
    throw new Error(
      "This product does not have a complete 18K live-pricing configuration.",
    );
  }

  if (
    marketPrice?.asset !== "gold_18" ||
    marketPrice?.currency !== "toman"
  ) {
    throw new Error(
      "A 18K gold market price in toman is required.",
    );
  }

  const {
    weightGrams,
    makingFeePerGramToman,
    sellerProfitRate,
    stonePriceToman,
  } = product.pricing;

  assertNonNegativeNumber(
    marketPrice.pricePerGram,
    "marketPrice.pricePerGram",
  );

  assertNonNegativeNumber(
    weightGrams,
    "pricing.weightGrams",
  );

  assertNonNegativeNumber(
    makingFeePerGramToman,
    "pricing.makingFeePerGramToman",
  );

  assertNonNegativeNumber(
    stonePriceToman,
    "pricing.stonePriceToman",
  );

  assertRate(
    sellerProfitRate,
    "pricing.sellerProfitRate",
  );

  const goldValueToman = roundToman(
    marketPrice.pricePerGram * weightGrams,
  );

  const makingFeeToman = roundToman(
    makingFeePerGramToman * weightGrams,
  );

  const costBeforeProfitToman =
    goldValueToman +
    makingFeeToman +
    stonePriceToman;

  const sellerProfitToman = roundToman(
    costBeforeProfitToman * sellerProfitRate,
  );

  return {
    priceToman:
      costBeforeProfitToman +
      sellerProfitToman,

    goldValueToman,
    makingFeeToman,
    stonePriceToman,
    sellerProfitToman,

    marketPricePerGramToman:
      marketPrice.pricePerGram,

    marketPriceUpdatedAt:
      marketPrice.updatedAt,

    marketPriceStatus:
      marketPrice.status,
  };
}

function calculateProductPrice(product, marketPrice) {
  if (
    supportsLiveGoldPricing(product) &&
    marketPrice?.status === "live"
  ) {
    return {
      ...calculateLiveGoldQuote(
        product,
        marketPrice,
      ),
      mode: "live",
    };
  }

  return {
    priceToman: product.price,
    mode: "fixed",
  };
}

module.exports = {
  supportsLiveGoldPricing,
  calculateLiveGoldQuote,
  calculateProductPrice,
};