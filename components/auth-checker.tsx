"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"

export default function AuthChecker() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [authContextReady, setAuthContextReady] = useState(false)

  useEffect(() => {
    try {
      const auth = useAuth()
      setUser(auth.user)
      setAuthContextReady(true)
    } catch (error) {
      console.error("Error accessing auth context:", error)
      setAuthContextReady(false)
    }
  }, [])

  useEffect(() => {
    if (authContextReady && user) {
      router.push("/dashboard")
    }
  }, [authContextReady, user, router])

  return null
}

