// src/components/footer/FooterBottom.tsx

export default function FooterBottom({bgClass="bg-(--tertiary-900)"}:{bgClass?: string}) {
  return (
    <div className={`w-full ${bgClass} text-gray-400 text-sm`}>
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-10 lg:px-16 py-4 gap-4">
        
        <span>©2025 SADism Profejoo. All rights reserved.</span>

        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition">Terms of Service</a>
          <a href="/cookies" className="hover:text-white transition">Cookie Policy</a>
        </div>

      </div>
    </div>
  );
}
