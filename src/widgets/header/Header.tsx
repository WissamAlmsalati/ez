"use client";
import "flowbite";
import React, { useState, useEffect, useContext } from "react";
import {Navbar } from "flowbite-react";
import { Icon } from "@iconify/react";
import Profile from "@widgets/header/Profile";
import { CustomizerContext } from "@processes/customizer/model/CustomizerContext";
import MobileHeaderItems from "@widgets/header/MobileHeaderItems";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";



const Header = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { setIsCollapse, isCollapse } =
    useContext(CustomizerContext);



  // mobile-sidebar
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <header
        className={`sticky top-0 z-[5] ${
          isSticky
            ? "bg-lightgray dark:bg-dark shadow-md fixed w-full"
            : "bg-transparent"
        }`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:px-30 px-4`}
        >
          <span
            onClick={() => setIsOpen(true)}
            className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
          >
            <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
          </span>
          <Navbar.Collapse className="xl:block ">
            <div className="flex gap-3 items-center relative">
                <span
                  onClick={() => {
                    if (isCollapse === "full-sidebar") {
                      setIsCollapse("mini-sidebar");
                    } else {
                      setIsCollapse("full-sidebar");
                    }
                  }}
                  className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer"
                >
                  <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
                </span>

            </div>
          </Navbar.Collapse>



          <Navbar.Collapse className="xl:block hidden">
            <div className="flex gap-3 items-center">
              <Profile />
            </div>
          </Navbar.Collapse>
            <div className="xl:hidden">
              <MobileHeaderItems />
            </div>
          {/* Mobile Toggle Icon */}
  
        </Navbar>
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isOpen} onClose={handleClose} className="w-130">
        <Drawer.Items>
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;
