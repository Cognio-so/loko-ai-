import Link from "next/link";
import { MessageCircle, Briefcase, Share2, Globe } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Affiliate Program", href: "/affiliate" },
        { label: "Careers", href: "/careers" },
      ]
    },
    {
      title: "Product",
      links: [
        { label: "Enterprise", href: "#" },
        { label: "Roadmap", href: "#" },
        { label: "Changelog", href: "#" },
        { label: "Superagents", href: "#" },
        { label: "AI App Builder", href: "#" },
        { label: "AI Website Builder", href: "#" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Docs & FAQs", href: "#" },
        { label: "Higher Ed", href: "#" },
        { label: "Community", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Hire a Partner", href: "/partners" },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Security", href: "#" },
        { label: "Accessibility Statement", href: "#" },
      ]
    }
  ];

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 font-sans selection:bg-sky-100 dark:selection:bg-sky-500/30 selection:text-sky-900 dark:selection:text-sky-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-20">
          {/* Logo & Brand Info */}
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                 <Globe className="h-5 w-5 text-white" />
               </div>
               <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LokoAI</span>
            </Link>
            <p className="text-sm leading-7 text-slate-500 dark:text-gray-400 max-w-sm">
              LokoAI is the AI-powered platform that lets users build fully functioning apps in minutes. Using nothing but natural language, LokoAI enables anyone to turn their words into productivity apps, back-office tools, customer portals, or complete enterprise products that are ready to use - no integrations required.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 xl:col-span-2 xl:mt-0">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-8">{section.title}</h3>
                <ul role="list" className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="text-sm font-medium text-slate-500 dark:text-gray-400 transition-all hover:text-sky-600 dark:hover:text-sky-400 hover:translate-x-1 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-slate-50 dark:border-white/5 pt-8 md:mt-20 md:flex-row md:gap-8 md:pt-10">
          {/* Copyright */}
          <p className="text-xs font-medium text-slate-400 dark:text-gray-500 order-3 md:order-1">
            © {new Date().getFullYear()} LokoAI Inc. All rights reserved.
          </p>

          {/* Social Icons (Left/Center as requested) */}
          <div className="flex items-center gap-6 order-1 md:order-2">
            {[
              { icon: MessageCircle, href: "#" },
              { icon: Briefcase, href: "#" },
              { icon: Share2, href: "#" },
            ].map((social, i) => (
              <Link 
                key={i} 
                href={social.href} 
                className="group flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 transition-all hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400"
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>

          {/* Status Indicator (Right as requested) */}
          <div className="flex items-center gap-3 order-2 md:order-3">
             <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </div>
             <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">
               Systems Operational
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}


