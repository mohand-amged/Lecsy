import type { DriveStep } from "driver.js";

export const dashboardDriverSteps: DriveStep[] = [
  {
    element: "[data-tour='nav-bar']",
    popover: {
      title: "Navigation",
      description: "Use the top bar to access Dashboard, History, Notifications, and Settings.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "[data-tour='welcome-banner']",
    popover: {
      title: "Personalized welcome",
      description: "We greet you based on your local time and show quick tips to get you started.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "[data-tour='stats-cards']",
    popover: {
      title: "Your progress",
      description: "These cards summarize total audios, minutes processed, and your latest activity.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "[data-tour='upload-audio']",
    popover: {
      title: "Upload and transcribe",
      description: "Drop or select an audio file to start a transcription. You’ll see status updates here.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "[data-tour='notifications']",
    popover: {
      title: "Notifications",
      description: "We’ll notify you when transcriptions finish. Open the bell to see recent updates.",
      side: "bottom",
      align: "end",
    },
  },
];
