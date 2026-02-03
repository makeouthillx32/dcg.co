// This script runs outside of React to fix iOS Chromium status bar issues
;(() => {
  // Only run in browsers
  if (typeof window === "undefined" || typeof document === "undefined") return

  // Check if we're on iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  if (!isIOS) return

  // Function to sync theme color to iOS meta tags
  function syncThemeColor() {
    // Get the current theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (!themeColorMeta) return

    const color = themeColorMeta.getAttribute("content")
    if (!color) return

    // Update iOS-specific meta tags
    const iosMeta = document.querySelector('meta[name="theme-color-ios"]') || document.createElement("meta")
    iosMeta.name = "theme-color-ios"
    iosMeta.content = color

    if (!iosMeta.parentNode) {
      document.head.appendChild(iosMeta)
    }

    // Also update apple-specific meta tags
    const appleMeta =
      document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') || document.createElement("meta")
    appleMeta.name = "apple-mobile-web-app-status-bar-style"
    appleMeta.content = "black-translucent" // This forces iOS to use our color

    if (!appleMeta.parentNode) {
      document.head.appendChild(appleMeta)
    }
  }

  // Run once on load
  syncThemeColor()

  // Set up a MutationObserver to watch for theme color changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "content" &&
        mutation.target.getAttribute("name") === "theme-color"
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
})()
