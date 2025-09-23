"use client";
import React, { useContext } from "react";
import { Sidebar as FlowSidebar } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@processes/customizer/model/CustomizerContext";
import SimpleBar from "simplebar-react";

const MobileSidebar = () => {
  const ctx = useContext(CustomizerContext) as any;
  const selectedIconId = ctx?.selectedIconId;
  const selectedContent = SidebarContent.find(
    (data: any) => data.id === selectedIconId
  );

  return (
    <>
      <div className="xl:hidden block">
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
                  selectedContent.items?.map((item: any, index: number) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-semibold text-sm caption ">
                        {item.heading}
                      </h5>
                      {item.children?.map((child: any, idx: number) => (
                        <React.Fragment key={child.id ?? idx}>
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

export default MobileSidebar;
