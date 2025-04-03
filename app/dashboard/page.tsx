import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import EmissionTracker from "@/components/emission-tracker"
import CarbonCalculator from "@/components/carbon-calculator"
import Reports from "@/components/reports"
import Community from "@/components/community"
import HarshReality from "@/components/harsh-reality"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import RecentActivities from "@/components/recent-activities"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80 nature-bg">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2 bg-gradient-to-r from-green-50/80 to-teal-50/80 dark:from-green-900/20 dark:to-teal-900/20 p-1 rounded-lg shadow-md">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="tracker"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Emission Tracker
              </TabsTrigger>
              <TabsTrigger
                value="calculator"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Carbon Calculator
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="community"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Community
              </TabsTrigger>
              <TabsTrigger
                value="reality"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Harsh Reality
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Recent Activities
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center min-h-[400px]">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin text-green-500" />
                      <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-green-500 opacity-20"></div>
                    </div>
                  </div>
                }
              >
                <Dashboard />
              </Suspense>
            </TabsContent>
            <TabsContent value="tracker">
              <EmissionTracker />
            </TabsContent>
            <TabsContent value="calculator">
              <CarbonCalculator />
            </TabsContent>
            <TabsContent value="reports">
              <Reports />
            </TabsContent>
            <TabsContent value="community">
              <Community />
            </TabsContent>
            <TabsContent value="reality">
              <HarshReality />
            </TabsContent>
            <TabsContent value="activities">
              <RecentActivities />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

