import React from "react";
import PropTypes from "prop-types";
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  Briefcase,
  Calendar,
  Clock,
  Code2,
  CreditCard,
  Database,
  FileText,
  Globe,
  Home,
  Info,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  List,
  MapPin,
  MessageSquare,
  PieChart,
  Rocket,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Table2,
  User,
  Users,
  Workflow,
} from "lucide-react";

const ICONS = {
  activity: Activity,
  "bar-chart": BarChart3,
  bell: Bell,
  boxes: Boxes,
  briefcase: Briefcase,
  calendar: Calendar,
  clock: Clock,
  code: Code2,
  "credit-card": CreditCard,
  database: Database,
  dot: Info,
  file: FileText,
  globe: Globe,
  home: Home,
  info: Info,
  layers: Layers,
  dashboard: LayoutDashboard,
  grid: LayoutGrid,
  "line-chart": LineChart,
  list: List,
  map: MapPin,
  message: MessageSquare,
  "pie-chart": PieChart,
  rocket: Rocket,
  search: Search,
  settings: Settings,
  shield: Shield,
  cart: ShoppingCart,
  star: Star,
  table: Table2,
  user: User,
  users: Users,
  workflow: Workflow,
};

export const APPLICATION_NAVIGATION_ICONS = Object.entries(ICONS)
  .map(([value, Icon]) => ({ value, Icon }))
  .sort((a, b) => a.value.localeCompare(b.value));

export function getApplicationNavigationIcon(name) {
  return ICONS[name] || ICONS.dot;
}

export function ApplicationNavigationIcon({ name, className = "h-4 w-4" }) {
  const Icon = getApplicationNavigationIcon(name);
  return <Icon className={className} aria-hidden="true" />;
}

ApplicationNavigationIcon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
};
