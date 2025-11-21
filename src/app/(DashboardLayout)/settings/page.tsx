import React from "react";
import OrderWindowsSection from "@/features/settings/OrderWindowsSection";
import BlackoutPeriodsSection from "@/features/settings/BlackoutPeriodsSection";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";

export const metadata = {
  title: "إعدادات النظام",
};

  const BCrumb = [
    {
      title: "إعدادات النظام",
    },
  ];

export default function SettingsPage() {
  return (
    <>
      <BreadcrumbComp title="إعدادات النظام" items={BCrumb} />
      <div className="space-y-4">

        <OrderWindowsSection />

        <BlackoutPeriodsSection />
      </div>
    </>
  );
}
