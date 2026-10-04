import { PropsWithChildren } from "react";
import "@/components/auth/SignupLayout.css";
export default function SignupLayout({ children }: PropsWithChildren) {
  return (
    <div className=" bg-muted/20 flex items-center login-container">
      <div
        className="login-hero h-screen invisible w-0 xl:visible xl:w-1/2"
        aria-hidden="true"
      />
      <div className="flex flex-col h-fit items-center xl:w-1/2 md:w-full">
        <header className="pb-2 flex items-center justify-center">
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

        <main className="flex items-center justify-center w-10/12">
          {children}
        </main>

        <footer className="h-6" />
      </div>


    </div>
  );
}
