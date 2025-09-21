"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
const FullLogo = () => {
  return (
    <Link href={"/"}>
      <Image
        src="/images/logos/dark-logo.svg"
        alt="logo"
        width={120}
        height={24}
        className="block dark:hidden"
      />
      <Image
        src="/images/logos/light-logo.svg"
        alt="logo"
        width={120}
        height={24}
        className="hidden dark:block"
      />
    </Link>
  );
};
export default FullLogo;
