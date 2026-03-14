import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronDown,
  Globe,
  Heart,
  HelpCircle,
  Leaf,
  ListOrdered,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Store,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useAppStore } from "../stores/appStore";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिंदी", short: "हि" },
  { code: "khasi", label: "Khasi", short: "Kha" },
  { code: "mizo", label: "Mizo", short: "Miz" },
];

export default function Navbar() {
  const { t } = useTranslation();
  const {
    currentUser,
    logout,
    notifications,
    fetchNotifications,
    setLanguage,
    language,
  } = useAppStore();
  const navigate = useNavigate();

  // Scroll state for navbar effect
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser, fetchNotifications]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  // ── Nav links by role ────────────────────────────────────────────────
  const farmerLinks = [
    {
      to: "/marketplace",
      label: () => t("nav.marketplace"),
      icon: <Store className="w-4 h-4" />,
    },
    {
      to: "/dashboard",
      label: () => t("nav.myListings"),
      icon: <ListOrdered className="w-4 h-4" />,
    },
  ];

  const buyerLinks = [
    {
      to: "/marketplace",
      label: () => t("nav.marketplace"),
      icon: <Store className="w-4 h-4" />,
    },
    {
      to: "/dashboard",
      label: () => t("nav.interests"),
      icon: <Heart className="w-4 h-4" />,
    },
  ];

  const adminLinks = [
    {
      to: "/marketplace",
      label: () => t("nav.marketplace"),
      icon: <Store className="w-4 h-4" />,
    },
    {
      to: "/admin",
      label: () => t("nav.admin"),
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const navLinks =
    currentUser?.role === "farmer"
      ? farmerLinks
      : currentUser?.role === "buyer"
        ? buyerLinks
        : adminLinks;

  const publicLinks = [
    { to: "/", label: () => t("home") },
    { to: "/about", label: () => t("about") },
    {
      to: "/help",
      label: () => t("help") || "Help",
      icon: <HelpCircle className="w-4 h-4" />,
    },
    { to: "/contact", label: () => t("contact") }, // Placeholder icon
  ];

  function handleLogout() {
    logout();
    navigate("/login");
    setMobileOpen(false);
  }

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleColor =
    currentUser.role === "farmer"
      ? "bg-farm-green-pale text-farm-green"
      : currentUser.role === "buyer"
        ? "bg-farm-amber-pale text-farm-earth"
        : "bg-muted text-muted-foreground";

  const roleIcon =
    currentUser.role === "farmer" ? (
      <Sprout className="w-3 h-3" />
    ) : currentUser.role === "buyer" ? (
      <ShoppingBag className="w-3 h-3" />
    ) : (
      <ShieldCheck className="w-3 h-3" />
    );

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b border-border transition-all duration-300 ${scrolled ? "bg-card/98 backdrop-blur shadow-md" : "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[5rem] items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-base tracking-tight hidden sm:block">
              Local Connect
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {publicLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-farm-green-pale text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                {icon}
                {label()}
              </NavLink>
            ))}
            <div className="w-px h-4 bg-border mx-2" />
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-farm-green-pale text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                {icon}
                {label()}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {LANGUAGES.find((l) => l.code === language)?.short}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`text-sm ${language === lang.code ? "font-medium text-primary" : ""}`}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications bell */}
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `relative p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-farm-green-pale text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>

            {/* User avatar + dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl hover:bg-muted px-2 py-1 transition-colors"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium text-foreground leading-none">
                      {currentUser.name?.split(" ")[0]}
                    </div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-[10px] mt-0.5 px-1.5 py-0.5 rounded-full ${roleColor}`}
                    >
                      {roleIcon}
                      <span className="capitalize">{currentUser.role}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-medium text-sm text-foreground">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +91 {currentUser.phone}
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={() => {
                    navigate("/profile");
                    setMobileOpen(false);
                  }}
                  className="gap-2 mt-1"
                >
                  <User className="w-4 h-4" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-1 bg-card">
              {[...publicLinks, ...navLinks].map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-farm-green-pale text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  {icon}
                  {label()}
                </NavLink>
              ))}
              <NavLink
                to="/notifications"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-farm-green-pale text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4" />
                  {t("nav.notifications")}
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground text-xs h-5">
                    {unreadCount}
                  </Badge>
                )}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
