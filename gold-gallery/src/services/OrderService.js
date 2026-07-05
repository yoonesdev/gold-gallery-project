export function createOrder(cart, user) {
  const order = {
    id: Date.now(),
    user: user || null,
    items: cart,
    total: cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const oldOrders =
    JSON.parse(localStorage.getItem("orders")) || [];

  const updatedOrders = [order, ...oldOrders];

  localStorage.setItem("orders", JSON.stringify(updatedOrders));

  return order;
}

export function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}