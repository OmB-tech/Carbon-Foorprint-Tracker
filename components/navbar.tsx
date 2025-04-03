"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Leaf, Menu, LogIn, LogOut, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const isAuthenticated = !!user

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleViewProfile = () => {
    toast({
      title: "Profile",
      description: "Profile functionality coming soon!",
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-sm font-medium hover:underline">
                  Home
                </Link>
                {isAuthenticated && (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium hover:underline">
                      Dashboard
                    </Link>
                    <Link href="/dashboard?tab=tracker" className="text-sm font-medium hover:underline">
                      Emission Tracker
                    </Link>
                    <Link href="/dashboard?tab=calculator" className="text-sm font-medium hover:underline">
                      Carbon Calculator
                    </Link>
                    <Link href="/dashboard?tab=reports" className="text-sm font-medium hover:underline">
                      Reports
                    </Link>
                    <Link href="/dashboard?tab=community" className="text-sm font-medium hover:underline">
                      Community
                    </Link>
                    <Link href="/dashboard?tab=reality" className="text-sm font-medium hover:underline">
                      Harsh Reality
                    </Link>
                    <Link href="/dashboard?tab=activities" className="text-sm font-medium hover:underline">
                      Recent Activities
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-eco-leaf" />
            <span className="font-bold text-lg hidden md:inline-block">CarbonTracker</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleViewProfile}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </header>
  )
}

