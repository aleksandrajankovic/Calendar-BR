import { Suspense } from "react";
import WeeklyPlanClient from "./WeeklyPlanClient";

export default function WeeklyPlanPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm">Loading weekly plan…</div>}>
      <WeeklyPlanClient />
    </Suspense>
  );
}
