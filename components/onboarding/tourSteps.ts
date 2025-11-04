import type { TourStep } from "./Tour";

export const dashboardTourSteps: TourStep[] = [
  {
    selector: "[data-tour='welcome-banner']",
    title: "Welcome to your dashboard",
    content: "Here you’ll find a quick greeting and useful stats to get started.",
  },
  {
    selector: "[data-tour='upload-audio']",
    title: "Upload audio",
    content: "Click here to upload your lecture audio and start transcription.",
  },
  {
    selector: "[data-tour='stats-cards']",
    title: "Your usage at a glance",
    content: "These cards show total audios, minutes processed, and recent activity.",
  },
  {
    selector: "[data-tour='nav-bar']",
    title: "Navigation",
    content: "Use the top navigation to move between dashboard, history, notifications, and settings.",
  },
];
