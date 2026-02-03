"use client";

import MetaThemeColor from "@/components/MetaThemeColor"; // ⬅️ import
import { tools } from "@/lib/toolsConfig";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <MetaThemeColor type="app" />
      <h1>Available Tools</h1>
      <ul>
        {tools.map((tool) => (
          <li key={tool.name}>
            <Link href={tool.path}>{tool.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}


// test