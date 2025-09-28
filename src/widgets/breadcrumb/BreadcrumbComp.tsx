"use client";
import React, { ReactNode } from "react";
import { Badge, Breadcrumb } from "flowbite-react";
import { CardBox } from "@/shared/ui/cards";
interface BreadCrumbType {
  subtitle?: string;
  items?: { title: string; to?: string }[];
  title: string | ReactNode;
  children?: JSX.Element;
}

const BreadcrumbComp = ({ items, title, children }: BreadCrumbType) => {
  return (
    <>
      <CardBox className={`mb-[30px]`}>
        <Breadcrumb
          className="flex flex-col justify-between"
          suppressHydrationWarning
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {typeof title === "string" ? (
                <h6 className="text-base" suppressHydrationWarning>
                  {title}
                </h6>
              ) : (
                title
              )}
            </div>
            {children && <div className="flex items-center">{children}</div>}
          </div>
          <div className="flex items-center gap-1 ms-auto mt-2">
            {items
              ? items
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <div key={item.title} className="flex items-center">
                      {index > 0 && (
                        <span className="text-gray-400 dark:text-gray-500 mx-1">
                          /
                        </span>
                      )}
                      {item.to ? (
                        <a
                          href={item.to}
                          className="text-primary hover:text-primary-dark dark:text-lightprimary dark:hover:text-secondary transition-colors duration-200 hover:underline whitespace-nowrap"
                        >
                          <span suppressHydrationWarning>{item.title}</span>
                        </a>
                      ) : (
                        <Badge
                          className="text-primary dark:text-secondary w-fit whitespace-nowrap"
                          color={"lightprimary"}
                        >
                          <span suppressHydrationWarning>{item.title}</span>
                        </Badge>
                      )}
                    </div>
                  ))
              : ""}
          </div>
        </Breadcrumb>
      </CardBox>
    </>
  );
};

export default BreadcrumbComp;
