"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa";

import useLoginSession from "@/lib/useLoginSession";
import { useTheme } from "@/app/provider";
import { userRoleCookies } from "@/lib/cookieUtils";

type FooterLink = { name: string; href: string; external?: boolean };
type FooterSection = { title: string; links: FooterLink[] };

const socialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "https://instagram.com/YourPage", label: "Instagram" },
  { icon: <FaTiktok className="size-5" />, href: "https://tiktok.com/@YourPage", label: "TikTok" },
];

export default function Footer() {
  const session = useLoginSession();
  const { themeType } = useTheme();

  const userId = session?.user?.id;
  const cookieRole = userRoleCookies.getUserRole(userId) ?? "guest";

  const isSignedIn = !!userId;
  const role =
    isSignedIn && (cookieRole === "owner" || cookieRole === "admin" || cookieRole === "shopper")
      ? cookieRole
      : "guest";

  const isMember = role === "shopper" || role === "admin" || role === "owner";
  const isOwnerOrAdmin = role === "owner" || role === "admin";

  const sections: FooterSection[] = useMemo(() => {
    // ✅ Always visible (Shopify-ish baseline)
    const base: FooterSection[] = [
      {
        title: "Shop",
        links: [
          { name: "New Releases", href: "/new-releases" },
          { name: "Restocks", href: "/restocks" },
          { name: "Best Sellers", href: "#best-sellers" }, // Hash for pageTree
          { name: "Gift Card", href: "#gift-card" }, // Hash for pageTree
        ],
      },
      {
        title: "Customer Care",
        links: [
          { name: "Contact", href: "/contact" },
          { name: "Shipping", href: "/shipping" },
          { name: "Returns", href: "/returns" },
          { name: "Size Guide", href: "/size-guide" },
        ],
      },
      {
        title: "About",
        links: [
          { name: "Our Story", href: "#about" }, // ✅ Hash navigation for pageTree
          { name: "FAQs", href: "#faq" }, // ✅ Hash navigation for pageTree
          { name: "Privacy Policy", href: "#privacy" }, // ✅ Hash navigation for pageTree
          { name: "Terms", href: "#terms" }, // ✅ Hash navigation for pageTree
        ],
      },
    ];

    // ✅ Guests: keep it minimal + sign-in/up only
    if (!isMember) {
      return [
        {
          title: "Account",
          links: [
            { name: "Sign In", href: "/sign-in" },
            { name: "Join the Barn", href: "/sign-up" },
          ],
        },
        ...base,
      ];
    }

    // ✅ Members: add account links
    const member: FooterSection[] = [
      {
        title: "Your Account",
        links: [
          { name: "Account", href: "#account" }, // Hash for pageTree
          { name: "Orders", href: "/account/orders" },
          { name: "Saved", href: "/account/saved" },
          { name: "Sign Out", href: "/auth/logout" },
        ],
      },
      ...base,
    ];

    // ✅ Owner/Admin: add admin links
    if (isOwnerOrAdmin) {
      member.push({
        title: "Admin",
        links: [
          { name: "Dashboard", href: "/admin" },
          { name: "Products", href: "/admin/products" },
          { name: "Orders", href: "/admin/orders" },
        ],
      });
    }

    return member;
  }, [isMember, isOwnerOrAdmin]);

  return (
    <footer className="bg-[var(--background)] text-[var(--foreground)] border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-14">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img
                src={themeType === "dark" ? "/images/home/dartlogowhite.svg" : "/images/home/dartlogo.svg"}
                alt="Brand Logo"
                className="h-12 w-auto"
              />
            </div>

            <p className="max-w-[32rem] text-sm text-[var(--muted-foreground)]">
              Desert Cowgirl™ — western essentials, everyday staples, and drops worth waiting for.
            </p>

            {/* Member shoutout */}
            {isMember ? (
              <div className="inline-flex w-fit items-center rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                Thanks for joining the Barn.
              </div>
            ) : (
              <div className="inline-flex w-fit items-center rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                New here? <Link className="ml-1 underline underline-offset-2" href="/sign-up">Join the Barn</Link>
              </div>
            )}

            <ul className="flex items-center gap-4 text-[var(--muted-foreground)]">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--border)] p-2 hover:bg-[var(--card)] transition-colors"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--foreground)]">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                  {section.links.map((link) => (
                    <li key={link.name} className="hover:text-[var(--foreground)] transition-colors">
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {link.name}
                        </a>
                      ) : link.href.startsWith('#') ? (
                        // ✅ Use regular <a> for hash navigation (pageTree)
                        <a href={link.href} className="hover:underline">
                          {link.name}
                        </a>
                      ) : (
                        // ✅ Use Next.js Link for real routes
                        <Link href={link.href} className="hover:underline">
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Desert Cowgirl™. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {/* ✅ Hash navigation for footer legal links */}
            <a className="hover:underline" href="#privacy">Privacy</a>
            <a className="hover:underline" href="#terms">Terms</a>
            <Link className="hover:underline" href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}