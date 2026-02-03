"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

interface ThemeColorHandlerProps {
  isDarkMode: boolean
}

export function ThemeColorHandler({ isDarkMode }: ThemeColorHandlerProps) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    // Simple function to update theme color without side effects
    const updateThemeColor = () => {
      if (typeof window === "undefined") return

      // Get the computed color based on the current theme and page
      const computedStyle = getComputedStyle(document.documentElement)
      let color: string

      if (isHome) {
        color = isDarkMode
          ? computedStyle.getPropertyValue("--background")?.trim() || "#2d3142"
          : computedStyle.getPropertyValue("--background")?.trim() || "#ffffff"
      } else {
        color = isDarkMode
          ? computedStyle.getPropertyValue("--muted")?.trim() || "#111827"
          : computedStyle.getPropertyValue("--muted")?.trim() || "#f9fafb"
      }

      // Update the existing meta tag
      const metaTag = document.querySelector("meta[name='theme-color']")
      if (metaTag) {
        metaTag.setAttribute("content", color)
      }

      // iOS Chromium fix - just add a second meta tag with a different name
      let chromiumFix = document.querySelector("meta[name='theme-color-ios']")
      if (!chromiumFix) {
        chromiumFix = document.createElement("meta")
        chromiumFix.setAttribute("name", "theme-color-ios")
        document.head.appendChild(chromiumFix)
      }
      chromiumFix.setAttribute("content", color)
    }

    // Run once on mount
    updateThemeColor()

    // Also run after a short delay to ensure styles are fully loaded
    const timeoutId = setTimeout(updateThemeColor, 100)

    return () => clearTimeout(timeoutId)
  }, [isDarkMode, isHome])

  return null
}
