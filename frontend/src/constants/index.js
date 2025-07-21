import { Home, Rocket } from "lucide-react";

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
  // {
  //     id: '1',
  //     title: 'Integrations',
  //     url: '#integrations',
  // },
  // {
  //     id: '2',
  //     title: 'Deployments',
  //     url: '#deployments',
  // },
  // {
  //     id: '3',
  //     title: 'Activity',
  //     url: '#activity',
  // },
  // {
  //     id: '4',
  //     title: 'Domains',
  //     url: '#domains',
  // },
  // {
  //     id: '5',
  //     title: 'Usage',
  //     url: '#usage',
  // },
  // {
  //     id: '6',
  //     title: 'Monitoring',
  //     url: '#monitoring',
  // },
  // {
  //     id: '7',
  //     title: 'Observability',
  //     url: '#observability',
  // },
  // {
  //     id: '8',
  //     title: 'Storage',
  //     url: '#storage',
  // },
  // {
  //     id: '9',
  //     title: 'Flags',
  //     url: '#flags',
  // },
  // {
  //     id: '10',
  //     title: 'AI',
  //     url: '#ai',
  // },
  // {
  //     id: '11',
  //     title: 'Support',
  //     url: '#support',
  // },
  // {
  //     id: '12',
  //     title: 'Settings',
  //     url: '#settings',
  // },
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
