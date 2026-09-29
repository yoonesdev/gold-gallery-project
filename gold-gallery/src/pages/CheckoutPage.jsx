
import { useContext, useState } from "react";
import {
  CartContext,
  OrderContext,
} from "../context/contexts";
import { useNavigate } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

import { useCartPricePreview } from "../hooks/useCartPricePreview";

const API_BASE_URL = "http://localhost:5000";

function formatToman(amount) {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);

  const navigate = useNavigate();

  const {
    prices,
    loading: pricesLoading,
    error: priceError,
    allPricesAvailable,
    totalPrice,
  } = useCartPricePreview(cart);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleOrder = async () => {
    if (cart.length === 0) {
      setSubmitError("سبد خرید خالی است.");
      return;
    }

    if (!allPricesAvailable) {
      setSubmitError(
        "ابتدا باید قیمت تمام محصولات دریافت شود."
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "خطا در ثبت سفارش."
        );
      }

      const backendOrder = result.data;

      // Save the backend-calculated order.
      addOrder(backendOrder);

      // Clear the cart only after success.
      clearCart();

      // Show the saved order in the existing order details page.
      navigate(`/orders/${backendOrder.id}`);
    } catch (err) {
      console.error("Checkout error:", err);

      setSubmitError(
        err.message ||
          "ارتباط با سرور برقرار نشد."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <SectionTitle>
        تایید نهایی سفارش
      </SectionTitle>

      {cart.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p>سبد خرید شما خالی است.</p>

          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-lg bg-pink-500 px-5 py-3 text-white"
          >
            بازگشت به فروشگاه
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 space-y-4">
            {cart.map((item) => {
              const price = prices[item.productId];

              return (
                <div
                  key={item.productId}
                  className="border-b pb-4"
                >
                  <div className="flex justify-between gap-4">
                    <span>
                      محصول شماره {item.productId}
                    </span>

                    <span>
                      تعداد: {item.quantity}
                    </span>
                  </div>

                  {price ? (
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between gap-4">
                        <span>قیمت هر عدد</span>

                        <span>
                          {formatToman(
                            price.priceToman
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 font-bold text-gray-900">
                        <span>جمع این محصول</span>

                        <span>
                          {formatToman(
                            price.priceToman *
                              item.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      {pricesLoading
                        ? "در حال دریافت قیمت..."
                        : "قیمت در دسترس نیست"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="flex justify-between">
              <span>تعداد کل محصولات</span>
              <span>{totalItems}</span>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>جمع کل</span>

              <span>
                {allPricesAvailable
                  ? formatToman(totalPrice)
                  : pricesLoading
                    ? "در حال محاسبه..."
                    : "قیمت در دسترس نیست"}
              </span>
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            توجه: قیمت طلا ممکن است تغییر کند.
            مبلغ نهایی هنگام ثبت سفارش مجدداً توسط
            سرور محاسبه و تأیید می‌شود.
          </p>

          {priceError && (
            <p className="mt-3 text-sm text-red-600">
              خطا در دریافت قیمت: {priceError}
            </p>
          )}

          {submitError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {submitError}
            </p>
          )}

          <button
            onClick={handleOrder}
            disabled={
              submitting ||
              pricesLoading ||
              !allPricesAvailable
            }
            className="mt-6 w-full rounded-lg bg-green-500 py-3 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "در حال ثبت سفارش..."
              : "ثبت نهایی سفارش"}
          </button>
        </div>
      )}
    </PageContainer>
  );
}

export default CheckoutPage;