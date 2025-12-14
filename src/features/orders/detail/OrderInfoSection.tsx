"use client";
import { Order } from "@/entities/order/types";
import { CardBox } from "@/shared/ui/cards";
import Field from "@/shared/ui/Field";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateOrderStatusMutation } from "@/entities/order/api";
import { Button } from "flowbite-react";

interface Props {
  order: Order;
}

export function OrderInfoSection({ order }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync } = useUpdateOrderStatusMutation(order.id);

  async function updateStatus(
    nextStatus: "in_progress" | "completed" | "cancelled"
  ) {
    try {
      setIsSubmitting(true);
      await mutateAsync(nextStatus);
      toast.success("تم تحديث حالة الطلب بنجاح");
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <Field label="العنوان" value={order.delivery_address || null} />
        <Field
          label="السعر الكلي"
          value={order.formatted_total ?? order.total_amount}
        />
        <Field label="ملاحظات" value={order.notes || null} />
      </div>
      {/* Actions */}
      {order.status !== "cancelled" && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          {/* If status is new → show In Progress + Cancel */}
          {order.status === "new" && (
            <>
              <Button
                type="button"
                onClick={() => updateStatus("cancelled")}
                disabled={isSubmitting}
                color={"failure"}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                color={"primary"}
                onClick={() => updateStatus("in_progress")}
                disabled={isSubmitting}
              >
                قيد التنفيذ
              </Button>
            </>
          )}

          {/* If status is in_progress → show Completed + Cancel */}
          {order.status === "in_progress" && (
            <>
              <Button
                type="button"
                onClick={() => updateStatus("cancelled")}
                disabled={isSubmitting}
                color={"failure"}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={() => updateStatus("completed")}
                disabled={isSubmitting}
                color={"primary"}
              >
                مكتمل
              </Button>
            </>
          )}
        </div>
      )}
    </CardBox>
  );
}

export default OrderInfoSection;
