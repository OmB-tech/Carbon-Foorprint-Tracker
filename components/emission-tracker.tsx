"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, Home, Leaf, Utensils } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { logEmission, getRecentEmissions } from "@/lib/data-service"
import { useToast } from "@/components/ui/use-toast"
import { db, isFirebaseInitialized } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export default function EmissionTracker() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Transport form state
  const [transportMode, setTransportMode] = useState("")
  const [distance, setDistance] = useState(10)
  const [passengers, setPassengers] = useState("1")
  const [frequency, setFrequency] = useState("once")

  // Home form state
  const [energySource, setEnergySource] = useState("")
  const [energyUsage, setEnergyUsage] = useState(100)
  const [homeSize, setHomeSize] = useState("medium")
  const [wasteGenerated, setWasteGenerated] = useState("medium")
  const [recycling, setRecycling] = useState("some")

  // Food form state
  const [foodType, setFoodType] = useState("")
  const [dietType, setDietType] = useState("omnivore")
  const [mealSize, setMealSize] = useState("medium")
  const [locallySourced, setLocallySourced] = useState("no")
  const [foodWaste, setFoodWaste] = useState("some")

  // Common state
  const [monthlyGoal, setMonthlyGoal] = useState(200)
  const [currentEmissions, setCurrentEmissions] = useState(0)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split("T")[0])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setError("")
        // Fetch recent emissions for the current user
        const emissions = await getRecentEmissions(user.uid, 5)
        setRecentActivities(emissions)

        // Calculate current emissions
        const total = emissions.reduce((sum, activity) => sum + (activity.emissions || 0), 0)
        setCurrentEmissions(total)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Unable to load your recent activities. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const triggerDashboardUpdate = () => {
    // Create and dispatch a custom event to notify the dashboard to update
    const event = new CustomEvent("emission-logged")
    window.dispatchEvent(event)
  }

  const logEmissionToFirebase = async (data) => {
    if (isFirebaseInitialized() && db) {
      try {
        // Add directly to Firestore for real-time updates
        const emissionsRef = collection(db, "emissions")
        await addDoc(emissionsRef, {
          ...data,
          createdAt: serverTimestamp(),
        })
        console.log("Emission logged directly to Firestore")
        return true
      } catch (error) {
        console.error("Error logging to Firestore:", error)
        return false
      }
    }
    return false
  }

  const handleTransportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      router.push("/login")
      return
    }

    if (!transportMode) {
      setError("Please select a transport type")
      return
    }

    // Calculate emissions based on transport mode and distance
    let emissionAmount = 0
    const passengerCount = Number.parseInt(passengers) || 1
    const frequencyMultiplier = frequency === "daily" ? 30 : frequency === "weekly" ? 4 : 1

    if (transportMode === "car") {
      emissionAmount = ((distance * 0.2) / passengerCount) * frequencyMultiplier
    } else if (transportMode === "bus") {
      emissionAmount = distance * 0.1 * frequencyMultiplier
    } else if (transportMode === "train") {
      emissionAmount = distance * 0.05 * frequencyMultiplier
    } else if (transportMode === "plane") {
      emissionAmount = distance * 0.3 * frequencyMultiplier
    } else if (transportMode === "bike" || transportMode === "walk") {
      emissionAmount = 0
    }

    const emissionData = {
      userId: user.uid,
      userName: user.displayName || "Anonymous User",
      category: "transport",
      activity: `${transportMode} trip (${distance} km, ${frequency})`,
      emissions: emissionAmount,
      date: activityDate,
    }

    try {
      // Try to log directly to Firebase first for real-time updates
      const firebaseSuccess = await logEmissionToFirebase(emissionData)

      if (!firebaseSuccess) {
        // Fall back to the data service if Firebase direct logging fails
        await logEmission(user.uid, user.displayName || "Anonymous User", {
          category: "transport",
          activity: `${transportMode} trip (${distance} km, ${frequency})`,
          emissions: emissionAmount,
          date: activityDate,
        })
      }

      // Update the current emissions
      setCurrentEmissions((prev) => prev + emissionAmount)

      // Refresh recent activities
      const updatedActivities = await getRecentEmissions(user.uid, 5)
      setRecentActivities(updatedActivities)

      // Show success message
      toast({
        title: "Activity logged",
        description: `${transportMode} trip successfully recorded.`,
      })

      // Reset form
      setTransportMode("")

      // Trigger a refresh of the dashboard data
      triggerDashboardUpdate()
    } catch (error) {
      console.error("Error logging emission:", error)
      setError("Failed to log your activity. Please try again.")
    }
  }

  const handleHomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      router.push("/login")
      return
    }

    if (!energySource) {
      setError("Please select an energy source")
      return
    }

    // Calculate emissions based on energy source, usage, home size, and waste
    let emissionAmount = 0

    // Energy emissions
    if (energySource === "electricity") {
      emissionAmount = energyUsage * 0.5
    } else if (energySource === "natural_gas") {
      emissionAmount = energyUsage * 0.2
    } else if (energySource === "oil") {
      emissionAmount = energyUsage * 0.3
    } else if (energySource === "renewable") {
      emissionAmount = energyUsage * 0.05
    }

    // Adjust based on home size
    if (homeSize === "small") {
      emissionAmount *= 0.8
    } else if (homeSize === "large") {
      emissionAmount *= 1.2
    }

    // Add waste emissions
    if (wasteGenerated === "low") {
      emissionAmount += 5
    } else if (wasteGenerated === "medium") {
      emissionAmount += 10
    } else if (wasteGenerated === "high") {
      emissionAmount += 20
    }

    // Reduce for recycling
    if (recycling === "all") {
      emissionAmount *= 0.7
    } else if (recycling === "some") {
      emissionAmount *= 0.9
    }

    const emissionData = {
      userId: user.uid,
      userName: user.displayName || "Anonymous User",
      category: "home",
      activity: `${energySource} usage (${energyUsage} units, ${wasteGenerated} waste)`,
      emissions: emissionAmount,
      date: activityDate,
    }

    try {
      // Try to log directly to Firebase first for real-time updates
      const firebaseSuccess = await logEmissionToFirebase(emissionData)

      if (!firebaseSuccess) {
        // Fall back to the data service if Firebase direct logging fails
        await logEmission(user.uid, user.displayName || "Anonymous User", {
          category: "home",
          activity: `${energySource} usage (${energyUsage} units, ${wasteGenerated} waste)`,
          emissions: emissionAmount,
          date: activityDate,
        })
      }

      // Update the current emissions
      setCurrentEmissions((prev) => prev + emissionAmount)

      // Refresh recent activities
      const updatedActivities = await getRecentEmissions(user.uid, 5)
      setRecentActivities(updatedActivities)

      // Show success message
      toast({
        title: "Activity logged",
        description: `Home energy usage successfully recorded.`,
      })

      // Reset form
      setEnergySource("")

      // Trigger a refresh of the dashboard data
      triggerDashboardUpdate()
    } catch (error) {
      console.error("Error logging emission:", error)
      setError("Failed to log your activity. Please try again.")
    }
  }

  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      router.push("/login")
      return
    }

    if (!dietType) {
      setError("Please select a diet type")
      return
    }

    // Calculate emissions based on diet type and food waste
    let emissionAmount = 0

    // Base emissions by diet type
    if (dietType === "meat-heavy") {
      emissionAmount = 15.0
    } else if (dietType === "omnivore") {
      emissionAmount = 10.0
    } else if (dietType === "flexitarian") {
      emissionAmount = 7.0
    } else if (dietType === "vegetarian") {
      emissionAmount = 4.0
    } else if (dietType === "vegan") {
      emissionAmount = 2.5
    }

    // Adjust based on food waste
    if (foodWaste === "none") {
      emissionAmount *= 0.8
    } else if (foodWaste === "little") {
      emissionAmount *= 0.9
    } else if (foodWaste === "significant") {
      emissionAmount *= 1.2
    }

    // Adjust if locally sourced
    if (locallySourced === "yes") {
      emissionAmount *= 0.8
    }

    const emissionData = {
      userId: user.uid,
      userName: user.displayName || "Anonymous User",
      category: "food",
      activity: `${dietType} diet (${foodWaste} waste, ${locallySourced === "yes" ? "locally sourced" : "not locally sourced"})`,
      emissions: emissionAmount,
      date: activityDate,
    }

    try {
      // Try to log directly to Firebase first for real-time updates
      const firebaseSuccess = await logEmissionToFirebase(emissionData)

      if (!firebaseSuccess) {
        // Fall back to the data service if Firebase direct logging fails
        await logEmission(user.uid, user.displayName || "Anonymous User", {
          category: "food",
          activity: `${dietType} diet (${foodWaste} waste, ${locallySourced === "yes" ? "locally sourced" : "not locally sourced"})`,
          emissions: emissionAmount,
          date: activityDate,
        })
      }

      // Update the current emissions
      setCurrentEmissions((prev) => prev + emissionAmount)

      // Refresh recent activities
      const updatedActivities = await getRecentEmissions(user.uid, 5)
      setRecentActivities(updatedActivities)

      // Show success message
      toast({
        title: "Activity logged",
        description: `Food consumption successfully recorded.`,
      })

      // Reset form
      setDietType("omnivore")

      // Trigger a refresh of the dashboard data
      triggerDashboardUpdate()
    } catch (error) {
      console.error("Error logging emission:", error)
      setError("Failed to log your activity. Please try again.")
    }
  }

  const progressPercentage = Math.min(100, (currentEmissions / monthlyGoal) * 100)

  // Get card background class based on index
  const getCardBackground = (index) => {
    const backgrounds = ["card-forest", "card-water", "card-leaf", "card-mountain"]
    return backgrounds[index % backgrounds.length]
  }

  return (
    <div className="space-y-6 nature-bg">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`eco-card eco-card-hover ${getCardBackground(0)}`}>
          <CardHeader>
            <CardTitle>Monthly Emission Goal</CardTitle>
            <CardDescription>Track your progress towards your monthly carbon reduction goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current: {currentEmissions.toFixed(1)} kg CO₂</span>
                <span>Goal: {monthlyGoal} kg CO₂</span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-3"
                indicatorClassName={`${
                  progressPercentage > 80
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : progressPercentage > 50
                      ? "bg-gradient-to-r from-amber-500 to-amber-600"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
              />
              <p className="text-sm text-muted-foreground">
                {progressPercentage < 100
                  ? `${(monthlyGoal - currentEmissions).toFixed(1)} kg remaining to reach your monthly limit`
                  : "You've exceeded your monthly goal. Consider offsetting your emissions."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Adjust Monthly Goal (kg CO₂)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="goal"
                  min={50}
                  max={500}
                  step={10}
                  value={[monthlyGoal]}
                  onValueChange={(value) => setMonthlyGoal(value[0])}
                />
                <span className="w-12 text-center">{monthlyGoal}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`eco-card eco-card-hover ${getCardBackground(1)}`}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest logged emissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-eco-leaf rounded-full border-t-transparent"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activities logged yet. Start tracking your emissions!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between border-b pb-2 hover:bg-muted/30 p-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      {activity.category === "transport" ? (
                        <Car className="h-4 w-4 mr-2 text-emerald-500" />
                      ) : activity.category === "home" ? (
                        <Home className="h-4 w-4 mr-2 text-orange-500" />
                      ) : activity.category === "food" ? (
                        <Utensils className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <Leaf className="h-4 w-4 mr-2 text-emerald-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{activity.activity}</p>
                        <p className="text-xs text-muted-foreground">{activity.emissions.toFixed(1)} kg CO₂</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard?tab=activities")}>
              View All Activities
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className={`eco-card eco-card-hover ${getCardBackground(2)}`}>
        <CardHeader>
          <CardTitle>Log New Activity</CardTitle>
          <CardDescription>Record your daily activities to track your carbon footprint</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="transport">
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/20 dark:to-blue-900/20">
              <TabsTrigger
                value="transport"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                <Car className="h-4 w-4 mr-2" />
                Transport
              </TabsTrigger>
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </TabsTrigger>
              <TabsTrigger
                value="food"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Food
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transport" className="space-y-4 mt-4">
              <form onSubmit={handleTransportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transport-type">Transport Type</Label>
                    <Select value={transportMode} onValueChange={setTransportMode}>
                      <SelectTrigger id="transport-type">
                        <SelectValue placeholder="Select transport type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="train">Train</SelectItem>
                        <SelectItem value="plane">Plane</SelectItem>
                        <SelectItem value="bike">Bicycle</SelectItem>
                        <SelectItem value="walk">Walking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">How often do you make this trip?</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Just once</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="distance"
                        min={1}
                        max={500}
                        step={5}
                        value={[distance]}
                        onValueChange={(value) => setDistance(value[0])}
                      />
                      <span className="w-12 text-center">{distance}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passengers">Passengers (for car/taxi)</Label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger id="passengers">
                        <SelectValue placeholder="Number of passengers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (just me)</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="3">3 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="5">5+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" id="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
                </div>

                <div className="flex justify-between items-center border rounded-lg p-3 bg-muted/50">
                  <div>
                    <h3 className="font-medium flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-emerald-500" />
                      Estimated Emissions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Based on your selections:{" "}
                      {transportMode === "car"
                        ? (
                            ((distance * 0.2) / (Number.parseInt(passengers) || 1)) *
                            (frequency === "daily" ? 30 : frequency === "weekly" ? 4 : 1)
                          ).toFixed(1)
                        : transportMode === "bus"
                          ? (distance * 0.1 * (frequency === "daily" ? 30 : frequency === "weekly" ? 4 : 1)).toFixed(1)
                          : transportMode === "train"
                            ? (distance * 0.05 * (frequency === "daily" ? 30 : frequency === "weekly" ? 4 : 1)).toFixed(
                                1,
                              )
                            : transportMode === "plane"
                              ? (
                                  distance *
                                  0.3 *
                                  (frequency === "daily" ? 30 : frequency === "weekly" ? 4 : 1)
                                ).toFixed(1)
                              : "0.0"}{" "}
                      kg CO₂
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={!transportMode}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  >
                    Log Activity
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="home" className="space-y-4 mt-4">
              <form onSubmit={handleHomeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="energy-source">Energy Source</Label>
                    <Select value={energySource} onValueChange={setEnergySource}>
                      <SelectTrigger id="energy-source">
                        <SelectValue placeholder="Select energy source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="natural_gas">Natural Gas</SelectItem>
                        <SelectItem value="oil">Oil</SelectItem>
                        <SelectItem value="renewable">Renewable Energy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="home-size">Home Size</Label>
                    <Select value={homeSize} onValueChange={setHomeSize}>
                      <SelectTrigger id="home-size">
                        <SelectValue placeholder="Select home size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (Apartment/Small House)</SelectItem>
                        <SelectItem value="medium">Medium (Average House)</SelectItem>
                        <SelectItem value="large">Large (Large House)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waste-generated">Waste Generated</Label>
                    <Select value={wasteGenerated} onValueChange={setWasteGenerated}>
                      <SelectTrigger id="waste-generated">
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (1 small bag per week)</SelectItem>
                        <SelectItem value="medium">Medium (2-3 bags per week)</SelectItem>
                        <SelectItem value="high">High (4+ bags per week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recycling">Do you recycle?</Label>
                    <Select value={recycling} onValueChange={setRecycling}>
                      <SelectTrigger id="recycling">
                        <SelectValue placeholder="Select recycling habits" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No recycling</SelectItem>
                        <SelectItem value="some">Some recycling</SelectItem>
                        <SelectItem value="all">Comprehensive recycling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="energy-usage">Monthly Energy Usage (kWh or equivalent)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="energy-usage"
                      min={10}
                      max={500}
                      step={10}
                      value={[energyUsage]}
                      onValueChange={(value) => setEnergyUsage(value[0])}
                    />
                    <span className="w-12 text-center">{energyUsage}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Tip: Check your utility bill for your actual usage</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" id="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
                </div>

                <div className="flex justify-between items-center border rounded-lg p-3 bg-muted/50">
                  <div>
                    <h3 className="font-medium flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-emerald-500" />
                      Estimated Emissions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Based on your selections:{" "}
                      {energySource &&
                        (
                          (energySource === "electricity"
                            ? energyUsage * 0.5
                            : energySource === "natural_gas"
                              ? energyUsage * 0.2
                              : energySource === "oil"
                                ? energyUsage * 0.3
                                : energyUsage * 0.05) *
                            (homeSize === "small" ? 0.8 : homeSize === "large" ? 1.2 : 1) +
                          (wasteGenerated === "low" ? 5 : wasteGenerated === "high" ? 20 : 10) *
                            (recycling === "all" ? 0.7 : recycling === "some" ? 0.9 : 1)
                        ).toFixed(1)}{" "}
                      kg CO₂
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={!energySource}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Log Activity
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="food" className="space-y-4 mt-4">
              <form onSubmit={handleFoodSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diet-type">Your Diet Type</Label>
                    <Select value={dietType} onValueChange={setDietType}>
                      <SelectTrigger id="diet-type">
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meat-heavy">Meat with every meal</SelectItem>
                        <SelectItem value="omnivore">Regular meat eater</SelectItem>
                        <SelectItem value="flexitarian">Flexitarian (occasional meat)</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="food-waste">How much food do you typically waste?</Label>
                    <Select value={foodWaste} onValueChange={setFoodWaste}>
                      <SelectTrigger id="food-waste">
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Almost none</SelectItem>
                        <SelectItem value="little">Very little</SelectItem>
                        <SelectItem value="some">Some</SelectItem>
                        <SelectItem value="significant">Significant amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locally-sourced">Do you eat locally produced food?</Label>
                  <Select value={locallySourced} onValueChange={setLocallySourced}>
                    <SelectTrigger id="locally-sourced">
                      <SelectValue placeholder="Is the food locally sourced?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, mostly local</SelectItem>
                      <SelectItem value="no">No, mostly imported</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" id="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
                </div>

                <div className="flex justify-between items-center border rounded-lg p-3 bg-muted/50">
                  <div>
                    <h3 className="font-medium flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-emerald-500" />
                      Estimated Emissions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Based on your selections:{" "}
                      {(
                        (dietType === "meat-heavy"
                          ? 15.0
                          : dietType === "omnivore"
                            ? 10.0
                            : dietType === "flexitarian"
                              ? 7.0
                              : dietType === "vegetarian"
                                ? 4.0
                                : 2.5) *
                        (foodWaste === "none"
                          ? 0.8
                          : foodWaste === "little"
                            ? 0.9
                            : foodWaste === "significant"
                              ? 1.2
                              : 1.0) *
                        (locallySourced === "yes" ? 0.8 : 1.0)
                      ).toFixed(1)}{" "}
                      kg CO₂
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    Log Activity
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

