import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateLiveGoldQuote,
  getProductPrice,
  supportsLiveGoldPricing,
} from "./PricingService.js";

const marketPrice = {
  asset: "gold_18",
  currency: "toman",
  pricePerGram: 7_500_000,
  updatedAt: "2026-09-03T09:00:00.000Z",
  status: "live",
};

const livePricedProduct = {
  id: 101,
  karat: 18,
  price: 1,
  pricing: {
    model: "weight_based",
    weightGrams: 2,
    makingFeePerGramToman: 500_000,
    sellerProfitRate: 0.1,
    stonePriceToman: 1_000_000,
  },
};

test("calculates a transparent 18K jewellery quote", () => {
  const quote = calculateLiveGoldQuote(livePricedProduct, marketPrice);

  assert.deepEqual(quote, {
    priceToman: 18_700_000,
    goldValueToman: 15_000_000,
    makingFeeToman: 1_000_000,
    stonePriceToman: 1_000_000,
    sellerProfitToman: 1_700_000,
    marketPricePerGramToman: 7_500_000,
    marketPriceUpdatedAt: "2026-09-03T09:00:00.000Z",
    marketPriceStatus: "live",
  });
});

test("keeps incomplete products on their fixed price", () => {
  const fixedPriceProduct = { id: 102, price: 2_300_000, karat: 18 };

  assert.equal(supportsLiveGoldPricing(fixedPriceProduct), false);
  assert.deepEqual(getProductPrice(fixedPriceProduct, marketPrice), {
    priceToman: 2_300_000,
    mode: "fixed",
  });
});

test("rejects invalid profit rates", () => {
  const invalidProduct = {
    ...livePricedProduct,
    pricing: { ...livePricedProduct.pricing, sellerProfitRate: 1.2 },
  };

  assert.throws(
    () => calculateLiveGoldQuote(invalidProduct, marketPrice),
    /pricing.sellerProfitRate/,
  );
});
