"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export function FirebaseError() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Authentication Error</CardTitle>
        </div>
        <CardDescription>Firebase authentication is not properly configured</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          The application cannot connect to Firebase authentication services. This could be due to missing or incorrect
          environment variables.
        </p>
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Required Environment Variables:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
            <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
            <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
            <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
            <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Please make sure these environment variables are correctly set in your .env.local file or deployment platform.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </CardFooter>
    </Card>
  )
}

