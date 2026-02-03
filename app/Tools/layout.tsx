"use client";

import "../globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface ToolsLayoutProps {
  children: React.ReactNode;
}

const ToolsLayout: React.FC<ToolsLayoutProps> = ({ children }) => {
  return (
    <div>
      <Nav pageTitle="tools" /> {/* Tools-specific Nav */}
      <main>{children}</main>
      <Footer /> {/* Tools-specific Footer */}
    </div>
  );
};

export default ToolsLayout;