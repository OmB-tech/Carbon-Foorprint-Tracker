"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth"
import { auth, firebaseInitialized } from "@/lib/firebase"
import { demoAuth } from "@/lib/demo-auth"

// Define the auth context type
type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  isDemoMode: boolean
  initialized: boolean
  isPreviewMode: boolean
}

// Create safer default values for the context
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  // Provide non-throwing placeholder functions that return rejected promises
  signUp: async () => Promise.reject(new Error("Auth context not initialized")),
  signIn: async () => Promise.reject(new Error("Auth context not initialized")),
  logout: async () => Promise.reject(new Error("Auth context not initialized")),
  resetPassword: async () => Promise.reject(new Error("Auth context not initialized")),
  isDemoMode: false,
  initialized: false,
  isPreviewMode: false,
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>(defaultAuthContext)

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext)
}

// Helper to detect if we're in a preview environment
const isPreviewEnvironment = () => {
  if (typeof window === "undefined") return false

  // Check for common preview environment indicators
  return (
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1") ||
    window.location.hostname.includes("preview")
  )
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Only initialize state on the client side
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state when component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)
    setIsPreviewMode(isPreviewEnvironment())
  }, [])

  // Force demo mode if we're in a preview environment
  const isDemoMode = !firebaseInitialized || isPreviewMode

  useEffect(() => {
    // Only run this effect in the browser and when mounted
    if (!isMounted) return

    console.log("Auth Provider initializing...", isDemoMode ? "(Demo Mode)" : "(Firebase Mode)")

    // Set up auth state listener
    let unsubscribe: () => void

    const setupAuth = async () => {
      try {
        if (isDemoMode) {
          console.log("Setting up demo auth listener")
          unsubscribe = demoAuth.onAuthStateChanged((demoUser) => {
            setUser(demoUser as unknown as User)
            setLoading(false)
            setInitialized(true)
          })
        } else if (auth) {
          console.log("Setting up Firebase auth listener")
          try {
            unsubscribe = onAuthStateChanged(
              auth,
              (firebaseUser) => {
                setUser(firebaseUser)
                setLoading(false)
                setInitialized(true)
              },
              (error) => {
                console.error("Firebase auth state change error:", error)
                // Fall back to demo mode on auth state error
                console.log("Falling back to demo mode due to Firebase error")
                setLoading(false)
                setInitialized(true)
              },
            )
          } catch (error) {
            console.error("Error setting up Firebase auth listener:", error)
            // Fall back to demo mode
            console.log("Falling back to demo mode due to Firebase error")
            unsubscribe = demoAuth.onAuthStateChanged((demoUser) => {
              setUser(demoUser as unknown as User)
              setLoading(false)
              setInitialized(true)
            })
          }
        } else {
          // Fallback if auth is somehow null
          console.log("No auth available, setting loading to false")
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error("Error setting up auth:", error)
        setLoading(false)
        setInitialized(true)
      }
    }

    setupAuth()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [isDemoMode, isMounted])

  // Separate functions for demo mode and Firebase auth
  const signUpWithDemo = async (email: string, password: string, name: string) => {
    if (!initialized) {
      return Promise.reject(new Error("Auth system not yet initialized"))
    }

    try {
      console.log("Creating user account with demo auth")
      const demoUser = await demoAuth.createUser(email, password, name)
      setUser(demoUser as unknown as User)
    } catch (error) {
      console.error("Demo signup failed:", error)
      throw error
    }
  }

  const signUpWithFirebase = async (email: string, password: string, name: string) => {
    if (!initialized) {
      return Promise.reject(new Error("Auth system not yet initialized"))
    }

    try {
      console.log("Creating Firebase user account")
      if (!auth) throw new Error("Authentication service is not available")

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      setUser(userCredential.user)
    } catch (error: any) {
      console.error("Firebase auth signup failed:", error)

      // If network error, try demo auth as fallback
      if (error.code === "auth/network-request-failed") {
        console.log("Network request failed, falling back to demo auth")
        return signUpWithDemo(email, password, name)
      }

      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    // Always use demo auth if in demo mode
    if (isDemoMode) {
      return signUpWithDemo(email, password, name)
    }

    // Otherwise try Firebase auth
    return signUpWithFirebase(email, password, name)
  }

  // Separate functions for demo mode and Firebase auth
  const signInWithDemo = async (email: string, password: string) => {
    if (!initialized) {
      return Promise.reject(new Error("Auth system not yet initialized"))
    }

    try {
      console.log("Signing in with demo auth")
      const demoUser = await demoAuth.signIn(email, password)
      setUser(demoUser as unknown as User)
    } catch (error) {
      console.error("Demo sign in failed:", error)
      throw error
    }
  }

  const signInWithFirebase = async (email: string, password: string) => {
    if (!initialized) {
      return Promise.reject(new Error("Auth system not yet initialized"))
    }

    try {
      console.log("Signing in with Firebase")
      if (!auth) throw new Error("Authentication service is not available")

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
    } catch (error: any) {
      console.error("Firebase auth signin failed:", error)

      // If network error, try demo auth as fallback
      if (error.code === "auth/network-request-failed") {
        console.log("Network request failed, falling back to demo auth")
        return signInWithDemo(email, password)
      }

      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    // Always use demo auth if in demo mode
    if (isDemoMode) {
      return signInWithDemo(email, password)
    }

    // Otherwise try Firebase auth with fallback to demo
    try {
      return await signInWithFirebase(email, password)
    } catch (error: any) {
      // For specific errors like network issues, try demo auth
      if (error.code === "auth/network-request-failed") {
        console.log("Network request failed, falling back to demo auth")
        return signInWithDemo(email, password)
      }
      throw error
    }
  }

  const logout = async () => {
    if (!initialized) {
      return Promise.reject(new Error("Auth system not yet initialized"))
    }

    try {
      if (isDemoMode) {
        // Use demo auth in demo mode
        await demoAuth.signOut()
      } else if (auth) {
        // Use real Firebase auth
        try {
          await signOut(auth)
        } catch (error: any) {
          // If network error, use demo auth
          if (error.code === "auth/network-request-failed") {
            await demoAuth.signOut()
          } else {
            throw error
          }
        }
      }
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!initialized) {
      return Promise.reject(new Error("Auth system not yet initialized"))
    }

    if (isDemoMode) {
      try {
        // Use demo auth in demo mode
        await demoAuth.sendPasswordResetEmail(email)
      } catch (error) {
        console.error("Password reset failed:", error)
        throw error
      }
    } else if (auth) {
      try {
        // Use real Firebase auth
        await sendPasswordResetEmail(auth, email)
      } catch (error: any) {
        console.error("Firebase auth password reset failed:", error)

        // If network error, use demo auth
        if (error.code === "auth/network-request-failed") {
          console.log("Network request failed, falling back to demo auth")
          return demoAuth.sendPasswordResetEmail(email)
        }

        throw error
      }
    } else {
      const error = new Error("Authentication service is not available")
      console.error(error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    isDemoMode,
    initialized,
    isPreviewMode,
  }

  // Only render children when we're on the client side
  if (typeof window === "undefined") {
    return <>{children}</>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

