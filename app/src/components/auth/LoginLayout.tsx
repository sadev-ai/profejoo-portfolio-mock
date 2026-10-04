import { PropsWithChildren } from "react";
import "@/components/auth/LoginLayout.css";

export default function LoginLayout({ children }: PropsWithChildren) {
  return (
    <div className="w-full min-h-dvh bg-muted/20 flex items-center login-container">
      {/* Card column (all sizes) */}
      <div className="flex flex-col items-center xl:w-1/2 md:w-full gap-10">
        <header className="px-8 pt-10 pb-6 flex items-center justify-center">
            <a href="/">
              <picture className="w-8/12 mx-auto">
                <source media="(max-width: 80rem)" srcSet="/assets/images/Logo-responsive.svg" />
                <img
                  src="/assets/images/Logo.svg"
                  alt="Profejoo"
                  className="w-full"
                />
              </picture>
            </a>
        </header>

        <main className="flex px-6 items-center justify-center w-10/12">
          {children}
        </main>

      </div>

      {/* Hero column: hidden on mobile/tablet, shown from xl breakpoint up */}
      <div
        className="login-hero h-screen invisible w-0 xl:visible xl:w-1/2"
        aria-hidden="true"
      />
    </div>
  );
}
