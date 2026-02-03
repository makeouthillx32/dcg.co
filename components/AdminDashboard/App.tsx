// components/AdminDashboard/App.tsx
import React from "react";

interface AdminAppProps {
  userId: string;
}

export default function AdminApp({ userId }: AdminAppProps) {
  // …original dashboard code, now you can use userId to fetch data…
  return (
    <div>
      {/* Dashboard UI */}
    </div>
  );
}
