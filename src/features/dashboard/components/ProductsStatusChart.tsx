"use client";

import dynamic from "next/dynamic";
import CardBox from "@shared/ui/cards/CardBox";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  active: number;
  inactive: number;
};

export default function ProductsStatusChart({ active, inactive }: Props) {
  const categories = ["مفعّل", "غير مفعّل"];
  const data = [active || 0, inactive || 0];

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
      <div className="mb-4 font-semibold">حالة الأصناف</div>
      <Chart
        options={options}
        series={[{ name: "عدد الأصناف", data }]}
        type="bar"
        height={240}
      />
    </CardBox>
  );
}
