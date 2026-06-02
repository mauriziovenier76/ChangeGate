import {
  Home,
  ListChecks,
  Calendar,
  Settings,
  Users,
  FolderKanban,
  ChevronDown,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    icon: <Home size={16} />,
    links: [
      { label: "Overview", href: "/dashboard" },
      { label: "Statistiche", href: "/dashboard/stats" },
    ],
  },
  {
    name: "Change Request",
    icon: <ListChecks size={16} />,
    links: [
      { label: "Lista", href: "/requests" },
      { label: "Nuova CR", href: "/requests/new" },
    ],
  },
  {
    name: "Planning",
    icon: <Calendar size={16} />,
    links: [
      { label: "Calendario", href: "/planning" },
      { label: "Timeline", href: "/planning/timeline" },
    ],
  },
  {
    name: "Configurazioni",
    icon: <Settings size={16} />,
    links: [
      { label: "Clienti", href: "/config/clienti" },
      { label: "Progetti", href: "/config/progetti" },
      { label: "Fornitori", href: "/config/fornitori" }, // 👈 NUOVO
    ],
  },
];
