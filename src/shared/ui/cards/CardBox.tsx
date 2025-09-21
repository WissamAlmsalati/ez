"use client";

import { Card } from "flowbite-react";
import React from "react";

interface MyAppProps {
  children: React.ReactNode;
  className?: string;
}
const CardBox: React.FC<MyAppProps> = ({ children, className }) => {
  return (
    <Card
      className={`card ${className} ${"shadow-none border border-ld"} `}
      style={{ borderRadius: `24px` }}
    >
      {children}
    </Card>
  );
};

export default CardBox;
