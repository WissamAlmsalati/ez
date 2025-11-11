"use client";

import CardBox from "@shared/ui/cards/CardBox";
import dynamic from "next/dynamic";

// ApexCharts needs dynamic import to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type HistoryPoint = { date: string; amount: number };
type Props = {
  amount: number; // today's profit
  change: string; // percentage change string
  history?: HistoryPoint[]; // optional recent days, if available in future
};

export default function DailyProfitCard({ amount, change, history }: Props) {
  const isUp = (change || "").trim().startsWith("+");
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "LYD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  }).format(amount || 0);

  const categories = history?.length ? history.map((h) => h.date) : ["اليوم"];
  const seriesData = history?.length
    ? history.map((h) => h.amount)
    : [amount || 0];

  const options: any = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        distributed: false,
        borderRadius: 6,
        columnWidth: history?.length ? "55%" : "35%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: { categories, labels: { rotate: -45 } },
    yaxis: {
      labels: {
        formatter: (val: number) =>
          new Intl.NumberFormat("ar").format(Math.round(val)),
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "LYD",
            maximumFractionDigits: 2,
          }).format(val),
      },
    },
    colors: ["var(--color-primary)"],
  };

  const series = [
    {
      name: "الربح",
      data: seriesData,
    },
  ];

  return (
    <CardBox className="p-5 ">
      {/* <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">الربح اليومي</div>
          <div className="mt-2 text-2xl font-semibold">{formatted}</div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {change || "0%"}
        </div>
      </div> */}
      {/* <div className="mt-2"> */}
            <div className="mb-4 font-semibold">الربح اليومي</div>

        <Chart options={options} series={series} type="bar" height={240} />
      {/* </div> */}
    </CardBox>
  );
}
