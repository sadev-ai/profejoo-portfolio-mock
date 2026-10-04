// src/components/dashboard/ProfileCard.tsx
import * as React from "react";
import {
  Edit2,
  Linkedin,
  Mail,
  Github,
  Building2,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "./DashboardCard";
import { ROUTES } from "@/constants/routes";
// ❌ We don't need this anymore
// import { TagPill } from "./Common";
import { Badge } from "@/components/ui/badge";
import { getInitials, getAvatarColorFromEmail } from "@/lib/avatarUtils";

// src/components/dashboard/ProfileCard.tsx

export type ProfileCardProps = {
  name: string;
  role: string;
  university: string;
  location?: string;
  tags: string[];
  avatarUrl?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};


export function ProfileCard(props: ProfileCardProps) {
  const { name, role, university, location, tags, avatarUrl, email } = props;
  const navigate = useNavigate();

  const initials = React.useMemo(() => {
    const parts = name.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts[parts.length - 1] || "";
    return getInitials(firstName, lastName, email);
  }, [name, email]);

  const avatarBgColor = React.useMemo(() => {
    return getAvatarColorFromEmail(email);
  }, [email]);

  const handleEditClick = () => {
    navigate(ROUTES.DASHBOARD_PROFILE);
  };

  return (
    <DashboardCard
      title="Profile"
      headerRight={
        <button
          type="button"
          onClick={handleEditClick}
          className="
            inline-flex items-center gap-2
            rounded-xl border border-primary px-4 py-1.5
            text-sm font-medium text-primary
            bg-transparent hover:bg-primary/5
            transition-colors
          "
        >
          <Edit2 className="h-4 w-4" />
          <span>Edit</span>
        </button>
      }
      className="h-full"
    >
      <div className="flex items-stretch gap-4 md:gap-5">
        {/* Avatar on the left (rounded-corner rectangle) */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="
              shrink-0 object-cover
              h-28 w-24 md:h-32 md:w-28
              rounded-3xl
            "
          />
        ) : (
          <div
            style={{ backgroundColor: avatarBgColor }}
            className="
              flex shrink-0 items-center justify-center
              h-28 w-24 md:h-32 md:w-28
              rounded-3xl
              text-2xl md:text-3xl font-semibold text-white
            "
          >
            {initials}
          </div>
        )}

        {/* Profile info */}
        <div className="flex flex-1 flex-col">
          <div className="mb-2">
            <p className="text-base md:text-lg font-semibold text-foreground">
              {name}
            </p>

            <p className="mt-1 flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{role}</span>
            </p>

            <p className="mt-1 flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {university}
                {location ? `, ${location}` : ""}
              </span>
            </p>
          </div>

          {/* Social media icons */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-md bg-primary-600 text-white
                hover:bg-primary-800
                transition-colors
              "
            >
              <Linkedin className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-md bg-primary-600 text-white
                hover:bg-primary-800
                transition-colors
              "
            >
              <Github className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-md bg-primary-600 text-white
                hover:bg-primary-800
                transition-colors
              "
            >
              <Mail className="h-4 w-4" />
            </button>
          </div>

          {/* Tags using a shadcn-style secondary palette */}
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="
                  bg-[var(--secondary-50)] text-[var(--secondary-400)]
                "
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
