"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useEffect, useState } from "react"

const Toaster = (props: any) => {
  const { theme = "system" } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show Toaster after client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Sonner
      theme={theme}
      className="toaster group z-[9999] font-default"
      {...props}
    />
  )
}

export { Toaster }
