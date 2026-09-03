import { useContext } from "react";
import { CartContext } from "../context/contexts";
import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function CartPage() {
  const { cart, removeFromCart, increase, decrease } = useContext(CartContext);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  return (
    <PageContainer>
      <SectionTitle>سبد خرید</SectionTitle>ّ
      {cart.length === 0 ? (
        <div className="rounded-xl bg-white p-8 shadow-sm">
          سبد خرید شما خالی است.
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-5 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="w-full">
                <h3 className="mb-2 font-bold">{product.title}</h3>

                <p>{product.price.toLocaleString("fa-IR")} تومان</p>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => increase(product.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  >
                    +
                  </button>

                  <span>{product.quantity}</span>

                  <button
                    onClick={() => decrease(product.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  >
                    -
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(product.id)}
                className="w-full rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 sm:w-auto"
              >
                حذف
              </button>
            </div>
          ))}
          <div className="mt-8 rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between text-sm sm:text-base">
              <span>تعداد کل محصولات</span>

              <span>{totalItems}</span>
            </div>

            <div className="flex items-center justify-between text-base font-bold sm:text-lg">
              <span>جمع کل</span>

              <span>{totalPrice.toLocaleString("fa-IR")} تومان</span>
            </div>

            <Link
              to="/checkout"
              className="mt-6 block rounded-lg bg-pink-500 py-3 text-center text-white hover:bg-pink-600"
            >
              ادامه فرایند خرید
            </Link>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default CartPage;
