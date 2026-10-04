// src/components/footer/FooterSocials.tsx
import { Instagram, Phone, Linkedin, Send } from "lucide-react";

const socials = [
  { href: "https://www.instagram.com/", icon: <Instagram size={22} /> },
  { href: "https://www.whatsapp.com/", icon: <Phone size={22} /> },
  { href: "https://www.linkedin.com/", icon: <Linkedin size={22} /> },
  { href: "https://telegram.org/", icon: <Send size={22} /> },
];

export default function FooterSocials() {
  return (
    <div className="flex flex-col justify-end">
      <h2 className="text-xl font-semibold mb-4">Follow Us</h2>

      <div className="flex gap-4">
        {socials.map((s, idx) => (
          <a
            key={idx}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition"
          >
            {s.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
