"use client";
import React, { useContext } from "react";
import { Sidebar as FlowSidebar } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@processes/customizer/model/CustomizerContext";
import SimpleBar from "simplebar-react";
import SideProfile from "./SideProfile";

const MobileSidebar = () => {
  const { selectedIconId } = useContext(CustomizerContext) || {};
  const selectedContent = SidebarContent.find(
    (data) => data.id === selectedIconId
  );
  return (
    <div>
      <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1] ">
        <IconSidebar />
        <SideProfile />
      </div>
      <FlowSidebar
        className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray transition-all"
        aria-label="Sidebar with multi-level dropdown example"
      >
        <SimpleBar className="h-[calc(100vh_-_85px)]">
          <FlowSidebar.Items className="ps-4 pe-4">
            <FlowSidebar.ItemGroup className="sidebar-nav">
              {selectedContent &&
                selectedContent.items?.map((item, index) => (
                  <React.Fragment key={index}>
                    <h5 className="text-link font-semibold text-sm caption">
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
  );
};

export default MobileSidebar;
