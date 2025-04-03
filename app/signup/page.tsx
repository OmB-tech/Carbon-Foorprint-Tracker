"use client"

import { SignupForm } from "@/components/auth/signup-form"
import { Leaf } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <div className="flex items-center mb-8">
        <Leaf className="h-8 w-8 text-emerald-500 mr-2" />
        <h1 className="text-3xl font-bold">CarbonTracker</h1>
      </div>
      <SignupForm />
    </div>
  )
}

