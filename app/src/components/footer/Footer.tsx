// src/components/footer/Footer.tsx
import FooterBrand from "@/components/footer/FooterBrand";
import FooterLinks from "@/components/footer/FooterLinks";
import FooterSocials from "@/components/footer/FooterSocials";
import FooterBottom from "@/components/footer/FooterBottom";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center w-full bg-(--tertiary-800) text-white">
      <div className="w-full flex flex-col md:flex-row justify-between px-6 md:px-10 lg:px-16 py-10 gap-10">
        <div className="flex flex-col md:flex-row justify-start gap-10">
          <FooterBrand />
          <FooterLinks />
        </div>
        <FooterSocials />

      </div>

      <FooterBottom />
    </footer>
  );
}
