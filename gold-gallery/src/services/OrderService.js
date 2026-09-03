export function createOrder(cart) {
  return {
    id: Date.now(),
    items: cart.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    totalPrice: cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
    date: new Date().toLocaleDateString("fa-IR"),
    status: "pending",
  };
}
