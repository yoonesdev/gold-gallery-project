import { useContext } from "react";
import { OrderContext } from "../context/OrderContext";
import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function OrdersPage() {
  const { orders } = useContext(OrderContext);

  return (
    <PageContainer>
      <SectionTitle>سفارش‌های من</SectionTitle>

      {orders.length === 0 ? (
        <p className="text-gray-500">هنوز سفارشی ثبت نکرده‌اید</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
            >
              {/* HEADER */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div className="font-bold text-gray-800">سفارش #{order.id}</div>

                <div className="text-sm text-gray-500">{order.date}</div>
              </div>

              {/* STATUS */}
              <div className="mb-4">
                وضعیت:
                <span className="mr-2 mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700 sm:mt-0">
                  {order.status}
                </span>
              </div>

              {/* ITEMS */}
              <div className="space-y-3 border-t pt-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="font-medium text-gray-800">
                      {item.title}
                    </div>

                    <div className="text-sm text-gray-600">
                      {item.quantity} × {item.price.toLocaleString("fa-IR")}{" "}
                      تومان
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-5 flex items-center justify-between border-t pt-4 text-base font-bold sm:text-lg">
                <span>جمع کل</span>
                <span>{order.totalPrice.toLocaleString("fa-IR")} تومان</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default OrdersPage;
