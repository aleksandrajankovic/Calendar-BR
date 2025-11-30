// components/CalendarEnhancer.js (CLIENT COMPONENT)
"use client";

import { useEffect } from "react";
import { initCalendarInteractions } from "@/lib/calendarInteractions";

export default function CalendarEnhancer() {
  useEffect(() => {
    initCalendarInteractions("#calendar-root");
  }, []);
  return null; 
}
