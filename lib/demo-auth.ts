// Simple demo authentication implementation
import { EventEmitter } from "events"

// Create a simple event emitter for auth state changes
const authStateEmitter = new EventEmitter()

// Mock user storage
let currentUser: any = null

// Mock authentication functions
export const demoAuth = {
  // Sign up function
  createUser: async (email: string, password: string, displayName: string) => {
    // Create a mock user
    const newUser = {
      uid: `demo-${Date.now()}`,
      email,
      displayName,
      photoURL: null,
      emailVerified: false,
    }

    // Store the user
    currentUser = newUser

    // Emit auth state change
    authStateEmitter.emit("authStateChanged", currentUser)

    return newUser
  },

  // Sign in function
  signIn: async (email: string, password: string) => {
    // For demo purposes, any email/password combination works
    const user = {
      uid: `demo-${Date.now()}`,
      email,
      displayName: email.split("@")[0],
      photoURL: null,
      emailVerified: true,
    }

    // Store the user
    currentUser = user

    // Emit auth state change
    authStateEmitter.emit("authStateChanged", currentUser)

    return user
  },

  // Sign out function
  signOut: async () => {
    // Clear the current user
    currentUser = null

    // Emit auth state change
    authStateEmitter.emit("authStateChanged", null)
  },

  // Password reset function
  sendPasswordResetEmail: async (email: string) => {
    // In demo mode, just pretend we sent an email
    console.log(`Password reset email would be sent to ${email}`)
  },

  // Auth state observer
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Call immediately with current state
    callback(currentUser)

    // Set up listener
    authStateEmitter.on("authStateChanged", callback)

    // Return unsubscribe function
    return () => {
      authStateEmitter.off("authStateChanged", callback)
    }
  },

  // Current user getter
  getCurrentUser: () => currentUser,
}

// Mock Firestore
export const demoDb = {
  // Simple in-memory storage
  _storage: new Map<string, any>(),

  // Collection reference
  collection: (path: string) => ({
    // Add document
    addDoc: async (data: any) => {
      const id = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const fullPath = `${path}/${id}`

      demoDb._storage.set(fullPath, {
        id,
        ...data,
      })

      return { id, path: fullPath }
    },
  }),
}

