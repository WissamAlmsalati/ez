"use client";
import { Order } from "@/entities/order/types";
import { CardBox } from "@/shared/ui/cards";
import Field from "@/shared/ui/Field";

interface Props {
  order: Order;
}



export function OrderInfoSection({ order }: Props) {
  return (
    <CardBox className="space-y-6">
      <h3 className="font-medium text-gray-800 dark:text-gray-100">
        تفاصيل الطلب
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="رقم الطلب" value={order.order_number} />
        <Field label="حالة الطلب" value={order.status_text} />
        <Field
          label="تاريخ الاستلام"
          value={order.delivery_date || order.delivery_time || null}
        />
        <Field
          label="العنوان"
          value={order.delivery_address || null}
        />
        <Field label="السعر الكلي" value={order.formatted_total ?? order.total_amount} />
        <Field
          label="ملاحظات"
          value={order.notes || null}
        />
      </div>
    </CardBox>
  );
}

export default OrderInfoSection;
