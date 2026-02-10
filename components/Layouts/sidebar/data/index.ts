"use client";

import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Messages",
        url: "/messages",
        icon: Icons.MessageIcon,
        items: [],
      },
      {
        title: "Admin",
        icon: Icons.SettingsIcon,
        items: [
          {
            title: "Members",
            url: "/settings/members",
            icon: Icons.User,
          },

          // ───────── Store Management ─────────
          {
            title: "Products",
            url: "/settings/products",
            icon: Icons.Authentication,
          },
          {
            title: "Categories",
            url: "/settings/categories",
            icon: Icons.Table,
          },
          {
            title: "Collections",
            url: "/settings/collections",
            icon: Icons.FourCircle, // ✅ safe replacement
          },
          {
            title: "Tags / Subcategories",
            url: "/settings/tags",
            icon: Icons.Alphabet,
          },

          // ───────── Marketing ─────────
          {
            title: "Banners",
            url: "/settings/top-banner",
            icon: Icons.FourCircle, // ✅ Image icon removed
          },
          {
            title: "Discounts",
            url: "/settings/discounts",
            icon: Icons.Table,
          },

          // ───────── Operations ─────────
          {
            title: "Inventory",
            url: "/settings/inventory",
            icon: Icons.Table,
          },

          // ───────── System ─────────
          {
            title: "Invites",
            url: "/settings/invites",
            icon: Icons.Table,
          },
          {
            title: "Permissions",
            url: "/settings/permissions",
            icon: Icons.Authentication,
          },
          {
            title: "Theme Maker",
            url: "/settings/thememaker",
            icon: Icons.SettingsIcon,
          },

          // ───────── Dev / Seed (optional) ─────────
          {
            title: "Seed Data",
            url: "/settings/seed",
            icon: Icons.Alphabet,
          },
        ],
      },
    ],
  },

  {
    label: "DEVELOPMENT",
    items: [
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
        ],
      },
      {
        title: "Tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/tables",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/ui-elements/buttons",
          },
        ],
      },
    ],
  },
];
