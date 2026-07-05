import sellers from "../data/sellers.json";

export function getSellerById(id) {
  return sellers.find(
    (seller) => seller.id === Number(id)
  );
}