"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // After mounting, we can render the children
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Force light theme until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="light">{children}</div>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

