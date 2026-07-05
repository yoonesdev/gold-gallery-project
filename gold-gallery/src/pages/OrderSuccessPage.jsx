import { Link } from "react-router-dom";

function OrderSuccessPage() {
  return (
    <div dir="rtl" className="mx-auto max-w-[700px] px-4 py-20 text-center">

      <div className="text-6xl mb-6">🎉</div>

      <h1 className="text-3xl font-bold mb-4">
        سفارش شما با موفقیت ثبت شد
      </h1>

      <p className="text-gray-600 mb-8">
        از خرید شما متشکریم. سفارش شما در حال پردازش است.
      </p>

      <Link
        to="/"
        className="inline-block rounded-lg bg-pink-500 px-6 py-3 text-white"
      >
        بازگشت به خانه
      </Link>

    </div>
  );
}

export default OrderSuccessPage;