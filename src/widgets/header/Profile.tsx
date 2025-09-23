import { Icon } from "@iconify/react";
import { Button, Dropdown } from "flowbite-react";
import React from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useSessionStore } from '@/entities/session/model/sessionStore';
import { apiInstance } from "@/shared/api";
const Profile = () => {

  const { user } = useSessionStore();
  const handleLogout = async () => {
    try {
      await apiInstance.post("/auth/logout");
       await signOut({
        callbackUrl: "/login",
      });
      toast.success("تم تسجيل الخروج بنجاح");

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } 
  };
  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] py-6  rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src={`${user?.image ?? "/image.jpg"}`}
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >
        <div className="px-6">
          <div className="flex items-center gap-6 pb-5 border-b mt-5 mb-3">
            <Image
              src={`${user?.image ?? "/image.jpg"}`}
              alt="logo"
              height="80"
              width="80"
              className="rounded-full"
            />
            <div>
              <h5 className="card-title">{user?.name}</h5>
              <p className="card-subtitle mb-0 mt-1 flex items-center">
                <Icon
                  icon="solar:mailbox-line-duotone"
                  className="text-base me-1"
                />
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        <div className="pt-6 px-6">
          <Button
            color={"primary"}
            className="w-full"
            onClick={handleLogout}
          >
            تسجيل الخروج
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
