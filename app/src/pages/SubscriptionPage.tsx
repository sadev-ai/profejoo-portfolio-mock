// src/pages/SubscriptionPage.tsx
import * as React from "react";
import { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";

type OpenKeys = "profile" | "plans" | "resources" | "favorites" | "history";

// ---------------------- Types ----------------------

type B2CPlanId = "bronze" | "silver" | "gold" | "diamond";

type B2CPlan = {
  id: B2CPlanId;
  name: string;
  badge?: string;
  badgeTone?: "accent" | "muted" | "primary";
  priceMonthly: number;
  subtitle: string;
  highlight?: string;
  popular?: boolean;
  ctaLabel: string;
  ctaVariant?: "primary" | "outline" | "ghost";
  features: string[];
};

type FeatureRow = {
  id: string;
  label: string;
  description?: string;
  values: Partial<Record<B2CPlanId, boolean | string>>;
};

type B2BPlanId = "gold-support" | "diamond-support";

type B2BPlan = {
  id: B2BPlanId;
  name: string;
  tag: string;
  subtitle: string;
  description: string;
  priceNote: string;
  highlights: string[];
};

// ---------------------- B2C DATA ----------------------

const B2C_PLANS: B2CPlan[] = [
  {
    id: "bronze",
    name: "Bronze",
    badge: "Free",
    badgeTone: "accent",
    priceMonthly: 0,
    subtitle: "Explore & experiment",
    highlight: "Perfect for getting started with Profejoo",
    ctaLabel: "Current plan",
    ctaVariant: "ghost",
    features: [
      "Full university & professor search (even without login)",
      "With login: access to professor detail pages & open positions",
      "Position-based search unlocked",
      "Up to 2 AI-generated SOP/CV/Email per day for professors",
      "Up to 2 AI-generated SOP/CV/Email per day for positions",
      "Manual editing for all generated documents",
      "Limited AI refinement (single chatbot edit per document)",
      "Weekly: up to 3 matched professors/positions based on your profile",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    badge: "AI Creator",
    badgeTone: "muted",
    priceMonthly: 19,
    subtitle: "Unlimited AI writing",
    highlight: "Best for active applicants writing many drafts",
    ctaLabel: "Upgrade to Silver",
    ctaVariant: "outline",
    features: [
      "Everything in Bronze",
      "Unlimited AI-generated SOP/CV/Email",
      "Unlimited AI edit & deep analysis for all documents",
      "Weekly: up to 3 matched professors/positions",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    badge: "Most popular",
    badgeTone: "muted",
    priceMonthly: 39,
    subtitle: "Mentor + smart matching alerts",
    highlight: "Never miss a matching opportunity again",
    popular: true,
    ctaLabel: "Upgrade to Gold",
    ctaVariant: "primary",
    features: [
      "Everything in Silver",
      "Real-time alerts whenever new matching professors/positions appear",
      "Dedicated “Matched professors & positions” section in your dashboard",
      "1:1 personal mentor to guide your whole application journey",
    ],
  },
  {
    id: "diamond",
    name: "Diamond",
    badge: "Power user",
    badgeTone: "muted",
    priceMonthly: 59,
    subtitle: "For intensive multi-target applicants",
    highlight: "For users running many parallel applications",
    ctaLabel: "Upgrade to Diamond",
    ctaVariant: "primary",
    features: [
      "Everything in Gold",
      "Best for long-term, multi-year application strategies",
      "Priority support and faster response on feedback",
    ],
  },
];

const FEATURE_ROWS: FeatureRow[] = [
  {
    id: "search",
    label: "Search & filter universities/professors",
    description: "Advanced filters, ranges and ordering options",
    values: {
      bronze: true,
      silver: true,
      gold: true,
      diamond: true,
    },
  },
  {
    id: "detail",
    label: "Professor detail page",
    description: "Interests, links, research areas and more",
    values: {
      bronze: true,
      silver: true,
      gold: true,
      diamond: true,
    },
  },
  {
    id: "position-search",
    label: "Position-based search",
    values: { bronze: true, silver: true, gold: true, diamond: true },
  },
  {
    id: "ai-docs",
    label: "AI-generated SOP / CV / Email per day",
    values: {
      bronze: "2 for professors + 2 for positions",
      silver: "Unlimited",
      gold: "Unlimited",
      diamond: "Unlimited",
    },
  },
  {
    id: "ai-edit",
    label: "AI edit / chatbot refinement",
    values: {
      bronze: "Limited (single refinement)",
      silver: "Unlimited",
      gold: "Unlimited",
      diamond: "Unlimited",
    },
  },
  {
    id: "matches",
    label: "Matched professors / positions",
    values: {
      bronze: "3 per week",
      silver: "3 per week",
      gold: "All matches, real-time alerts",
      diamond: "All matches, real-time alerts",
    },
  },
  {
    id: "matched-section",
    label: "Dedicated “Matched” section in dashboard",
    values: {
      bronze: false,
      silver: false,
      gold: true,
      diamond: true,
    },
  },
  {
    id: "mentor",
    label: "1:1 personal mentor",
    values: {
      bronze: false,
      silver: false,
      gold: true,
      diamond: true,
    },
  },
  {
    id: "priority-support",
    label: "Priority support",
    values: {
      bronze: false,
      silver: false,
      gold: false,
      diamond: true,
    },
  },
];

// ---------------------- B2B DATA ----------------------

const B2B_PLANS: B2BPlan[] = [
  {
    id: "gold-support",
    name: "Gold Support",
    tag: "B2B – mentoring model",
    subtitle: "You mentor, we power your workflow",
    priceNote: "Custom per agency • billed monthly",
    description:
      "Ideal for agencies and consultants who guide applicants closely but want them involved in the process. You provide the human mentorship; Profejoo provides AI tools, data and structure.",
    highlights: [
      "Everything included in Diamond (B2C) for your internal team",
      "Your consultants mentor each applicant through every step",
      "Access to our CRM to track leads, clients and application stages",
      "Exclusive insights & metadata to keep your agency ahead of competitors",
      "Shared best-practice playbooks for email, SOP and CV workflows",
    ],
  },
  {
    id: "diamond-support",
    name: "Diamond Support",
    tag: "B2B – done-for-you",
    subtitle: "Full done-for-you application service",
    priceNote: "Custom high-touch engagement",
    description:
      "For agencies that offer a complete, done-for-you service. Your team handles writing, sending and managing every application while using Profejoo as the intelligence and tracking layer.",
    highlights: [
      "Everything in Gold Support",
      "Your team writes and sends SOP, CV and emails for each client",
      "Deep CRM usage with custom fields and status pipelines",
      "Priority access to new stats modules and experimental features",
      "Dedicated success manager & priority support channel",
    ],
  },
];

// ---------------------- Helpers ----------------------

function renderFeatureValue(value: boolean | string | undefined) {
  if (value === true) {
    return (
      <span
        className="
          inline-flex h-7 w-7 items-center justify-center
          rounded-full border border-[var(--primary-100)]
          bg-[var(--primary-50)] text-[var(--primary-700)]
          text-xs font-semibold
          shadow-[0_0_0_1px_rgba(15,23,42,0.03)]
        "
      >
        ✓
      </span>
    );
  }
  if (value === false || value === undefined) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-xs font-semibold text-slate-300">
        –
      </span>
    );
  }
  return <span className="text-xs sm:text-sm text-slate-700">{value}</span>;
}

function scrollToId(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 80;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: "smooth" });
}

function getPlanToneClasses(id: B2CPlanId): string {
  switch (id) {
    case "bronze":
      return "bg-gradient-to-br from-white via-[color-mix(in_oklab,var(--accent-50)_25%,white)] to-white";
    case "silver":
      return "bg-gradient-to-br from-white via-[color-mix(in_oklab,var(--secondary-50)_25%,white)] to-white";
    case "gold":
      return "bg-gradient-to-br from-white via-[color-mix(in_oklab,var(--tertiary-50)_25%,white)] to-white";
    case "diamond":
      return "bg-gradient-to-br from-white via-[color-mix(in_oklab,var(--primary-50)_30%,white)] to-white";
    default:
      return "bg-card/95";
  }
}

function getPlanBulletDotClasses(id: B2CPlanId): string {
  switch (id) {
    case "bronze":
      return "bg-[var(--accent-600)]";
    case "silver":
      return "bg-[var(--secondary-500)]";
    case "gold":
      return "bg-[var(--tertiary-500)]";
    case "diamond":
      return "bg-[var(--primary-500)]";
    default:
      return "bg-[var(--primary-400)]";
  }
}

function getPlanPriceColor(id: B2CPlanId): string {
  switch (id) {
    case "bronze":
      return "text-[var(--accent-700)]";
    case "silver":
      return "text-[var(--secondary-600)]";
    case "gold":
      return "text-[var(--tertiary-600)]";
    case "diamond":
      return "text-[var(--primary-600)]";
    default:
      return "";
  }
}

// ---------------------- Page Component ----------------------

export default function SubscriptionPage() {
  const [open, setOpen] = useState<Record<OpenKeys, boolean>>({
    profile: false,
    plans: false,
    resources: false,
    favorites: false,
    history: false,
  });

  const toggleOne = (key: OpenKeys, state?: boolean) => {
    setOpen((prev) => ({
      ...prev,
      [key]: state !== undefined ? state : !prev[key],
    }));
  };

  const [billingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <main className="flex-1 w-full bg-gradient-to-b from-[color-mix(in_oklab,var(--primary-50)_30%,white)] via-white to-[color-mix(in_oklab,var(--secondary-50)_20%,white)] min-h-screen">
      <div className="flex flex-col">
        {/* 🔹 Floating navbar with the standard structure */}
        <div className="shrink-0 z-40 relative">
          <Navbar open={open} onToggleOne={toggleOne} />
        </div>

        <div className="px-4 flex w-full  flex-col gap-9 pb-4">
          {/* ---------- HERO ---------- */}
          <section
            className="
              relative overflow-hidden rounded-3xl border border-[var(--primary-100)]
              bg-gradient-to-br from-[var(--primary-50)]/20 via-white to-[var(--secondary-50)]/25
              px-4 py-6 shadow-[0_18px_45px_rgba(31,32,66,0.12)]
              md:px-8 md:py-8
            "
          >
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary-50)]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 right-0 h-44 w-44 rounded-full bg-[var(--secondary-50)]/30 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--primary-600)]">
                  Plans & pricing
                </p>
                <h1 className="fnt-h2 text-[var(--profejoo-primary)]">
                  Shape your{" "}
                  <span className="text-[var(--primary-800)]">
                    academic journey
                  </span>{" "}
                  with the right plan
                </h1>
                <p className="max-w-2xl text-sm md:text-base text-muted-foreground">
                  Start free with Bronze, grow with AI-powered writing and smart
                  matching, or partner with us as an agency. Profejoo follows
                  you from first search to final acceptance.
                </p>

                <div className="mt-2 inline-flex items-center gap-3 rounded-full bg-white/40 px-3 py-1.5 text-xs md:text-sm shadow-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      billingPeriod === "monthly"
                        ? "bg-[var(--primary-50)] text-[var(--primary-700)] shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Monthly billing
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">
                    Yearly discounts coming soon
                  </span>
                </div>
              </div>

              <div className="relative mt-3 flex flex-col gap-2 rounded-2xl bg-white/50 p-3 text-xs md:text-sm shadow-sm backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  View plans for
                </p>
                <div className="flex flex-col md:inline-flex md:flex-row gap-2 rounded-lg bg-slate-50 p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => scrollToId("b2c-section")}
                    className="btn btn--primary btn--sm h-8 flex-1 rounded-lg text-xs"
                  >
                    Individuals & students (B2C)
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToId("b2b-section")}
                    className="btn btn--outline-secondary btn--sm h-8 flex-1 rounded-lg text-xs"
                  >
                    Agencies & partners (B2B)
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Bronze is free for every logged-in user. Higher plans include
                  everything from lower ones.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- B2C PLANS ---------- */}
          <section id="b2c-section" className="space-y-5">
            <div className="space-y-2">
              <h2 className="fnt-h3">B2C · Individual plans</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                For students and applicants who want better search, AI documents, smart matching and mentoring.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 grid-cols-1">
              {B2C_PLANS.map((plan) => {
                const isPopular = plan.popular;
                const price = plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`;

                const badgeTone =
                  plan.badgeTone === "primary"
                    ? "bg-[var(--primary-50)] text-[var(--primary-400)]"
                    : plan.badgeTone === "accent"
                    ? "bg-[var(--accent-50)] text-[var(--accent-700)]"
                    : "bg-slate-100 text-slate-600";

                const ctaClass =
                  plan.id === "gold"
                    ? "btn btn--tertiary btn--md w-full justify-center"
                    : plan.id === "silver"
                    ? "btn btn--secondary btn--md w-full justify-center"
                    : plan.ctaVariant === "primary"
                    ? "btn btn--primary btn--md w-full justify-center"
                    : plan.ctaVariant === "outline"
                    ? "btn btn--outline-secondary btn--md w-full justify-center"
                    : "btn btn--ghost btn--md w-full justify-center";

                const toneClasses = getPlanToneClasses(plan.id);
                const priceColor = getPlanPriceColor(plan.id);
                const bulletDotClass = getPlanBulletDotClasses(plan.id);

                return (
                  <article
                    key={plan.id}
                    className={`
                      relative flex h-full min-h-[500px] flex-col rounded-3xl border p-4 md:p-5
                      shadow-sm transition-all duration-200
                      ${toneClasses}
                      ${
                        isPopular
                          ? "border-[var(--primary-400)] shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_20px_40px_rgba(15,23,42,0.18)] lg:-translate-y-1"
                          : "border-border hover:shadow-md"
                      }
                    `}
                  >
                    <div
                      className={`
                        absolute inset-x-4 top-0 h-1 rounded-b-full
                        ${plan.id === "bronze" && "bg-[var(--accent-700)]/80"}
                        ${plan.id === "silver" && "bg-[var(--secondary-400)]"}
                        ${plan.id === "gold" && "bg-[var(--tertiary-500)]"}
                        ${plan.id === "diamond" && "bg-[var(--primary-500)]"}
                      `}
                    />

                    <div className="mb-3 mt-2 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="fnt-h4">{plan.name}</h3>
                        <p className="text-xs font-medium text-muted-foreground">
                          {plan.subtitle}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {plan.badge && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${badgeTone}`}
                          >
                            {plan.badge}
                          </span>
                        )}
                        {isPopular && (
                          <span className="rounded-full bg-[var(--primary-50)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary-500)] whitespace-nowrap">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-extrabold ${priceColor}`}>
                          {price}
                        </span>
                        {plan.priceMonthly !== 0 && (
                          <span className="text-xs text-muted-foreground">
                            / month
                          </span>
                        )}
                      </div>
                      {plan.highlight && (
                        <p className={`mt-1 text-xs ${plan.id === 'bronze' ? 'text-[var(--accent-600)]' : plan.id === 'silver' ? 'text-[var(--secondary-600)]' : plan.id === 'gold' ? 'text-[var(--tertiary-600)]' : 'text-[var(--primary-600)]'}`}>
                          {plan.highlight}
                        </p>
                      )}
                    </div>

                    <ul className="mb-4 flex flex-1 flex-col gap-1.5 text-xs text-slate-700">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <span className={`mt-0.5 inline-flex h-3 w-3 flex-shrink-0 rounded-full ${bulletDotClass}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button className={ctaClass}>{plan.ctaLabel}</button>

                    {plan.id === "bronze" && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Automatically available to every logged-in user. No
                        credit card required.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            <section className="pb-4">
              <h3 className="fnt-h4 mb-3">Compare individual plans</h3>
              <p className="mb-4 text-xs md:text-sm text-muted-foreground">
                Higher plans always include everything from the lower ones.
              </p>
              <div className="overflow-x-auto rounded-3xl border bg-card/95 shadow-sm">
                <table className="min-w-full text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50/60">
                      <th className="px-4 py-3 font-semibold text-slate-600 min-w-[200px]">
                        Feature
                      </th>
                      {B2C_PLANS.map((plan) => (
                        <th
                          key={plan.id}
                          className="px-4 py-3 text-center font-semibold text-slate-700 min-w-[120px]"
                        >
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_ROWS.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b last:border-b-0 odd:bg-white even:bg-slate-50/30"
                      >
                        <td className="px-4 py-3 align-top text-slate-700">
                          <div className="font-medium">{row.label}</div>
                          {row.description && (
                            <div className="text-[11px] text-muted-foreground">
                              {row.description}
                            </div>
                          )}
                        </td>
                        {B2C_PLANS.map((plan) => (
                          <td
                            key={plan.id}
                            className="px-4 py-3 text-center align-middle"
                          >
                            {renderFeatureValue(row.values[plan.id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          {/* ---------- B2B SECTION ---------- */}
          <section id="b2b-section" className="space-y-4 pb-8">
            <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="fnt-h3">B2B · Support plans for agencies</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Built for immigration agencies, education consultants and
                  partners who manage many applicants.
                </p>
              </div>
            </header>

            <div className="grid gap-5 md:grid-cols-2">
              {B2B_PLANS.map((plan) => {
                const isDiamond = plan.id === "diamond-support";

                return (
                  <article
                    key={plan.id}
                    className={
                      isDiamond
                        ? "relative overflow-hidden rounded-3xl border border-[var(--primary-400)] bg-gradient-to-br from-[var(--primary-600)] via-[var(--primary-500)] to-[var(--primary-700)] p-5 text-slate-50 shadow-[0_20px_45px_rgba(31,32,66,0.5)] md:p-7"
                        : "relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-white via-[color-mix(in_oklab,var(--accent-50)_25%,white)] to-white p-5 shadow-sm md:p-6"
                    }
                  >
                    {isDiamond ? (
                      <>
                        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[var(--secondary-400)]/15 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 right-0 h-40 w-40 rounded-full bg-[var(--tertiary-400)]/12 blur-3xl" />
                      </>
                    ) : null}

                    <div className="relative space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={
                              "text-[11px] font-semibold uppercase tracking-[0.2em] " +
                              (isDiamond
                                ? "text-[var(--secondary-100)]"
                                : "text-[var(--accent-600)]")
                            }
                          >
                            {plan.tag}
                          </p>
                          <h3
                            className={
                              "fnt-h3 " + (isDiamond ? "text-white" : "")
                            }
                          >
                            {plan.name}
                          </h3>
                          <p
                            className={
                              "text-xs font-medium " +
                              (isDiamond
                                ? "text-slate-100/90"
                                : "text-slate-600")
                            }
                          >
                            {plan.subtitle}
                          </p>
                        </div>
                      </div>

                      <p
                        className={
                          "text-sm " +
                          (isDiamond
                            ? "text-slate-100/90"
                            : "text-slate-700")
                        }
                      >
                        {plan.description}
                      </p>

                      <p
                        className={
                          "text-xs font-semibold " +
                          (isDiamond ? "text-[var(--secondary-100)]" : "text-[var(--accent-600)]")
                        }
                      >
                        {plan.priceNote}
                      </p>

                      <ul className="mt-3 flex flex-col gap-2 text-xs">
                        {plan.highlights.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span
                              className={
                                "mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold " +
                                (isDiamond
                                  ? "bg-[var(--secondary-400)] text-[var(--primary-700)]"
                                  : "bg-[var(--secondary-50)] text-[var(--secondary-600)]")
                              }
                            >
                              ★
                            </span>
                            <span
                              className={
                                isDiamond
                                  ? "text-slate-100/95"
                                  : "text-slate-700"
                              }
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          className={
                            isDiamond
                              ? "btn btn--accent btn--md"
                              : "btn btn--tertiary btn--md"
                          }
                        >
                          Contact sales
                        </button>
                        <button
                          className={
                            isDiamond
                              ? "btn btn--outline-secondary btn--md border-white/70 text-white hover:bg-white/10"
                              : "btn btn--outline-secondary btn--md"
                          }
                          type="button"
                          onClick={() => scrollToId("b2c-section")}
                        >
                          View B2C plans
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}