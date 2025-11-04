export type Greeting = "Good morning" | "Good afternoon" | "Good evening" | "Good night";

function getGreetingForHour(hour: number): Greeting {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function msUntilNextBoundary(now: Date): number {
  // Boundaries: 05:00, 12:00, 17:00, 21:00 local time
  const boundaries = [5, 12, 17, 21];
  const next = new Date(now);
  next.setSeconds(0, 0);
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // If we are exactly at a boundary minute, advance to next minute to avoid immediate trigger
  const atBoundaryHour = boundaries.includes(currentHour) && currentMinutes === 0;

  // Find next boundary today
  let nextHour = boundaries.find((h) => h > currentHour) ?? boundaries[0];
  next.setHours(nextHour, 0, 0, 0);

  if (next <= now || atBoundaryHour) {
    // If boundary already passed (or exactly now), move to next boundary
    const idx = boundaries.indexOf(nextHour);
    nextHour = boundaries[(idx + 1) % boundaries.length];
    next.setDate(now.getDate() + (idx === boundaries.length - 1 ? 1 : 0));
    next.setHours(nextHour, 0, 0, 0);
  }

  return next.getTime() - now.getTime();
}

import { useEffect, useState } from "react";

export function useTimeGreeting(): Greeting {
  const [greeting, setGreeting] = useState<Greeting>(() => getGreetingForHour(new Date().getHours()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      const now = new Date();
      setGreeting(getGreetingForHour(now.getHours()));
      const wait = msUntilNextBoundary(now);
      timer = setTimeout(schedule, wait);
    };

    schedule();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return greeting;
}
