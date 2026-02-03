"use client";

import BusinessManager from "./RWbuissnes";
import ChangeCleaning from "./changecleaning";
import ModifyMembers from "./ModifyMembers";
import { useTheme } from "@/app/provider";

export default function CMSSettings() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  return (
    <div className="space-y-8">
      <div>
        <ChangeCleaning />
      </div>

      <div>
        <BusinessManager />
      </div>
      
      <div>
        <ModifyMembers />
      </div>
    </div>
  );
}