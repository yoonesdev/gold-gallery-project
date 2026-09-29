
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { OrderContext } from "../context/contexts";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function OrderDetailsPage() {
  const { id } = useParams();
  const { orders } = useContext(OrderContext);

  const order = orders.find((o) => String(o.id) === id);

  if (!order) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1126px] px-4 py-10">
        سفارش پیدا نشد.
      </div>
    );
  }

  // Support both old and new order formats.
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("fa-IR")
    : order.date || "—";

  const totalPrice = order.totalPriceToman ?? order.totalPrice;

  return (
    <PageContainer maxWidth="max-w-[900px]">
      <SectionTitle>
        سفارش #{order.id}
      </SectionTitle>

      <div
        dir="rtl"
        className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-6"
      >
        <p>
          تاریخ: {orderDate}
        </p>

        <p>
          وضعیت:
          <span className="mr-2 font-bold">
            {order.status}
          </span>
        </p>

        <hr />

        {order.items.map((item, index) => {
          const unitPrice = item.unitPriceToman ?? item.price;

          const itemTotal =
            item.totalPriceToman ?? unitPrice * item.quantity;

          return (
            <div
              key={`${item.productId ?? item.id ?? index}`}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{item.title}</p>

                <p className="text-sm text-gray-500">
                  {item.quantity} ×{" "}
                  {unitPrice?.toLocaleString("fa-IR") ?? "—"} تومان
                </p>
              </div>

              <span className="font-medium">
                {itemTotal?.toLocaleString("fa-IR") ?? "—"} تومان
              </span>
            </div>
          );
        })}

        <hr />

        <div className="text-base font-bold sm:text-lg">
          جمع کل:{" "}
          {totalPrice?.toLocaleString("fa-IR") ?? "—"} تومان
        </div>
      </div>
    </PageContainer>
  );
}

export default OrderDetailsPage;