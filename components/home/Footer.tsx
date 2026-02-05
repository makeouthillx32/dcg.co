// can delete not in use anymore
"use client";

import useLoginSession from "@/lib/useLoginSession";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { tools } from "@/lib/toolsConfig";
import { useUserRole } from "@/hooks/useUserRole";
import { useTheme } from "@/app/provider";
import { useMemo } from "react";

const socialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "https://instagram.com/YourPage", label: "Instagram" },
  { icon: <FaTiktok className="size-5" />, href: "https://tiktok.com/@YourPage", label: "TikTok" },
  { icon: <FaYoutube className="size-5" />, href: "https://youtube.com/YourPage", label: "YouTube" },
  { icon: <FaLinkedinIn className="size-5" />, href: "https://linkedin.com/company/YourPage", label: "LinkedIn" },
];

const Footer: React.FC = () => {
  const session = useLoginSession();
  const { themeType } = useTheme();

  // Kept (per your request) but not used for storefront footer logic
  const { role, isLoading, error } = useUserRole(session?.user?.id);

  // Shopify-style link groups
  const footerSections = useMemo(() => {
    return [
      {
        title: "Shop",
        links: [
          { name: "New Arrivals", href: "/collections/new" },
          { name: "Best Sellers", href: "/collections/best-sellers" },
          { name: "Shop All", href: "/collections/all" },
          { name: "Sale", href: "/collections/sale" },
        ],
      },
      {
        title: "Customer Care",
        links: [
          { name: "Contact", href: "/contact" },
          { name: "Shipping", href: "/policies/shipping" },
          { name: "Returns", href: "/policies/returns" },
          { name: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "About",
        links: [
          { name: "Our Story", href: "/about" },
          { name: "Size Guide", href: "/size-guide" },
          { name: "Store Policies", href: "/policies" },
        ],
      },
      {
        title: "Account",
        links: session
          ? [
              { name: "My Account", href: "/account" },
              { name: "Orders", href: "/account/orders" },
              { name: "Log Out", href: "/auth/logout" },
            ]
          : [
              { name: "Sign In", href: "/sign-in" },
              { name: "Create Account", href: "/sign-up" },
              { name: "Track Order", href: "/track" },
            ],
      },
    ];
  }, [session]);

  const legalLinks = [
    { name: "Privacy Policy", href: "/policies/privacy" },
    { name: "Terms", href: "/policies/terms" },
  ];

  return (
    <footer className="bg-[var(--background)] text-[var(--foreground)] border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Top */}
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src={themeType === "dark" ? "/images/home/dartlogowhite.svg" : "/images/home/dartlogo.svg"}
                alt="Brand Logo"
                className="h-10 w-auto"
              />
            </div>

            <p className="mt-4 text-sm text-[var(--muted-foreground)] max-w-sm">
              Boutique-inspired styles with a desert edge—made for everyday wear, comfort, and confidence.
            </p>

            {/* Social */}
            <ul className="mt-5 flex items-center gap-4 text-[var(--muted-foreground)]">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="transition-colors hover:text-[var(--foreground)]">
                  <a
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full p-2 hover:bg-[var(--accent)] transition-colors"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 md:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
            {footerSections.map((section, idx) => (
              <div key={idx}>
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--foreground)]">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="hover:text-[var(--foreground)] transition-colors">
                      <Link href={link.href} className="hover:underline underline-offset-4">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter (very Shopify) */}
          <div className="md:col-span-2 lg:col-span-5 border-t border-[var(--border)] pt-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Get updates</h4>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  New drops, restocks, and exclusive offers—no spam.
                </p>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95 transition-opacity"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 border-t border-[var(--border)] py-8 text-xs text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} DesertCowgirl. All rights reserved.
          </p>

          <ul className="flex flex-col gap-3 md:flex-row md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-[var(--foreground)] transition-colors">
                <Link href={link.href} className="hover:underline underline-offset-4">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
