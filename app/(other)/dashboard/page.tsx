"use client";

import { Suspense } from "react";
import DashboardContent from "./dashboard-content";
import { AuthSpinner } from "@/components/loaders/AuthSpinner";

export default function DashboardPage() {
  return (
    <Suspense fallback={<AuthSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}