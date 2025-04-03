"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Car, Home, Utensils, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { getUserEmissions } from "@/lib/data-service"
import { useSearchParams, useRouter } from "next/navigation"

// Sample suggestions based on user data
const generateSuggestions = (userData: any) => {
  const suggestions = {
    transport: [
      {
        title: "Consider carpooling",
        description: "Sharing rides could reduce your emissions by up to 30%",
        impact: "High",
        difficulty: "Easy",
      },
      {
        title: "Optimize your route planning",
        description: "Combining errands can save 10% of your transport emissions",
        impact: "Medium",
        difficulty: "Easy",
      },
      {
        title: "Try public transportation",
        description: "Using public transport once a week can reduce your carbon footprint significantly",
        impact: "High",
        difficulty: "Medium",
      },
      {
        title: "Maintain proper tire pressure",
        description: "Properly inflated tires can improve fuel efficiency by 3%",
        impact: "Low",
        difficulty: "Easy",
      },
      {
        title: "Consider an electric vehicle",
        description: "Electric vehicles produce zero direct emissions",
        impact: "Very High",
        difficulty: "Hard",
      },
    ],
    home: [
      {
        title: "Lower your thermostat",
        description: "Each degree lower saves about 5% on heating energy",
        impact: "Medium",
        difficulty: "Easy",
      },
      {
        title: "Switch to LED lighting",
        description: "LEDs use 75% less energy than incandescent bulbs",
        impact: "Medium",
        difficulty: "Easy",
      },
      {
        title: "Unplug electronics when not in use",
        description: "Standby power can account for 10% of your electricity usage",
        impact: "Low",
        difficulty: "Easy",
      },
      {
        title: "Install a programmable thermostat",
        description: "Automatically adjust temperature when you're away or asleep",
        impact: "Medium",
        difficulty: "Medium",
      },
      {
        title: "Improve home insulation",
        description: "Better insulation can reduce heating and cooling needs by 20%",
        impact: "High",
        difficulty: "Hard",
      },
    ],
    food: [
      {
        title: "Try Meatless Mondays",
        description: "Reducing meat consumption once a week can lower your food emissions by 15%",
        impact: "High",
        difficulty: "Medium",
      },
      {
        title: "Buy local and seasonal",
        description: "Local food travels less distance, reducing transportation emissions",
        impact: "Medium",
        difficulty: "Medium",
      },
      {
        title: "Reduce food waste",
        description: "Plan meals and use leftovers to reduce the 30% of food that typically goes to waste",
        impact: "Medium",
        difficulty: "Medium",
      },
      {
        title: "Compost food scraps",
        description: "Composting reduces methane emissions from landfills",
        impact: "Medium",
        difficulty: "Easy",
      },
      {
        title: "Grow your own vegetables",
        description: "Home gardens reduce transportation emissions and packaging waste",
        impact: "Medium",
        difficulty: "Medium",
      },
    ],
  }

  // Personalize based on user data
  if (userData) {
    // If user has high transport emissions, prioritize those suggestions
    if (userData.highTransportEmissions) {
      return {
        ...suggestions,
        transport: [
          {
            title: "Consider an electric vehicle",
            description: "Electric vehicles can reduce your transport emissions by up to 80%",
            impact: "Very High",
            difficulty: "Hard",
          },
          ...suggestions.transport,
        ],
      }
    }

    // If user has high home emissions, prioritize those suggestions
    if (userData.highHomeEmissions) {
      return {
        ...suggestions,
        home: [
          {
            title: "Switch to renewable energy",
            description: "Renewable energy can reduce your home emissions by up to 100%",
            impact: "Very High",
            difficulty: "Medium",
          },
          ...suggestions.home,
        ],
      }
    }

    // If user has high food emissions, prioritize those suggestions
    if (userData.highFoodEmissions) {
      return {
        ...suggestions,
        food: [
          {
            title: "Consider a plant-based diet",
            description: "A plant-based diet can reduce your food emissions by up to 70%",
            impact: "Very High",
            difficulty: "Hard",
          },
          ...suggestions.food,
        ],
      }
    }
  }

  return suggestions
}

export function PersonalizedSuggestions() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get the category from URL if available
  const categoryParam = searchParams.get("category")
  const [activeTab, setActiveTab] = useState(categoryParam || "transport")

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Get user emissions data
        const emissions = await getUserEmissions(user.uid)

        // Simple analysis
        const transportEmissions = emissions.filter((e: any) => e.category === "transport")
        const homeEmissions = emissions.filter((e: any) => e.category === "home")
        const foodEmissions = emissions.filter((e: any) => e.category === "food")

        const totalTransport = transportEmissions.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
        const totalHome = homeEmissions.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
        const totalFood = foodEmissions.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)

        const userData = {
          highTransportEmissions: totalTransport > (totalHome + totalFood) / 2,
          highHomeEmissions: totalHome > (totalTransport + totalFood) / 2,
          highFoodEmissions: totalFood > (totalTransport + totalHome) / 2,
        }

        setUserData(userData)
        setSuggestions(generateSuggestions(userData))
      } catch (error) {
        console.error("Error fetching user data:", error)
        // Fallback to generic suggestions
        setSuggestions(generateSuggestions(null))
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Update active tab if category param changes
    if (categoryParam) {
      setActiveTab(categoryParam)
    }
  }, [user, categoryParam])

  // Handle view more tips
  const handleViewMoreTips = (category) => {
    // Navigate to personalized suggestions with the selected category
    router.push(`/dashboard?tab=personalized&category=${category}`)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-2">Generating personalized suggestions...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Suggestions</CardTitle>
        <CardDescription>Recommendations to help reduce your carbon footprint</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transport">
              <Car className="h-4 w-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="home">
              <Home className="h-4 w-4 mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger value="food">
              <Utensils className="h-4 w-4 mr-2" />
              Food
            </TabsTrigger>
          </TabsList>

          {Object.entries(suggestions || {}).map(([category, categorySuggestions]: [string, any]) => (
            <TabsContent key={category} value={category} className="space-y-4 mt-4">
              {categorySuggestions.length > 0 ? (
                <>
                  {categorySuggestions.slice(0, 3).map((suggestion: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{suggestion.title}</h3>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <div className="flex flex-col items-end text-xs">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              suggestion.impact === "High" || suggestion.impact === "Very High"
                                ? "bg-emerald-100 text-emerald-800"
                                : suggestion.impact === "Medium"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {suggestion.impact} Impact
                          </span>
                          <span className="text-muted-foreground mt-1">{suggestion.difficulty} to implement</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => handleViewMoreTips(category)}>
                    View More {category.charAt(0).toUpperCase() + category.slice(1)} Tips
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No suggestions available</h3>
                  <p className="text-sm text-muted-foreground">Log more activities to get personalized suggestions</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

