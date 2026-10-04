import { PropsWithChildren, type CSSProperties } from "react";
import "@/components/auth/LoginLayout.css";
import { publicAsset } from "@/lib/publicAsset";

export default function LoginLayout({ children }: PropsWithChildren) {
  const assetStyles = {
    "--login-hero-image": `url("${publicAsset("assets/images/login-hero.png")}")`,
    "--login-hero-mobile-image": `url("${publicAsset("assets/images/login-hero-resposive.png")}")`,
  } as CSSProperties;

  return (
    <div className="w-full min-h-dvh bg-muted/20 flex items-center login-container" style={assetStyles}>
      {/* Card column (all sizes) */}
      <div className="flex flex-col items-center xl:w-1/2 md:w-full gap-10">
        <header className="px-8 pt-10 pb-6 flex items-center justify-center">
            <a href={import.meta.env.BASE_URL}>
              <picture className="w-8/12 mx-auto">
                <source media="(max-width: 80rem)" srcSet={publicAsset("assets/images/Logo-responsive.svg")} />
                <img
                  src={publicAsset("assets/images/Logo.svg")}
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
