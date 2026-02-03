"use client";

import React from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { use } from "react";

// Map of tools
const toolsMap: Record<string, React.ComponentType> = {
  "timesheet-calculator": dynamic(() =>
    import("@/components/tools/timesheet-calculator")
  ),
  "punch-card-maker": dynamic(() =>
    import("@/components/tools/PunchCardMaker")
  ),
  "tool-1": dynamic(() => import("@/components/tools/tool-1")),
  "tool-2": dynamic(() => import("@/components/tools/tool-2")),
};

const ToolPage = ({ params }: { params: Promise<{ tool: string }> }) => {
  // Unwrap the `params` Promise
  const resolvedParams = use(params);
  const { tool } = resolvedParams;

  const ToolComponent = toolsMap[tool];

  if (!ToolComponent) {
    notFound(); // Show 404 if the tool doesn't exist
    return null;
  }

  return (
    <div>
      <ToolComponent />
    </div>
  );
};

export default ToolPage;