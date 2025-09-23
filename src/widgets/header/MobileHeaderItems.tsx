import Profile from "./Profile";
import { Navbar } from "flowbite-react";


const MobileHeaderItems = () => {
  return (
    <Navbar
      fluid
      className="rounded-none bg-lightgray dark:bg-dark flex-1 "
    >
      <div className="xl:hidden block w-full">
        <div className="flex gap-3 justify-end items-center">
          <Profile />
        </div>
      </div>
    </Navbar>
  );
};

export default MobileHeaderItems;
