import React from "react";
import HomeStatsGrid from "@/features/dashboard/components/HomeStatsGrid";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";

// الصفحة الرئيسية للوحة التحكم - تحسينات للاستجابة على الشاشات الصغيرة
const Page = () => {
  return (
    <main
      aria-label="الصفحة الرئيسية للوحة التحكم"
      className="space-y-4 sm:space-y-5 pt-2 sm:pt-4"
    >
      <header className="">
        <BreadcrumbComp
          title="الصفحة الرئيسية"
          items={[{ title: "الرئيسية" }]}
        />
      </header>
      <section>
        <HomeStatsGrid />
      </section>
    </main>
  );
};

export default Page;
