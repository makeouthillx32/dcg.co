"use client"

import { useEffect } from "react"

// This component only focuses on fixing the iOS Chromium status bar
// without affecting page rendering
export function IOSStatusBarFix() {
  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return

    // Function to detect iOS Chromium browsers
    const isIOSChromium = () => {
      const ua = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      const isChromium = /CriOS|EdgiOS/.test(ua) || (isIOS && /FxiOS|OPiOS|Mercury/.test(ua))
      return isIOS && isChromium
    }

    // Only apply fixes if we're on iOS Chromium
    if (!isIOSChromium()) return

    // Create a function to sync the theme-color
    const syncThemeColor = () => {
      // Get the current theme-color value
      const mainMetaTag = document.querySelector('meta[name="theme-color"]')
      if (!mainMetaTag) return

      const currentColor = mainMetaTag.getAttribute("content")
      if (!currentColor) return

      // Create or update the iOS-specific meta tags
      const tags = [
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        // This is our special duplicate tag that helps iOS Chromium
        { name: "theme-color-ios", content: currentColor },
      ]

      tags.forEach(({ name, content }) => {
        let tag = document.querySelector(`meta[name="${name}"]`)
        if (!tag) {
          tag = document.createElement("meta")
          tag.setAttribute("name", name)
          document.head.appendChild(tag)
        }
        tag.setAttribute("content", content)
      })
    }

    // Run once on mount
    syncThemeColor()

    // Set up a mutation observer to watch for changes to the theme-color meta tag
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "content" &&
          (mutation.target as Element).getAttribute("name") === "theme-color"
        ) {
          syncThemeColor()
        }
      })
    })

    // Start observing the theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      observer.observe(themeColorMeta, { attributes: true })
    }

    // Clean up
    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
