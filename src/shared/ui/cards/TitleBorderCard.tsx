"use client";
import { Card } from "flowbite-react";
import React from "react";

interface MyAppProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}
const TitleCard: React.FC<MyAppProps> = ({ children, className, title }) => {
  return (
    <Card
      className={`card ${className} ${
         "shadow-none border border-ld p-0"
      } `}
      style={{ borderRadius: `24px` }}
    >
      <div className="border-b border-ld px-6 py-4">
        <h5 className="card-title">{title}</h5>
      </div>
      <div className="pt-4 p-6">{children}</div>
    </Card>
  );
};

export default TitleCard;
