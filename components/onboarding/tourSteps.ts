import type { TourStep } from "./Tour";

export const dashboardTourSteps: TourStep[] = [
  {
    selector: "[data-tour='nav-bar']",
    title: "Navigation",
    content: "Use the top bar to access Dashboard, History, Notifications, and Settings.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='welcome-banner']",
    title: "Personalized welcome",
    content: "We greet you based on your local time and show quick tips to get you started.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='stats-cards']",
    title: "Your progress",
    content: "These cards summarize total audios, minutes processed, and your latest activity.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='upload-audio']",
    title: "Upload and transcribe",
    content: "Drop or select an audio file to start a transcription. You’ll see status updates here.",
    placement: "top",
  },
  {
    selector: "[data-tour='notifications']",
    title: "Notifications",
    content: "We’ll notify you when transcriptions finish. Open the bell to see recent updates.",
    placement: "bottom",
  },
];
