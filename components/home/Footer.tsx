//can delete not in use anymore

"use client";

import useLoginSession from "@/lib/useLoginSession";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { tools } from "@/lib/toolsConfig";
import { useUserRole } from "@/hooks/useUserRole"; // Use the simpler role hook
import { useTheme } from "@/app/provider";
import { useMemo } from "react";

const socialLinks = [
  { icon: <FaInstagram className="size-5" />, href: 'https://instagram.com/YourPage', label: 'Instagram' },
  { icon: <FaTiktok className="size-5" />, href: 'https://tiktok.com/@YourPage', label: 'TikTok' },
  { icon: <FaYoutube className="size-5" />, href: 'https://youtube.com/YourPage', label: 'YouTube' },
  { icon: <FaLinkedinIn className="size-5" />, href: 'https://linkedin.com/company/YourPage', label: 'LinkedIn' },
];

const Footer: React.FC = () => {
  const session = useLoginSession();
  const { themeType } = useTheme();
  
  // ✅ Use the simpler useUserRole hook instead of useHallMonitor
  // This avoids the database schema issues in HallMonitorFactory
  const { role, isLoading, error } = useUserRole(session?.user?.id);

  console.log('[Footer] Session state:', { 
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id 
  });

  console.log('[Footer] UserRole state:', { 
    role, 
    isLoading, 
    error
  });

  // ✅ Memoize the user section data based on role
  const userSectionData = useMemo(() => {
    // No session = no user sections
    if (!session?.user?.id) {
      console.log('[Footer] No user session, returning null');
      return null;
    }

    // Loading state
    if (isLoading) {
      console.log('[Footer] Still loading user data');
      return {
        sectionTitle: "Loading...",
        dashboardText: "Loading Dashboard...",
        dashboardHref: "/dashboard/me"
      };
    }

    // Error or no role
    if (error || !role) {
      console.log('[Footer] Error or no role:', { error, role });
      return {
        sectionTitle: "For Users",
        dashboardText: "Dashboard",
        dashboardHref: "/dashboard/me"
      };
    }

    console.log('[Footer] ✅ Role loaded successfully:', role);

    // Return role-specific data using role name from useUserRole
    switch (role) {
      case 'admin':
        return {
          sectionTitle: "For Admins",
          dashboardText: "Admin Dashboard",
          dashboardHref: "/dashboard/me"
        };
      case 'jobcoach':
        return {
          sectionTitle: "For Job Coaches", 
          dashboardText: "Coach Dashboard",
          dashboardHref: "/dashboard/me"
        };
      case 'client':
        return {
          sectionTitle: "For Clients",
          dashboardText: "Client Dashboard", 
          dashboardHref: "/dashboard/me"
        };
      case 'user':
        return {
          sectionTitle: "For Users",
          dashboardText: "User Dashboard",
          dashboardHref: "/dashboard/me"
        };
      default:
        console.log('[Footer] Unknown role, using default:', role);
        return {
          sectionTitle: "For Users",
          dashboardText: "Dashboard",
          dashboardHref: "/dashboard/me"
        };
    }
  }, [session?.user?.id, isLoading, error, role]); // ✅ Proper dependencies

  // ✅ Define sections based on user session and data
  const getSections = useMemo(() => {
    const baseSections = [
      {
        title: "Resources",
        links: [
          { name: "Help Center", href: "/help" },
          { name: "Contact Us", href: "/contact" },
          { name: "About DART", href: "/about" },
          { name: "Career Services", href: "/services" },
        ],
      },
    ];

    // ✅ Only show user sections when logged in AND we have role data
    if (session?.user?.id && userSectionData && userSectionData.sectionTitle !== "Loading...") {
      console.log('[Footer] Building sections with user data:', userSectionData);
      
      return [
        {
          title: userSectionData.sectionTitle,
          links: [
            { name: "CMS App", href: "/CMS" },
            { name: userSectionData.dashboardText, href: userSectionData.dashboardHref },
          ],
        },
        {
          title: "Tools",
          links: tools.map(({ name, path }) => ({ name, href: path })),
        },
        ...baseSections,
      ];
    }

    console.log('[Footer] No user data or still loading, returning base sections only');
    return baseSections;
  }, [session?.user?.id, userSectionData]);

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  console.log('[footer] Final render state:', {
    hasSession: !!session,
    hasUserData: !!userSectionData,
    sectionsCount: getSections.length,
    userSectionData,
    isLoading,
    role
  });

  return (
    <section className="py-16 bg-[var(--background)] text-[var(--foreground)] border-t border-gray-200">
      <div className="container max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          {/* Logo and Description Section */}
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-3 lg:justify-start">
              <div className="flex items-center">
                <img
                  src={
                    themeType === "dark"
                      ? "/images/home/dartlogowhite.svg"
                      : "/images/home/dartlogo.svg"
                  }
                  alt="DART Logo"
                  className="h-12 w-auto"
                />
              </div>
            </div>
            
            {/* Description */}
            <p className="max-w-[70%] text-sm text-muted-foreground">
              Desert Area Resources and Training - Empowering individuals through comprehensive career services and job training programs.
            </p>
            
            {/* Social Links */}
            <ul className="flex items-center space-x-6 text-muted-foreground">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-primary transition-colors">
                  <a 
                    href={social.href} 
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Sections */}
          <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {getSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-[var(--foreground)]">{section.title}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      <Link href={link.href} className="hover:underline">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Copyright and Legal Links */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-gray-200 py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">
            © {new Date().getFullYear()} Desert Area Resources and Training (DART). All rights reserved.
          </p>
          <ul className="order-1 flex flex-col gap-4 md:order-2 md:flex-row md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary transition-colors">
                <Link href={link.href} className="hover:underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Footer;