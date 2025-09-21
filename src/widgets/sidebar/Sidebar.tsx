"use client";

import React, { useContext, useEffect } from "react";
import { Sidebar as FlowSidebar } from "flowbite-react";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@processes/customizer/model/CustomizerContext";
import SimpleBar from "simplebar-react";
import SideProfile from "./SideProfile";
import { usePathname } from "next/navigation";
import SidebarContent from "./Sidebaritems";
import { IconSidebar } from "./IconSidebar";

const Sidebar = () => {
  const ctx = useContext(CustomizerContext) as any;
  const selectedIconId = ctx?.selectedIconId;
  const setSelectedIconId = ctx?.setSelectedIconId as (id: number) => void;
  const selectedContent = SidebarContent.find(
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
      const result = findActiveUrl(SidebarContent, pathname);
      if (result) {
        setSelectedIconId(result);
      }
    }
  }, [pathname, setSelectedIconId]);

  return (
    <>
      <div className="xl:block hidden">
        <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1]">
          <IconSidebar />
          <SideProfile />
        </div>
        <FlowSidebar
          className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray ps-4 rtl:pe-4 rtl:ps-0"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <SimpleBar className="h-[calc(100vh_-_85px)]">
            <FlowSidebar.Items className="pe-4 rtl:pe-0 rtl:ps-4">
              <FlowSidebar.ItemGroup className="sidebar-nav hide-menu ">
                {selectedContent &&
                  selectedContent.items?.map((item: any, index: number) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-semibold text-sm caption ">
                        {item.heading}
                      </h5>
                      {item.children?.map((child: any, index: number) => (
                        <React.Fragment key={(child.id as string) ?? index}>
                          {child.children ? (
                            <NavCollapse item={child} />
                          ) : (
                            <NavItems item={child} />
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
              </FlowSidebar.ItemGroup>
            </FlowSidebar.Items>
          </SimpleBar>
        </FlowSidebar>
      </div>
    </>
  );
};

export default Sidebar;
