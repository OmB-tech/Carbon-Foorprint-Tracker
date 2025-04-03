"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis } from "recharts"
import { ArrowDown, Car, Home, Leaf, LogIn, ShoppingBag, UserPlus, Utensils, Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { fetchAggregatedStats } from "@/lib/data-service"
import dynamic from "next/dynamic"

// Dynamically import the auth checker component with no SSR
const AuthChecker = dynamic(() => import("./auth-checker"), { ssr: false })

export default function LimitedDashboard() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmissions: 0,
    averageEmission: 0,
    totalActivities: 0,
    totalReduction: 0,
  })

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)

    // Fetch aggregated stats
    const getStats = async () => {
      try {
        const data = await fetchAggregatedStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    getStats()
  }, [])

  const emissionsData = [
    { month: "Jan", emissions: 120 },
    { month: "Feb", emissions: 140 },
    { month: "Mar", emissions: 110 },
    { month: "Apr", emissions: 105 },
    { month: "May", emissions: 95 },
    { month: "Jun", emissions: 90 },
    { month: "Jul", emissions: 85 },
  ]

  const categoryData = [
    { category: "Transport", emissions: 45 },
    { category: "Home", emissions: 30 },
    { category: "Food", emissions: 15 },
    { category: "Shopping", emissions: 10 },
  ]

  // Show loading state during server-side rendering
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      {/* Auth checker component that handles redirects */}
      <AuthChecker />

      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Hero section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl font-bold">Track Your Carbon Footprint</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join {stats.totalUsers} users who are tracking and reducing their carbon emissions for a better planet.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={() => router.push("/signup")} size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
              <Button onClick={() => router.push("/login")} variant="outline" size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          </div>

          {/* Community stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Users</CardTitle>
                <Leaf className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">People tracking their carbon footprint</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total CO₂ Saved</CardTitle>
                <Car className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReduction} kg</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowDown className="mr-1 h-3 w-3" />
                    {stats.totalReduction > 0 ? "Making an impact" : "Start tracking to make an impact"}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Home className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalActivities}</div>
                <p className="text-xs text-muted-foreground">Activities logged by our community</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Emissions</CardTitle>
                <Leaf className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageEmission.toFixed(1)} kg/day</div>
                <p className="text-xs text-muted-foreground">Average daily emissions per user</p>
              </CardContent>
            </Card>
          </div>

          {/* Sample charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sample Emissions Over Time</CardTitle>
                <CardDescription>Example data - sign up to track your own</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    emissions: {
                      label: "CO₂ Emissions (kg)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <AreaChart
                    data={emissionsData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="emissions"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1)/0.3)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sample Emissions by Category</CardTitle>
                <CardDescription>Example data - sign up to track your own</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    emissions: {
                      label: "CO₂ Emissions (kg)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <BarChart
                    data={categoryData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="emissions" fill="hsl(var(--chart-1))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Call to action */}
          <Card className="border-2 border-primary/50">
            <CardHeader>
              <CardTitle>Ready to Track Your Carbon Footprint?</CardTitle>
              <CardDescription>
                Sign up to start tracking your emissions, earn badges, and join our community of climate-conscious
                individuals.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => router.push("/signup")} className="flex-1">
                <UserPlus className="mr-2 h-4 w-4" />
                Create an Account
              </Button>
              <Button onClick={() => router.push("/login")} variant="outline" className="flex-1">
                <LogIn className="mr-2 h-4 w-4" />
                Login to Your Account
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-3 py-8">
            <div className="flex flex-col items-center text-center p-4">
              <Car className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Track Your Emissions</h3>
              <p className="text-muted-foreground">
                Log your daily activities and see how they contribute to your carbon footprint.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <Utensils className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Get Personalized Tips</h3>
              <p className="text-muted-foreground">
                Receive tailored suggestions to reduce your carbon footprint based on your activities.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <ShoppingBag className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Join Challenges</h3>
              <p className="text-muted-foreground">
                Participate in community challenges and earn badges for your achievements.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

