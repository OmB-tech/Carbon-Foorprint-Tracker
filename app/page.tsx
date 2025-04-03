"use client"

import dynamic from "next/dynamic"

// Dynamically import the LimitedDashboard component with no SSR
const LimitedDashboard = dynamic(() => import("@/components/limited-dashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
    </div>
  ),
})

export default function Home() {
  return <LimitedDashboard />
}

