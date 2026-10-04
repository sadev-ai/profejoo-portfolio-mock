// src/components/footer/FooterLinks.tsx
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const links = [
  { label: "Find Your Path To Apply", href: "/search" },
  { label: "Our Plans To Offer", href: ROUTES.DASHBOARD_PLANS },
  { label: "FAQs", href: ROUTES.FAQ },
  { label: "Contact Us", href: "/contact" },
];

export default function FooterLinks() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quick Links</h2>

      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="text-gray-300 hover:text-white transition"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
