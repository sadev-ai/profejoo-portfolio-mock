"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "profejoo",
          title: "!text-sm !font-semibold !text-inherit",
          description: "!text-xs !opacity-70 !text-inherit",
          error: "!bg-[var(--accent-50)] !text-[var(--accent-700)] !border-[var(--accent-500)]",
          success: "!bg-[var(--secondary-50)] !text-[var(--primary-600)] !border-[var(--secondary-500)]",
          warning: "!bg-[var(--accent-50)] !text-[var(--accent-600)] !border-[var(--accent-400)]",
          info: "!bg-[var(--tertiary-50)] !text-[var(--tertiary-700)] !border-[var(--tertiary-500)]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--white)",
          "--normal-text": "var(--tertiary-400)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
