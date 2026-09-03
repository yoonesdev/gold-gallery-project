import { useContext } from "react";
import { CartContext, OrderContext } from "../context/contexts";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";
import { createOrder } from "../services/OrderService";

function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const { addOrder } = useContext(OrderContext);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handleOrder = () => {
    if (cart.length === 0) {
      alert("سبد خرید خالی است");
      return;
    }
    // بعداً اینجا backend وصل میشه
    // فعلاً سبد خرید خالی میشه

    const isValidCart = cart.every(
      (item) => item.price > 0 && item.quantity > 0,
    );

    if (!isValidCart) {
      alert("خطا در اطلاعات سبد خرید");
      return;
    }

    const order = createOrder(cart);

    addOrder(order);

    clearCart();

    navigate("/order-success");
  };

  return (
    <PageContainer>
      <SectionTitle>تایید نهایی سفارش</SectionTitle>

      <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{item.title}</span>
            <span>{item.quantity} عدد</span>
          </div>
        ))}

        <div className="mt-6 border-t pt-4 text-base font-bold sm:text-lg">
          جمع کل: {totalPrice.toLocaleString("fa-IR")} تومان
        </div>

        <button
          onClick={handleOrder}
          className="mt-6 w-full rounded-lg bg-green-500 py-3 text-white hover:bg-green-600"
        >
          ثبت نهایی سفارش
        </button>
      </div>
    </PageContainer>
  );
}

export default CheckoutPage;
