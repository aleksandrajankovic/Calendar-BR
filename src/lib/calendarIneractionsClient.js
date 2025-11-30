"use client";

import { useEffect } from "react";
import { initCalendarInteractions } from "@/lib/calendarInteractions";

export default function CalendarInteractionsClient() {
  useEffect(() => {
    initCalendarInteractions("#calendar-root");
  }, []);

  return null;
}
