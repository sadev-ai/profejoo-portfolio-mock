import { PropsWithChildren, type CSSProperties } from "react";
import "@/components/auth/SignupLayout.css";
import { publicAsset } from "@/lib/publicAsset";
export default function SignupLayout({ children }: PropsWithChildren) {
  const assetStyles = {
    "--login-hero-image": `url("${publicAsset("assets/images/login-hero.png")}")`,
    "--login-hero-mobile-image": `url("${publicAsset("assets/images/login-hero-resposive.png")}")`,
  } as CSSProperties;

  return (
    <div className=" bg-muted/20 flex items-center login-container" style={assetStyles}>
      <div
        className="login-hero h-screen invisible w-0 xl:visible xl:w-1/2"
        aria-hidden="true"
      />
      <div className="flex flex-col h-fit items-center xl:w-1/2 md:w-full">
        <header className="pb-2 flex items-center justify-center">
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

        <main className="flex items-center justify-center w-10/12">
          {children}
        </main>

        <footer className="h-6" />
      </div>


    </div>
  );
}
