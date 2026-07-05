import { useContext } from "react";
import { useParams } from "react-router-dom";
import { OrderContext } from "../context/OrderContext";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function OrderDetailsPage() {
  const { id } = useParams();
  const { orders } = useContext(OrderContext);

  const order = orders.find((o) => o.id === Number(id));

  if (!order) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1126px] px-4 py-10">
        سفارش پیدا نشد.
      </div>
    );
  }

  return (
    <PageContainer maxWidth="max-w-[900px]">
      <SectionTitle>
        سفارش #{order.id}
      </SectionTitle>

      <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <p>تاریخ: {order.date}</p>

        <p>
          وضعیت:
          <span className="mr-2 font-bold">
            {order.status}
          </span>
        </p>

        <hr />

        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{item.title}</span>

            <span>
              {item.quantity} × {item.price.toLocaleString("fa-IR")} تومان
            </span>
          </div>
        ))}

        <hr />

        <div className="text-base font-bold sm:text-lg">
          جمع کل:
          {" "}
          {order.totalPrice.toLocaleString("fa-IR")}
          {" "}
          تومان
        </div>
      </div>
    </PageContainer>
  );
}

export default OrderDetailsPage;