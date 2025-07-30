import { ChartColumn, Home, Rocket } from "lucide-react";

export const navLinks = [
  {
    id: "1",
    title: "Dashboard",
    url: "/dashboard",
    icon: <Home className="w-4 h-4" />,
  },
  {
    id: "2",
    title: "Projects",
    url: "/projects",
    icon: <Rocket className="w-4 h-4" />,
  },
  {
    id: "3",
    title: "Analytics",
    url: "/analytics",
    icon: <ChartColumn className="w-4 h-4" />,
  },
];

export const gridItems = [
  {
    id: 1,
    title: "One-click deployment",
    description:
      "Instantly deploy your project with a single click, no setup, no hassles.",
    className: "",
  },
  {
    id: 2,
    title: "Real-time deployment logs",
    description:
      "Monitor every step of your development process with real-time, detailed logs.",
    className: "",
  },
  {
    id: 3,
    title: "Live preview and rollback",
    description:
      "Preview updates in real time and revert to previous versions with ease.",
    className: "",
  },
  {
    id: 4,
    title: "Custom domain mapping",
    description:
      "Connect and manage your own domains for a professional presence.",
    className: "",
  },
  {
    id: 5,
    title: "CI/CD integration",
    description:
      "Automate your workflow with seamless continuous integration and delivery.",
    className: "",
  },
  {
    id: 6,
    title: "Performance analytics",
    description:
      "Gain insights into your app's speed and user experience with detailed analytics.",
    className: "bg-blue text-slate-200",
  },
];
