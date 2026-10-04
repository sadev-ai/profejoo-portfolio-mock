// src/components/dashboard/PlanCard.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "./DashboardCard";
import { ROUTES } from "@/constants/routes";

export type PlanCardProps = {
  planName: string;
  daysLeft: number | null;
  pricePerMonth: number;
};

export function PlanCard({ planName, daysLeft, pricePerMonth }: PlanCardProps) {
  const navigate = useNavigate();
  const isFree = planName.toLowerCase() === 'free' || pricePerMonth === 0;
  const cardTitle = isFree ? "Free Plan" : `${planName} Plan`;
  
  const handlePlanClick = () => {
    navigate(ROUTES.DASHBOARD_PLANS);
  };
  
  return (
    <DashboardCard title={cardTitle} >
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between text-sm md:text-base">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Your Current Subscription
            </span>
            <span className="font-semibold text-foreground">{planName}</span>
          </div>

          {!isFree && (
            <div className="flex items-center gap-6">
              {daysLeft !== null && (
                <div className="text-right">
                  <span className="block text-xs text-muted-foreground">
                    days left
                  </span>
                  <span className="text-lg font-bold text-primary-400">
                    {daysLeft}
                  </span>
                </div>
              )}
              <div className="text-right">
                <span className="block text-xs text-muted-foreground">
                  Per Month
                </span>
                <span className="text-lg font-bold text-accent-400">
                  ${pricePerMonth}
                </span>
              </div>
            </div>
          )}
        </div>

        <button 
          className="btn btn--outline-secondary btn--md w-full justify-center mt-1"
          onClick={handlePlanClick}
        >
          {isFree ? 'Upgrade Plan' : 'Manage Subscription'}
        </button>
      </div>
    </DashboardCard>
  );
}
