"use client";
import { Order } from "@/entities/order/types";
import { CardBox } from "@/shared/ui/cards";
import Field from "@/shared/ui/Field";

export function CustomerSection({ order }: { order: Order }) {
  const user = order.user;
  return (
    <CardBox className="space-y-6">
      <h3 className="font-medium text-gray-800 dark:text-gray-100">
        تفاصيل الزبون
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="اسم الزبون" value={order.customer_name} />
        <Field label="رقم الهاتف" value={order.customer_phone} />
        <Field
          label="البريد الإلكتروني"
          value={order.customer_email ?? user?.email ?? null}
        />
        <Field
          label="حالة الحساب"
          value={
            order.customer_status ??
            (user ? (user.is_active ? "نشط" : "متوقف") : null)
          }
        />
      </div>
    </CardBox>
  );
}

export default CustomerSection;
