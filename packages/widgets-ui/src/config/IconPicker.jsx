import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Code,
  Copy,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Folder,
  Globe,
  Heart,
  Home,
  Image,
  Info,
  Key,
  LayoutGrid,
  Link,
  List,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Phone,
  PieChart,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  Square,
  Star,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Unlock,
  Upload,
  User,
  Users,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { Input, Popover, PopoverContent, PopoverTrigger, cn } from "@jet-admin/ui";

const ICONS = {
  activity: Activity,
  alert: AlertCircle,
  warning: AlertTriangle,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  chart: BarChart3,
  bell: Bell,
  calendar: Calendar,
  check: Check,
  "check-circle": CheckCircle,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  circle: Circle,
  clock: Clock,
  code: Code,
  copy: Copy,
  database: Database,
  download: Download,
  edit: Edit3,
  external: ExternalLink,
  eye: Eye,
  "eye-off": EyeOff,
  file: FileText,
  filter: Filter,
  folder: Folder,
  globe: Globe,
  heart: Heart,
  home: Home,
  image: Image,
  info: Info,
  key: Key,
  grid: LayoutGrid,
  link: Link,
  list: List,
  lock: Lock,
  login: LogIn,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  message: MessageSquare,
  more: MoreHorizontal,
  "more-vertical": MoreVertical,
  pencil: Pencil,
  phone: Phone,
  pie: PieChart,
  play: Play,
  plus: Plus,
  refresh: RefreshCw,
  reset: RotateCcw,
  save: Save,
  search: Search,
  send: Send,
  settings: Settings,
  shield: Shield,
  sliders: SlidersHorizontal,
  square: Square,
  star: Star,
  terminal: Terminal,
  trash: Trash2,
  "trend-down": TrendingDown,
  "trend-up": TrendingUp,
  unlock: Unlock,
  upload: Upload,
  user: User,
  users: Users,
  video: Video,
  wifi: Wifi,
  close: X,
  zap: Zap,
};

export const getIconComponent = (name) => ICONS[String(name || "").toLowerCase()] || null;

/**
 * IconPicker — curated lucide-react set (no giant barrel import), searchable,
 * keyboard reachable, and token-styled. Empty string means "no icon".
 */
export const IconPicker = ({
  id,
  value = "",
  onChange,
  label = "Icon",
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const SelectedIcon = getIconComponent(value);

  const options = useMemo(() => {
    const term = query.trim().toLowerCase();
    return Object.entries(ICONS).filter(([name]) => !term || name.includes(term));
  }, [query]);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-label={`${label}: ${value || "none"}`}
            title={value || "No icon"}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
          >
            {SelectedIcon ? <SelectedIcon className="h-4 w-4" /> : <span className="text-[10px] text-muted-foreground">—</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search icons…"
            aria-label="Search icons"
            className="mb-2 h-8 text-xs"
          />
          <div className="grid max-h-56 grid-cols-6 gap-1 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
              aria-label="No icon"
              title="No icon"
              className={cn(
                "flex h-9 items-center justify-center rounded-control border text-[10px]",
                !value ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              None
            </button>
            {options.map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange?.(name);
                  setOpen(false);
                }}
                aria-label={name}
                title={name}
                aria-pressed={value === name}
                className={cn(
                  "flex h-9 items-center justify-center rounded-control border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  value === name
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          {options.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No icons match.</p>}
        </PopoverContent>
      </Popover>
      <span className="truncate font-mono text-[11px] text-muted-foreground">{value || "none"}</span>
    </div>
  );
};

export default IconPicker;
