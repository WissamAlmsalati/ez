"use client";

import dynamic from "next/dynamic";
import CardBox from "@shared/ui/cards/CardBox";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  pending: number;
  inProgress: number;
  completed: number;
};

export default function OrdersStatusChart({
  pending,
  inProgress,
  completed,
}: Props) {
  const categories = ["قيد الانتظار", "قيد التنفيذ", "مكتملة"];
  const values = [pending || 0, inProgress || 0, completed || 0];

  const options: any = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories },
    legend: { show: false },
    dataLabels: { enabled: true },
    colors: ["var(--color-primary)"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 6,
        distributed: false,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  return (
    <CardBox className="p-5">
      <div className="mb-4 font-semibold">حالة الطلبات</div>
      <Chart
        options={options}
        series={[{ name: "عدد الطلبات", data: values }]}
        type="bar"
        height={240}
      />
    </CardBox>
  );
}
