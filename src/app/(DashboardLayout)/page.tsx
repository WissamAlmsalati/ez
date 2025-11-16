import React from "react";
import HomeStatsGrid from "@/features/dashboard/components/HomeStatsGrid";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";

const page = () => {
  return (
    <>
      <div className="space-y-5">
        <BreadcrumbComp
          title="الصفحة الرئيسية"
          items={[{ title: "الرئيسية" }]}
        />
        <HomeStatsGrid />
      </div>
    </>
  );
};

export default page;
