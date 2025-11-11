"use client";

import DailyProfitCard from "./DailyProfitCard";
import OrdersStatusChart from "./OrdersStatusChart";
import ProductsStatusChart from "./ProductsStatusChart";
import LatestOrdersTable from "./LatestOrdersTable";
import HomeStatsSkeleton from "./HomeStatsSkeleton";
import { useHomeDashboardQuery } from "@/entities/home/api";

export default function HomeStatsGrid() {
  const { data, isLoading, isError, refetch } = useHomeDashboardQuery();

  if (isLoading) return <HomeStatsSkeleton />;
  if (isError) {
    return (
      <div className="space-y-3 text-sm">
        <div className="text-red-600">حدث خطأ أثناء جلب البيانات</div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 rounded bg-sky-600 text-white"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="grid gap-5 xl:grid-cols-12 max-h-20">
      {/* Top row */}
      <div className="xl:col-span-4">
        <DailyProfitCard
          amount={stats?.dailyProfit.amount || 0}
          change={stats?.dailyProfit.change || "0%"}
        />
      </div>
      <div className="xl:col-span-4">
        <OrdersStatusChart
          pending={stats?.orders.pending || 0}
          inProgress={stats?.orders.inProgress || 0}
          completed={stats?.orders.completed || 0}
        />
      </div>
      <div className="xl:col-span-4">
        <ProductsStatusChart
          active={stats?.products.active || 0}
          inactive={stats?.products.inactive || 0}
        />
      </div>

      {/* Latest orders full width */}
      <div className="xl:col-span-12">
        <LatestOrdersTable orders={data?.latestOrders || []} />
      </div>
    </div>
  );
}
