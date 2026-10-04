import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import DashboardMenuItem from "@/components/dashboard/DashboardMenuItem";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/context/ProfileContext";
import { getInitials, getAvatarColorFromEmail } from "@/lib/avatarUtils";
import { ROUTES } from "@/constants/routes";
import {
  FiUser,
  FiMenu,
  FiSearch,
  FiMessageCircle,
  FiFileText,
  FiMail,
  FiGrid,
  FiBell,
  FiHeart,
  FiClock,
  FiLogOut,
  FiX,
  FiStar,
} from "react-icons/fi";

import logoUrl from "/assets/images/Logo.svg";

type OpenKeys = "profile";

type Props = {
  open?: Record<OpenKeys, boolean>;
  onToggleOne?: (k: OpenKeys, state?: boolean) => void;
};

export default function DashboardSidebar({
  open: controlledOpen,
  onToggleOne,
}: Props) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useAuth();
  const { profile } = useProfile();
  
  const basics = profile?.data?.basics;
  const avatarUrl = basics?.avatar_url;
  const email = basics?.email || user?.email;
  const firstName = basics?.first_name || "";
  const lastName = basics?.last_name || "";
  const initials = getInitials(firstName, lastName, email);
  const avatarBgColor = getAvatarColorFromEmail(email);

  const AvatarVisual = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt="Profile"
          className="h-10 w-10 rounded-full border-2 border-[var(--secondary-400)] object-cover shadow-sm shrink-0"
        />
      );
    }
    return (
      <div
        style={{ backgroundColor: avatarBgColor }}
        className="h-10 w-10 rounded-full border-2 border-[var(--secondary-400)] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
      >
        {initials}
      </div>
    );
  };

  const [internalOpen, setInternalOpen] = useState<Record<OpenKeys, boolean>>({
    profile: false,
  });

  const open = controlledOpen ?? internalOpen;

  const toggleOne = (k: OpenKeys, state?: boolean) => {
    if (onToggleOne) return onToggleOne(k, state);
    setInternalOpen((s) => ({
      profile: false,
      [k]: state !== undefined ? state : !s[k],
    }));
  };

  const is = (prefix: string) => pathname.startsWith(prefix);

  const profileActive =
    is(ROUTES.DASHBOARD_PROFILE) ||
    is(ROUTES.DASHBOARD_NOTIFICATIONS) ||
    is(ROUTES.DASHBOARD_FAVORITES) ||
    is(ROUTES.LOGOUT);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleMobileNavClick = () => setMobileOpen(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const FloatingHeader = (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none transition-all duration-300 ease-in-out ${
        scrolled ? "p-0" : "p-4"
      }`}
    >
      <header 
        className={`pointer-events-auto w-full flex flex-col justify-center backdrop-blur-md transition-all duration-300 ease-in-out ${
          scrolled
            ? "max-w-full rounded-none bg-white/60 border-b border-white/50 shadow-md"
            : "rounded-2xl bg-white/70 border border-white/70 shadow-sm"
        }`}
      >
        <div className="hidden lg:flex w-full mx-auto items-center justify-between h-[72px] px-4 xl:px-6">
          <div className="flex items-center gap-3 shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center">
              <img src={logoUrl} alt="Profejoo" className="h-9 w-auto select-none" draggable={false} />
            </Link>
          </div>

          <nav className="flex-1 flex items-center justify-center gap-1 xl:gap-2 px-4">
            <DashboardMenuItem layout="horizontal" label="Dashboard" icon={FiGrid} to={ROUTES.DASHBOARD} active={pathname === ROUTES.DASHBOARD} />
            <DashboardMenuItem layout="horizontal" label="Search" icon={FiSearch} to={ROUTES.DASHBOARD_SEARCH} active={is(ROUTES.DASHBOARD_SEARCH)} />
            
            <DashboardMenuItem 
              layout="horizontal" 
              label="Chatbot" 
              icon={FiMessageCircle} 
              to={ROUTES.DASHBOARD_CHATBOT} 
              active={pathname.toLowerCase().includes("chatbot") || pathname.toLowerCase().includes("chat") || pathname.toLowerCase().includes("faq")} 
            />
            
            <DashboardMenuItem layout="horizontal" label="Resume Maker" icon={FiFileText} to={ROUTES.DASHBOARD_RESUME_MAKER} active={is(ROUTES.DASHBOARD_RESUME_MAKER)} />
            <DashboardMenuItem layout="horizontal" label="Email & SOP" icon={FiMail} to={ROUTES.DASHBOARD_EMAIL_SOP} active={is(ROUTES.DASHBOARD_EMAIL_SOP)} />
            <DashboardMenuItem layout="horizontal" label="Plans" icon={FiStar} to={ROUTES.DASHBOARD_PLANS} active={is(ROUTES.DASHBOARD_PLANS)} />
          </nav>

          <div className="flex shrink-0 items-center justify-end">
            <DashboardMenuItem
              layout="horizontal"
              label=""
              icon={AvatarVisual}
              expanded={open.profile}
              onToggle={(next) => toggleOne("profile", next)}
              dropdownAlign="right"
              childrenPlacement="below"
              childrenItems={[
                { label: "Overview", to: ROUTES.DASHBOARD_PROFILE, icon: FiUser },
                { label: "Notifications", to: ROUTES.DASHBOARD_NOTIFICATIONS, icon: FiBell },
                { label: "Favorites", to: ROUTES.DASHBOARD_FAVORITES, icon: FiHeart },
                { label: "History", to: ROUTES.DASHBOARD_HISTORY, icon: FiClock },
                { label: "Log out", to: ROUTES.LOGOUT, icon: FiLogOut },
              ]}
              active={profileActive}
              className="bg-transparent border-transparent shadow-none hover:bg-black/5"
            />
          </div>
        </div>

        <div className="lg:hidden relative flex w-full mx-auto items-center justify-between h-[64px] px-4">
          <div className="flex shrink-0 z-10 -ml-2">
            <DashboardMenuItem
              layout="horizontal"
              label="Profile"
              icon={AvatarVisual}
              expanded={open.profile}
              onToggle={(next) => toggleOne("profile", next)}
              hideText={true}
              dropdownAlign="left"
              childrenPlacement="below"
              childrenItems={[
                { label: "Overview", to: ROUTES.DASHBOARD_PROFILE, icon: FiUser },
                { label: "Notifications", to: ROUTES.DASHBOARD_NOTIFICATIONS, icon: FiBell },
                { label: "Favorites", to: ROUTES.DASHBOARD_FAVORITES, icon: FiHeart },
                { label: "History", to: ROUTES.DASHBOARD_HISTORY, icon: FiClock },
                { label: "Log out", to: ROUTES.LOGOUT, icon: FiLogOut },
              ]}
              active={profileActive}
              className="bg-transparent border-transparent shadow-none hover:bg-transparent px-2"
            />
          </div>

          <Link to={ROUTES.HOME} className="absolute left-1/2 -translate-x-1/2 z-0 inline-flex items-center">
            <img src={logoUrl} alt="Profejoo" className="h-8 w-auto select-none" draggable={false} />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--primary-400)] hover:bg-black/5 transition z-10 -mr-2"
          >
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
      </header>
    </div>
  );

  const MobileDrawer = mobileOpen && (
    <div className="lg:hidden fixed inset-0 z-[999] transition-all">
      <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
      
      <div className="absolute inset-x-0 top-0 bottom-0 bg-white/50 backdrop-blur-md border-t border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.18)] flex flex-col">
        <div className="h-[64px] px-4 flex shrink-0 items-center justify-between border-b border-white/60">
          <Link to={ROUTES.HOME} className="inline-flex items-center" onClick={() => setMobileOpen(false)}>
            <img src={logoUrl} alt="Profejoo" className="h-9 w-auto select-none" draggable={false} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:bg-black/5"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
          <DashboardMenuItem layout="vertical" label="Dashboard" icon={FiGrid} to={ROUTES.DASHBOARD} active={pathname === ROUTES.DASHBOARD} onClick={handleMobileNavClick} />
          <DashboardMenuItem layout="vertical" label="Search" icon={FiSearch} to={ROUTES.DASHBOARD_SEARCH} active={is(ROUTES.DASHBOARD_SEARCH)} onClick={handleMobileNavClick} />
          
          <DashboardMenuItem 
            layout="vertical" 
            label="Chatbot" 
            icon={FiMessageCircle} 
            to={ROUTES.DASHBOARD_CHATBOT} 
            active={pathname.toLowerCase().includes("chatbot") || pathname.toLowerCase().includes("chat") || pathname.toLowerCase().includes("faq")} 
            onClick={handleMobileNavClick} 
          />
          
          <DashboardMenuItem layout="vertical" label="Resume Maker" icon={FiFileText} to={ROUTES.DASHBOARD_RESUME_MAKER} active={is(ROUTES.DASHBOARD_RESUME_MAKER)} onClick={handleMobileNavClick} />
          <DashboardMenuItem layout="vertical" label="Email & SOP" icon={FiMail} to={ROUTES.DASHBOARD_EMAIL_SOP} active={is(ROUTES.DASHBOARD_EMAIL_SOP)} onClick={handleMobileNavClick} />
          <DashboardMenuItem layout="vertical" label="Plans" icon={FiStar} to={ROUTES.DASHBOARD_PLANS} active={is(ROUTES.DASHBOARD_PLANS)} onClick={handleMobileNavClick} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-[96px] lg:h-[104px] w-full shrink-0" aria-hidden="true" />
      {FloatingHeader}
      {MobileDrawer}
    </>
  );
}