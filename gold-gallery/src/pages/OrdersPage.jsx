
import { useContext } from "react";
import { Link } from "react-router-dom";

import { OrderContext } from "../context/contexts";

import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function formatToman(amount) {
  if (!Number.isFinite(amount)) {
    return "نامشخص";
  }

  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function formatOrderDate(order) {
  const dateValue = order.createdAt || order.date;

  if (!dateValue) {
    return "تاریخ نامشخص";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("fa-IR");
}

function getItemPrice(item) {
  // Support the new backend order format
  if (Number.isFinite(item.unitPriceToman)) {
    return item.unitPriceToman;
  }

  // Support orders created by the old frontend
  if (Number.isFinite(item.price)) {
    return item.price;
  }

  return null;
}

function getOrderTotal(order) {
  if (Number.isFinite(order.totalPriceToman)) {
    return order.totalPriceToman;
  }

  // Support the old order format
  if (Number.isFinite(order.totalPrice)) {
    return order.totalPrice;
  }

  return null;
}

function OrdersPage() {
  const { orders = [] } = useContext(OrderContext);

  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt || b.date || 0) -
      new Date(a.createdAt || a.date || 0)
  );

  return (
    <PageContainer>
      <SectionTitle>
        سفارش‌های من
      </SectionTitle>

      {sortedOrders.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            هنوز سفارشی ثبت نکرده‌اید.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block rounded-lg bg-pink-500 px-5 py-3 text-white"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            const orderTotal = getOrderTotal(order);

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-bold text-gray-800">
                    سفارش #{order.id}
                  </div>

                  <div className="text-sm text-gray-500">
                    {formatOrderDate(order)}
                  </div>
                </div>

                <div className="mb-4">
                  <span>وضعیت: </span>

                  <span className="mr-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                    {order.status === "pending"
                      ? "در انتظار بررسی"
                      : order.status}
                  </span>
                </div>

                <div className="space-y-3 border-t pt-4">
                  {(order.items || []).map(
                    (item, index) => {
                      const unitPrice =
                        getItemPrice(item);

                      const itemTotal =
                        Number.isFinite(
                          item.totalPriceToman
                        )
                          ? item.totalPriceToman
                          : unitPrice !== null
                            ? unitPrice *
                              item.quantity
                            : null;

                      return (
                        <div
                          key={
                            item.productId ??
                            item.id ??
                            index
                          }
                          className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="font-medium text-gray-800">
                            {item.title ||
                              `محصول شماره ${item.productId ?? item.id}`}
                          </div>

                          <div className="text-sm text-gray-600">
                            {item.quantity} ×{" "}
                            {unitPrice !== null
                              ? formatToman(unitPrice)
                              : "قیمت نامشخص"}
                          </div>

                          {itemTotal !== null && (
                            <div className="text-sm font-bold text-gray-800">
                              {formatToman(itemTotal)}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-4 text-base font-bold sm:text-lg">
                  <span>جمع کل</span>

                  <span>
                    {orderTotal !== null
                      ? formatToman(orderTotal)
                      : "نامشخص"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-pink-600">
                  مشاهده جزئیات سفارش
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

export default OrdersPage;