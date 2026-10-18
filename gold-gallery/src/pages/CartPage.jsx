import { useContext } from "react";
import { Link } from "react-router-dom";

import { CartContext } from "../context/contexts";
import { getProductById } from "../services/ProductService";
import { useCartPricePreview } from "../hooks/useCartPricePreview";

import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function formatToman(amount) {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function CartPage() {
  const {
    cart,
    removeFromCart,
    increase,
    decrease,
  } = useContext(CartContext);

  const {
    prices,
    loading,
    error,
    allPricesAvailable,
    totalPrice,
  } = useCartPricePreview(cart);

  const cartProducts = cart
    .map((item) => {
      const product = getProductById(item.productId);

      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
      };
    })
    .filter(Boolean);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const canCheckout =
    cart.length > 0 &&
    cartProducts.length === cart.length &&
    allPricesAvailable &&
    !loading &&
    !error;

  let checkoutMessage = "قیمت‌ها در دسترس نیستند";

  if (loading) {
    checkoutMessage = "در حال بررسی قیمت‌ها...";
  } else if (error) {
    checkoutMessage = "ابتدا خطای دریافت قیمت را برطرف کنید";
  } else if (cartProducts.length !== cart.length) {
    checkoutMessage = "برخی محصولات دیگر در دسترس نیستند";
  }

  return (
    <PageContainer>
      <SectionTitle>سبد خرید</SectionTitle>

      {cart.length === 0 ? (
        <div className="rounded-xl bg-white p-8 shadow-sm">
          سبد خرید شما خالی است.
        </div>
      ) : (
        <div className="space-y-4">
          {cartProducts.map(
            ({ productId, quantity, product }) => {
              const price = prices[productId];

              return (
                <div
                  key={productId}
                  className="flex flex-col gap-5 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="w-full">
                    <h3 className="mb-2 font-bold">
                      {product.title}
                    </h3>

                    {price ? (
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          قیمت هر عدد:{" "}
                          {formatToman(price.priceToman)}
                        </p>

                        <p>تعداد: {quantity}</p>

                        <p className="font-bold text-gray-900">
                          جمع این محصول:{" "}
                          {formatToman(
                            price.priceToman * quantity,
                          )}
                        </p>

                        {price.mode === "live" && (
                          <p className="text-xs text-green-600">
                            قیمت بر اساس نرخ لحظه‌ای طلا
                          </p>
                        )}

                        {price.mode === "fixed" && (
                          <p className="text-xs text-gray-500">
                            قیمت ثابت ثبت‌شده برای محصول
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {loading
                          ? "در حال دریافت قیمت..."
                          : "قیمت در دسترس نیست"}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => increase(productId)}
                        disabled={quantity >= 99}
                        aria-label="افزایش تعداد"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() => decrease(productId)}
                        aria-label="کاهش تعداد"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(productId)}
                    className="w-full rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 sm:w-auto"
                  >
                    حذف
                  </button>
                </div>
              );
            },
          )}

          <div className="mt-8 rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between text-sm sm:text-base">
              <span>تعداد کل محصولات</span>
              <span>{totalItems}</span>
            </div>

            <div className="flex items-center justify-between text-base font-bold sm:text-lg">
              <span>جمع کل</span>

              <span>
                {allPricesAvailable
                  ? formatToman(totalPrice)
                  : loading
                    ? "در حال محاسبه..."
                    : "قیمت در دسترس نیست"}
              </span>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">
                خطا در دریافت قیمت: {error}
              </p>
            )}

            <p className="mt-3 text-xs text-gray-500">
              قیمت طلا ممکن است تا زمان ثبت سفارش تغییر کند.
              مبلغ نهایی توسط سرور بررسی می‌شود.
            </p>

            {canCheckout ? (
              <Link
                to="/checkout"
                className="mt-6 block rounded-lg bg-pink-500 py-3 text-center text-white hover:bg-pink-600"
              >
                ادامه فرایند خرید
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 block w-full cursor-not-allowed rounded-lg bg-gray-300 py-3 text-center text-gray-600"
              >
                {checkoutMessage}
              </button>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default CartPage;