"use client";

import "@/app/globals.css"; // Correct absolute path to CSS

interface LayoutProps {
  children: React.ReactNode;
}

const ScheduleLayout: React.FC<LayoutProps> = ({ children }) => {
  console.log("Schedule Layout Rendered");
  return <>{children}</>; // Simply render children without wrapping anything
};

export default ScheduleLayout;
