const products = [
  {
    id: 1,
    title: "زنجیر طلا زنانه توپی متوسط",
    price: 52000000,
    weight: 4.2,
    karat: 18,
    pricing: {
      model: "weight_based",
      weightGrams: 4.2,
      makingFeePerGramToman: 450000,
      sellerProfitRate: 0.07,
      stonePriceToman: 0,
    },
  },
];

function getProductById(id) {
  return products.find(
    (product) => product.id === Number(id),
  );
}

module.exports = {
  getProductById,
};