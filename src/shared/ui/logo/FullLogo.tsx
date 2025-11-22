"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
const FullLogo = () => {
  return (
    <Link href={"/"}>
      <Image
        src="/WHITE AND GOLD SVG.svg"
        alt="logo"
        width={120}
        height={24}
        className="block"
      />
    </Link>
  );
};
export default FullLogo;
