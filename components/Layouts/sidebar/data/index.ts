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
        roles: ["admin", "jobcoach"],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
        roles: ["admin", "jobcoach", "client"],
      },
      // Calendar Planner removed as not needed
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
        roles: ["admin", "jobcoach", "client"],
      },
      {
        title: "Messages",
        url: "/messages",
        icon: Icons.MessageIcon,
        items: [],  // No dropdown, Chats is the main messages URL
        roles: ["admin", "jobcoach", "client"],
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
          {
            title: "Roles",
            url: "/settings/roles",
            icon: Icons.Authentication,
          },
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
          },
        ],
        roles: ["admin"],
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
        roles: ["admin"],
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
        roles: ["admin"],
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
        roles: ["admin"],
      },
    ],
  },
];