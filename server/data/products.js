const products = require("../../gold-gallery/src/data/products.json");

function getProductById(id) {
  return products.find(
    (product) => product.id === Number(id)
  );
}

module.exports = {
  getProductById,
};