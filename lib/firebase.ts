// Firebase initialization with improved error handling
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Create a debug function
const debug = (message: string) => {
  console.log(`[Firebase] ${message}`)
}

// Explicitly declare our exports with proper types
let auth: Auth | null = null
let db: Firestore | null = null
let firebaseInitialized = false

// Function to check if we have the minimum required configuration
const hasMinimalConfig = () => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
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

// Only initialize Firebase on the client side
if (typeof window !== "undefined") {
  // Force demo mode in preview environments
  if (isPreviewEnvironment()) {
    debug("Preview environment detected. Using demo authentication.")
    firebaseInitialized = false
  }
  // Check if we have the minimum required configuration BEFORE attempting initialization
  else if (!hasMinimalConfig()) {
    debug("Missing required Firebase configuration. Using alternative authentication.")
    firebaseInitialized = false
  } else {
    try {
      // Create the Firebase configuration object
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
      }

      // Initialize Firebase (or get the existing instance)
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

      // Initialize Auth and Firestore
      auth = getAuth(app)
      db = getFirestore(app)

      // Test the connection to Firebase
      const testConnection = async () => {
        try {
          // Try to connect to Firebase Auth
          await auth!.authStateReady()
          debug("Firebase connection test successful")
          firebaseInitialized = true
        } catch (error) {
          console.error("Firebase connection test failed:", error)
          firebaseInitialized = false
          debug("Firebase connection test failed, using alternative authentication")
        }
      }

      // Run the test but don't wait for it
      testConnection().catch((err) => {
        console.error("Error testing Firebase connection:", err)
        firebaseInitialized = false
      })

      // Set the initialization flag to true initially
      // It will be set to false if the connection test fails
      firebaseInitialized = true
      debug("Firebase initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Firebase:", error)
      // Explicitly set to null and false to ensure alternative auth is used
      auth = null
      db = null
      firebaseInitialized = false
      debug("Firebase initialization failed, using alternative authentication")
    }
  }
}

// Helper function to check if Firebase is initialized
const isFirebaseInitialized = () => firebaseInitialized

// Export the initialization status and services
export { auth, db, firebaseInitialized, isFirebaseInitialized }

