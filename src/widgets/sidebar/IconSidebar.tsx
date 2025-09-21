"use client";
import React, { useContext } from "react";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";
import { CustomizerContext } from "@processes/customizer/model/CustomizerContext";
import { Button, Tooltip } from "flowbite-react";
import FullLogo from "@shared/ui/logo/FullLogo";
import Miniicons, { MiniiconsType } from "./MiniSidebar";

export const IconSidebar = () => {
  const { selectedIconId, setSelectedIconId, setIsCollapse } =
    useContext(CustomizerContext) || {};
  const handleClick = (id: any) => {
    setSelectedIconId(id);
    setIsCollapse("full-sidebar");
  };

  return (
    <>
      <div className="px-4 py-6 pt-7 logo">
        <FullLogo />
      </div>
      <SimpleBar className="miniicons">
        {Miniicons.map((links: MiniiconsType, index: number) => (
          <Tooltip
            key={index}
            content={links.tooltip}
            placement="right"
            className="flowbite-tooltip"
          >
            <Button
              className={`h-12 w-12 hover:text-primary text-darklink hover:bg-lightprimary rounded-full flex justify-center items-center mx-auto mb-2 ${
                links.id === selectedIconId
                  ? "text-primary bg-lightprimary"
                  : "text-darklink bg-transparent"
              }`}
              type="button"
              onClick={() => handleClick(links.id)}
            >
              <Icon icon={links.icon} height={24} className="dark:bg-blue" />
            </Button>
          </Tooltip>
        ))}
      </SimpleBar>
    </>
  );
};
