"use client";

import React, { useContext, useEffect } from "react";
import { Sidebar as FlowSidebar } from "flowbite-react";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@processes/customizer/model/CustomizerContext";
import SimpleBar from "simplebar-react";
import { usePathname } from "next/navigation";
import SidebarContent, { ChildItem } from "./Sidebaritems";
import { IconSidebar } from "./IconSidebar";
import { useSessionStore } from "@/entities/session/model/sessionStore";

const Sidebar = () => {
  const ctx = useContext(CustomizerContext) as any;
  const selectedIconId = ctx?.selectedIconId;
  const setSelectedIconId = ctx?.setSelectedIconId as (id: number) => void;
  const isManager = useSessionStore((s) => s.isManager);

  // دالة تصفية متكررة لكل عناصر السايدبار حسب الدور المطلوب
  const filterSidebarItems = (items: ChildItem[] = []): ChildItem[] => {
    return items
      .filter((item) => {
        if (item.requiredRole === "manager" && !isManager) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterSidebarItems(item.children) : undefined,
      }));
  };

  // إنشاء نسخة مفلترة من المحتوى الكامل
  const filteredSidebarContent = SidebarContent.map((menu: any) => ({
    ...menu,
    children: menu.children ? filterSidebarItems(menu.children) : undefined,
    items: menu.items
      ? menu.items.map((sub: any) => ({
          ...sub,
          children: sub.children ? filterSidebarItems(sub.children) : undefined,
        }))
      : undefined,
  }));

  // المحتوى المحدد بعد التصفية
  const selectedContent = filteredSidebarContent.find(
    (data: any) => data.id === selectedIconId
  );

  const pathname = usePathname();

  function findActiveUrl(narray: any[], targetUrl: string) {
    for (const item of narray) {
      if (item.items) {
        for (const section of item.items) {
          if (section.children) {
            for (const child of section.children) {
              if (child.url === targetUrl) {
                return item.id;
              }
            }
          }
        }
      }
    }
    return null;
  }

  useEffect(() => {
    if (pathname) {
      const result = findActiveUrl(filteredSidebarContent as any[], pathname);
      if (result) {
        setSelectedIconId(result);
      }
    }
  }, [pathname, setSelectedIconId, filteredSidebarContent]);

  return (
    <>
      <div className="xl:block hidden">
        <div className="minisidebar-icon border-e border-ld bg-primary fixed start-0 z-[1]">
          <IconSidebar />
        </div>
        <FlowSidebar
          className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray ps-4 rtl:pe-4 rtl:ps-0"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <h2 className="text-lg text-center font-normal pt-1 pb-2 sticky top-0 bg-white dark:bg-darkgray z-10">
            الازدهار للحلويات
          </h2>
          <SimpleBar className="h-[calc(100vh_-_85px)]">
            <FlowSidebar.Items className="pe-4 rtl:pe-0 rtl:ps-4">
              <FlowSidebar.ItemGroup className="sidebar-nav hide-menu ">
                {selectedContent &&
                  selectedContent.items?.map((item: any, index: number) => {
                    if (!item.children || item.children.length === 0)
                      return null;
                    return (
                      <React.Fragment key={index}>
                        <h5 className="text-link font-semibold text-sm caption ">
                          {item.heading}
                        </h5>
                        {item.children?.map((child: any, i: number) => (
                          <React.Fragment key={(child.id as string) ?? i}>
                            {child.children ? (
                              <NavCollapse item={child} />
                            ) : (
                              <NavItems item={child} />
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    );
                  })}
              </FlowSidebar.ItemGroup>
            </FlowSidebar.Items>
          </SimpleBar>
        </FlowSidebar>
      </div>
    </>
  );
};

export default Sidebar;
