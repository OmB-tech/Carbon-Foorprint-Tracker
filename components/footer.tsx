"use client"

import Link from "next/link"
import { Leaf, Github, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-eco-leaf" />
            <span className="font-bold">CarbonTracker</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 CarbonTracker. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:underline hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:underline hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:underline hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>
        <div className="flex gap-4">
          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}

