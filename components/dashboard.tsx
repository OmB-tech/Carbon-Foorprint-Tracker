"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts"
import {
  ArrowDown,
  Car,
  Home,
  Leaf,
  ShoppingBag,
  Utensils,
  AlertCircle,
  Info,
  TrendingDown,
  TrendingUp,
  PieChartIcon,
  RefreshCw,
} from "lucide-react"
import { PersonalizedSuggestions } from "@/components/personalized-suggestions"
import { DailyChallenge } from "@/components/gamification/daily-challenge"
import { useAuth } from "@/components/auth/auth-context"
import { getUserEmissions } from "@/lib/data-service"
import { useToast } from "@/components/ui/use-toast"
import { db, isFirebaseInitialized } from "@/lib/firebase"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"

// Enhanced nature-inspired color palette
const COLORS = {
  green: {
    primary: "#4CAF50",
    light: "#81C784",
    dark: "#2E7D32",
    gradient: "from-green-500 to-green-600",
  },
  amber: {
    primary: "#FFC107",
    light: "#FFD54F",
    dark: "#FF8F00",
    gradient: "from-amber-500 to-amber-600",
  },
  terracotta: {
    primary: "#E57373",
    light: "#EF9A9A",
    dark: "#C62828",
    gradient: "from-red-400 to-red-500",
  },
  teal: {
    primary: "#009688",
    light: "#4DB6AC",
    dark: "#00796B",
    gradient: "from-teal-500 to-teal-600",
  },
  purple: {
    primary: "#9575CD",
    light: "#B39DDB",
    dark: "#5E35B1",
    gradient: "from-purple-400 to-purple-500",
  },
}

// Chart color palette
const CHART_COLORS = [
  COLORS.green.primary,
  COLORS.amber.primary,
  COLORS.terracotta.primary,
  COLORS.teal.primary,
  COLORS.purple.primary,
]

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [userStats, setUserStats] = useState({
    totalEmissions: 0,
    dailyAverage: 0,
    monthlyProgress: 0,
    treesEquivalent: 0,
    emissionsData: [],
    categoryData: [],
    recentActivities: [],
    trend: 0,
    weeklyData: [],
    monthlyData: [],
    yearlyData: [],
    emissionsByDay: [],
    topSources: [],
    comparisonData: {
      user: 0,
      community: 0,
      global: 0,
    },
    savingsOpportunities: [],
    emissionIntensity: 0,
  })
  const [loading, setLoading] = useState(true)
  const [monthlyGoal, setMonthlyGoal] = useState(200)
  const [timeRange, setTimeRange] = useState("monthly") // weekly, monthly, yearly
  const [dateFilter, setDateFilter] = useState("all") // all, week, month, year
  const [categoryFilter, setCategoryFilter] = useState("all") // all, transport, home, food
  const [refreshKey, setRefreshKey] = useState(0) // Used to force re-render of charts
  const [dynamicTitle, setDynamicTitle] = useState("Emissions Over Time")
  const [dynamicDescription, setDynamicDescription] = useState("Your carbon footprint trend")
  const chartContainerRef = useRef(null)

  // Function to fetch user data
  const fetchUserData = async () => {
    if (!user) return

    try {
      console.log("Fetching user emissions data...")
      // Fetch user emissions
      const emissions = await getUserEmissions(user.uid)
      console.log(`Fetched ${emissions.length} emission records`)

      if (emissions.length === 0) {
        // Initialize with empty data
        setUserStats({
          totalEmissions: 0,
          dailyAverage: 0,
          monthlyProgress: 0,
          treesEquivalent: 0,
          emissionsData: [],
          categoryData: [],
          recentActivities: [],
          trend: 0,
          weeklyData: [],
          monthlyData: [],
          yearlyData: [],
          emissionsByDay: [],
          topSources: [],
          comparisonData: {
            user: 0,
            community: 0,
            global: 0,
          },
          savingsOpportunities: [],
          emissionIntensity: 0,
        })
      } else {
        // Calculate stats from emissions data
        const totalEmissions = emissions.reduce((sum, e) => sum + (e.emissions || 0), 0)

        // Calculate daily average based on unique dates
        const uniqueDates = new Set(emissions.map((e) => e.date))
        const dailyAverage = totalEmissions / Math.max(1, uniqueDates.size)

        // Calculate monthly progress
        const monthlyProgress = Math.min(100, (totalEmissions / monthlyGoal) * 100)

        // Calculate trees equivalent (1 tree absorbs ~21.77 kg CO2 per year)
        const treesEquivalent = Math.round(totalEmissions / 21.77)

        // Calculate trend (compare current month with previous month)
        const now = new Date()
        const currentMonth = now.getMonth()
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const currentYear = now.getFullYear()
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

        const currentMonthEmissions = emissions
          .filter((e) => {
            const date = new Date(e.date)
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear
          })
          .reduce((sum, e) => sum + (e.emissions || 0), 0)

        const previousMonthEmissions = emissions
          .filter((e) => {
            const date = new Date(e.date)
            return date.getMonth() === previousMonth && date.getFullYear() === previousYear
          })
          .reduce((sum, e) => sum + (e.emissions || 0), 0)

        let trend = 0
        if (previousMonthEmissions > 0) {
          trend = ((currentMonthEmissions - previousMonthEmissions) / previousMonthEmissions) * 100
        }

        // Group by month for chart data
        const monthlyData = emissions.reduce((acc, e) => {
          const date = new Date(e.date)
          const month = date.toLocaleString("default", { month: "short" })

          if (!acc[month]) acc[month] = { month, emissions: 0 }
          acc[month].emissions += e.emissions || 0
          return acc
        }, {})

        // Group by week for chart data
        const weeklyData = emissions.reduce((acc, e) => {
          const date = new Date(e.date)
          const weekNumber = getWeekNumber(date)
          const weekLabel = `Week ${weekNumber}`

          if (!acc[weekLabel]) acc[weekLabel] = { week: weekLabel, emissions: 0 }
          acc[weekLabel].emissions += e.emissions || 0
          return acc
        }, {})

        // Group by year for chart data
        const yearlyData = emissions.reduce((acc, e) => {
          const date = new Date(e.date)
          const year = date.getFullYear().toString()

          if (!acc[year]) acc[year] = { year, emissions: 0 }
          acc[year].emissions += e.emissions || 0
          return acc
        }, {})

        // Group by day of week
        const emissionsByDay = emissions.reduce((acc, e) => {
          const date = new Date(e.date)
          const day = date.toLocaleString("default", { weekday: "short" })

          if (!acc[day]) acc[day] = { day, emissions: 0, count: 0 }
          acc[day].emissions += e.emissions || 0
          acc[day].count += 1
          return acc
        }, {})

        // Convert to arrays for charts
        const emissionsData = Object.values(monthlyData)
        const weeklyDataArray = Object.values(weeklyData)
        const yearlyDataArray = Object.values(yearlyData)
        const emissionsByDayArray = Object.values(emissionsByDay).map((item) => ({
          ...item,
          average: item.emissions / item.count,
        }))

        // Group by category
        const categoryData = emissions.reduce((acc, e) => {
          if (!acc[e.category]) acc[e.category] = { category: e.category, emissions: 0 }
          acc[e.category].emissions += e.emissions || 0
          return acc
        }, {})

        // Find top emission sources
        const topSources = Object.entries(categoryData)
          .map(([category, data]) => ({
            category,
            emissions: data.emissions,
            percentage: (data.emissions / totalEmissions) * 100,
          }))
          .sort((a, b) => b.emissions - a.emissions)
          .slice(0, 3)

        // Assign colors to categories
        const categoryChartData = Object.entries(categoryData).map(([category, data], index) => ({
          category,
          emissions: data.emissions,
          fill: CHART_COLORS[index % CHART_COLORS.length],
        }))

        // Create comparison data (mock data for community and global)
        const comparisonData = {
          user: dailyAverage,
          community: 12.5, // Mock data
          global: 22.0, // Mock data
        }

        // Calculate emission intensity (emissions per activity)
        const emissionIntensity = totalEmissions / Math.max(1, emissions.length)

        // Generate savings opportunities based on user data
        const savingsOpportunities = []

        if (categoryData.transport && categoryData.transport.emissions > 0) {
          savingsOpportunities.push({
            category: "transport",
            title: "Reduce car trips",
            potential: Math.round(categoryData.transport.emissions * 0.2),
            description: "20% reduction by using public transport or carpooling",
          })
        }

        if (categoryData.home && categoryData.home.emissions > 0) {
          savingsOpportunities.push({
            category: "home",
            title: "Energy efficiency",
            potential: Math.round(categoryData.home.emissions * 0.15),
            description: "15% reduction through better insulation and LED lighting",
          })
        }

        if (categoryData.food && categoryData.food.emissions > 0) {
          savingsOpportunities.push({
            category: "food",
            title: "Plant-based meals",
            potential: Math.round(categoryData.food.emissions * 0.3),
            description: "30% reduction by eating plant-based meals 3 days a week",
          })
        }

        // Get recent activities (last 5)
        const recentActivities = [...emissions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        setUserStats({
          totalEmissions,
          dailyAverage,
          monthlyProgress,
          treesEquivalent,
          emissionsData: emissionsData.length > 0 ? emissionsData : [],
          categoryData: categoryChartData.length > 0 ? categoryChartData : [],
          recentActivities,
          trend,
          weeklyData: weeklyDataArray,
          monthlyData: emissionsData,
          yearlyData: yearlyDataArray,
          emissionsByDay: emissionsByDayArray,
          topSources,
          comparisonData,
          savingsOpportunities,
          emissionIntensity,
        })

        console.log("Dashboard data updated successfully")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // Set up real-time listener for emissions data
  useEffect(() => {
    if (!user) return

    let unsubscribe = () => {}

    const setupRealtimeListener = async () => {
      try {
        if (isFirebaseInitialized() && db) {
          console.log("Setting up real-time listener for emissions data...")
          const emissionsRef = collection(db, "emissions")
          const q = query(emissionsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              console.log("Emissions data changed, refreshing dashboard...")
              fetchUserData()
              setRefreshKey((prev) => prev + 1) // Force re-render of charts
            },
            (error) => {
              console.error("Error in real-time listener:", error)
            },
          )

          return unsubscribe
        } else {
          // Fallback to manual refresh
          console.log("Firebase not initialized, using event listener fallback")
          fetchUserData()
        }
      } catch (error) {
        console.error("Error setting up real-time listener:", error)
        // Fallback to manual refresh
        fetchUserData()
      }
    }

    setupRealtimeListener()

    return () => {
      unsubscribe()
    }
  }, [user])

  // Listen for emission-logged events as fallback
  useEffect(() => {
    const handleEmissionLogged = () => {
      console.log("Emission logged event detected, refreshing dashboard...")
      fetchUserData()
      setRefreshKey((prev) => prev + 1) // Force re-render of charts
    }

    window.addEventListener("emission-logged", handleEmissionLogged)

    return () => {
      window.removeEventListener("emission-logged", handleEmissionLogged)
    }
  }, [])

  // Update chart title and description based on selections
  useEffect(() => {
    // Update chart title and description based on selections
    setDynamicTitle("Emissions Over Time")
    setDynamicDescription(`Your ${timeRange} carbon footprint trend`)
  }, [timeRange])

  // Animation effect for charts when they come into view
  useEffect(() => {
    if (!chartContainerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in", "fade-in", "duration-700")
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(chartContainerRef.current)

    return () => {
      if (chartContainerRef.current) {
        observer.unobserve(chartContainerRef.current)
      }
    }
  }, [])

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium capitalize">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{payload[0].value.toFixed(1)} kg CO₂</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {((payload[0].value / userStats.totalEmissions) * 100).toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  // Get background class based on card index
  const getCardBackground = (index) => {
    const backgrounds = ["card-forest", "card-water", "card-leaf", "card-mountain"]
    return backgrounds[index % backgrounds.length]
  }

  // Get gradient class based on card index
  const getCardGradient = (index) => {
    const gradients = ["card-gradient-green", "card-gradient-blue", "card-gradient-orange", "card-gradient-purple"]
    return gradients[index % gradients.length]
  }

  // Get color based on category
  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "transport":
        return COLORS.teal.primary
      case "home":
        return COLORS.amber.primary
      case "food":
        return COLORS.green.primary
      default:
        return COLORS.purple.primary
    }
  }

  // Get icon based on category
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "transport":
        return <Car className="h-4 w-4 mr-2" style={{ color: COLORS.teal.primary }} />
      case "home":
        return <Home className="h-4 w-4 mr-2" style={{ color: COLORS.amber.primary }} />
      case "food":
        return <Utensils className="h-4 w-4 mr-2" style={{ color: COLORS.green.primary }} />
      default:
        return <ShoppingBag className="h-4 w-4 mr-2" style={{ color: COLORS.purple.primary }} />
    }
  }

  // Get data for the selected time range
  const getTimeRangeData = () => {
    switch (timeRange) {
      case "weekly":
        return userStats.weeklyData
      case "yearly":
        return userStats.yearlyData
      case "monthly":
      default:
        return userStats.monthlyData
    }
  }

  // Get x-axis key for the selected time range
  const getTimeRangeKey = () => {
    switch (timeRange) {
      case "weekly":
        return "week"
      case "yearly":
        return "year"
      case "monthly":
      default:
        return "month"
    }
  }

  // Render the main chart based on selected type
  const renderMainChart = () => {
    const timeRangeData = getTimeRangeData()
    const timeRangeKey = getTimeRangeKey()

    if (timeRangeData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium">No data available</h3>
          <p className="text-sm text-muted-foreground">Log activities to see your emissions over time</p>
          <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/dashboard?tab=tracker")}>
            Log Your First Activity
          </Button>
        </div>
      )
    }

    return (
      <AreaChart
        data={timeRangeData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 20,
        }}
      >
        <defs>
          <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.green.primary} stopOpacity={0.8} />
            <stop offset="95%" stopColor={COLORS.green.primary} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey={timeRangeKey} tickLine={false} axisLine={false} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="emissions"
          stroke={COLORS.green.primary}
          fillOpacity={1}
          fill="url(#colorEmissions)"
          strokeWidth={2}
          activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.green.dark }}
        />
      </AreaChart>
    )
  }

  // Render the category chart (pie chart)
  const renderCategoryChart = () => {
    if (userStats.categoryData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium">No data available</h3>
          <p className="text-sm text-muted-foreground">Log activities to see your emissions by category</p>
          <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/dashboard?tab=tracker")}>
            Log Your First Activity
          </Button>
        </div>
      )
    }

    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart key={`pie-chart-${refreshKey}`}>
            <Pie
              data={userStats.categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="emissions"
              nameKey="category"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {userStats.categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="capitalize">{value}</span>}
            />
            <RechartsTooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Render the daily emissions chart
  const renderDailyChart = () => {
    if (!userStats.emissionsByDay || userStats.emissionsByDay.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium">No data available</h3>
          <p className="text-sm text-muted-foreground">Log activities to see your daily emission patterns</p>
          <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/dashboard?tab=tracker")}>
            Log Your First Activity
          </Button>
        </div>
      )
    }

    // Sort days of the week in correct order
    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const sortedDailyData = [...userStats.emissionsByDay]
      .sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day))
      .map((day) => ({
        name: day.day,
        value: day.average || 0,
      }))

    return (
      <BarChart
        data={sortedDailyData}
        margin={{
          top: 20,
          right: 10,
          left: 10,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={true} tick={{ fill: "var(--foreground)", fontSize: 12 }} />
        <YAxis
          tickFormatter={(value) => `${value.toFixed(1)}`}
          tick={{ fill: "var(--foreground)", fontSize: 12 }}
          tickLine={false}
          axisLine={true}
          label={{
            value: "kg CO₂",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: 12 },
          }}
        />
        <ChartTooltip
          formatter={(value) => [`${value.toFixed(1)} kg CO₂`, "Average Emissions"]}
          labelFormatter={(name) => `${name}`}
        />
        <Bar
          dataKey="value"
          fill={COLORS.amber.primary}
          radius={4}
          animationBegin={0}
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {sortedDailyData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.name === new Date().toLocaleString("default", { weekday: "short" })
                  ? COLORS.green.primary
                  : COLORS.amber.primary
              }
            />
          ))}
        </Bar>
      </BarChart>
    )
  }

  return (
    <div className="space-y-6 animated-bg nature-bg">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`eco-card ${getCardBackground(0)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CO₂ Emissions</CardTitle>
            <Leaf
              className="h-5 w-5"
              style={{ color: COLORS.green.primary }}
              className="icon-leaf animate-pulse-slow"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalEmissions.toFixed(1)} kg</div>
            <div className="flex items-center mt-1">
              {userStats.trend !== 0 && (
                <span
                  className={`text-xs flex items-center ${userStats.trend < 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {userStats.trend < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(userStats.trend).toFixed(1)}% from last period
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.totalEmissions > 0 ? (
                <span className="text-emerald-500 inline-flex items-center">
                  <ArrowDown className="mr-1 h-3 w-3" />
                  Track more to see trends
                </span>
              ) : (
                "Start tracking your emissions"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className={`eco-card ${getCardBackground(1)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Car className="h-5 w-5" style={{ color: COLORS.teal.primary }} className="icon-water animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.dailyAverage.toFixed(1)} kg</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center mt-1 cursor-help">
                    <Info className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">What's this?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  <p>Your average daily carbon emissions based on your logged activities.</p>
                  <p className="text-xs mt-1">The global average is around 22 kg CO₂ per day.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.dailyAverage > 0 ? (
                <span className="text-emerald-500 inline-flex items-center">
                  <ArrowDown className="mr-1 h-3 w-3" />
                  Based on your activities
                </span>
              ) : (
                "Log activities to calculate"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className={`eco-card ${getCardBackground(2)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
            <Home className="h-5 w-5" style={{ color: COLORS.amber.primary }} className="icon-earth" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.monthlyProgress.toFixed(0)}%</div>
            <Progress
              value={userStats.monthlyProgress}
              className="h-2 mt-1"
              indicatorClassName={`${
                userStats.monthlyProgress > 80
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : userStats.monthlyProgress > 50
                    ? "bg-gradient-to-r from-amber-500 to-amber-600"
                    : "bg-gradient-to-r from-green-500 to-green-600"
              }`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {userStats.monthlyProgress < 100
                ? `${(monthlyGoal - userStats.totalEmissions).toFixed(1)} kg remaining to reach your monthly limit`
                : "You've exceeded your monthly goal. Consider offsetting your emissions."}
            </p>
          </CardContent>
        </Card>

        <Card className={`eco-card ${getCardBackground(3)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trees Equivalent</CardTitle>
            <Leaf className="h-5 w-5" style={{ color: COLORS.green.dark }} className="icon-leaf animate-pulse-slow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.treesEquivalent} trees</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center mt-1 cursor-help">
                    <Info className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">What's this?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  <p>The number of trees needed to absorb your carbon emissions over a year.</p>
                  <p className="text-xs mt-1">One tree absorbs approximately 21.77 kg of CO₂ per year.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.treesEquivalent > 0 ? (
                <span className="text-emerald-500 inline-flex items-center">Equivalent CO₂ absorption</span>
              ) : (
                "Plant virtual trees by reducing emissions"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2" ref={chartContainerRef}>
        <Card className={`col-span-1 eco-card ${getCardGradient(0)}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{dynamicTitle}</CardTitle>
              <CardDescription>{dynamicDescription}</CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex space-x-2">
                <Button
                  variant={timeRange === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("weekly")}
                  className="h-8 text-xs"
                  style={{
                    backgroundColor: timeRange === "weekly" ? COLORS.green.primary : "",
                    borderColor: timeRange !== "weekly" ? COLORS.green.primary : "",
                  }}
                >
                  Weekly
                </Button>
                <Button
                  variant={timeRange === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("monthly")}
                  className="h-8 text-xs"
                  style={{
                    backgroundColor: timeRange === "monthly" ? COLORS.green.primary : "",
                    borderColor: timeRange !== "monthly" ? COLORS.green.primary : "",
                  }}
                >
                  Monthly
                </Button>
                <Button
                  variant={timeRange === "yearly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("yearly")}
                  className="h-8 text-xs"
                  style={{
                    backgroundColor: timeRange === "yearly" ? COLORS.green.primary : "",
                    borderColor: timeRange !== "yearly" ? COLORS.green.primary : "",
                  }}
                >
                  Yearly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              key={`main-chart-${refreshKey}-${timeRange}`}
              config={{
                emissions: {
                  label: "CO₂ Emissions (kg)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="aspect-[4/3]"
            >
              {renderMainChart()}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className={`col-span-1 eco-card ${getCardGradient(1)}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Emissions by Category</CardTitle>
              <CardDescription>Breakdown of your carbon sources</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)} className="h-8 px-2">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ChartContainer
              key={`category-chart-${refreshKey}`}
              config={{
                emissions: {
                  label: "CO₂ Emissions (kg)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="aspect-[4/3]"
            >
              {renderCategoryChart()}
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`col-span-1 eco-card ${getCardGradient(2)}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daily Emission Patterns</CardTitle>
              <CardDescription>Your carbon footprint by day of week</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)} className="h-8 px-2">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ChartContainer
              key={`daily-chart-${refreshKey}`}
              config={{
                value: {
                  label: "Average Emissions (kg)",
                  color: COLORS.amber.primary,
                },
              }}
              className="aspect-[4/3]"
            >
              {renderDailyChart()}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className={`eco-card ${getCardGradient(3)}  `}>
          <CardHeader>
            <CardTitle>Top Emission Sources</CardTitle>
            <CardDescription>Your biggest carbon footprint contributors</CardDescription>
          </CardHeader>
          <CardContent>
            {userStats.topSources.length > 0 ? (
              <div className="space-y-4">
                {userStats.topSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getCategoryIcon(source.category)}
                        <span className="font-medium capitalize">{source.category}</span>
                      </div>
                      <div className="text-sm">
                        {source.emissions.toFixed(1)} kg ({source.percentage.toFixed(0)}%)
                      </div>
                    </div>
                    <Progress
                      value={source.percentage}
                      className="h-2"
                      indicatorClassName="bg-gradient-to-r"
                      style={{
                        background: `linear-gradient(to right, ${getCategoryColor(source.category)}33, ${getCategoryColor(source.category)}11)`,
                      }}
                      indicatorStyle={{
                        background: getCategoryColor(source.category),
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <PieChartIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-medium">No data available</h3>
                <p className="text-sm text-muted-foreground">Log activities to see your top emission sources</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={`eco-card ${getCardGradient(0)}`}>
        <PersonalizedSuggestions />
      </Card>

      <Card className={`eco-card ${getCardGradient(1)}`}>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest logged emissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-eco-leaf rounded-full border-t-transparent"></div>
            </div>
          ) : userStats.recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activities logged yet. Start tracking your emissions!</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => (window.location.href = "/dashboard?tab=tracker")}
              >
                Log Your First Activity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userStats.recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b pb-2 p-2 rounded-md transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center">
                    {activity.category === "transport" ? (
                      <Car className="h-4 w-4 mr-2" style={{ color: COLORS.teal.primary }} />
                    ) : activity.category === "home" ? (
                      <Home className="h-4 w-4 mr-2" style={{ color: COLORS.amber.primary }} />
                    ) : activity.category === "food" ? (
                      <Utensils className="h-4 w-4 mr-2" style={{ color: COLORS.green.primary }} />
                    ) : (
                      <ShoppingBag className="h-4 w-4 mr-2" style={{ color: COLORS.purple.primary }} />
                    )}
                    <div>
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">{activity.emissions.toFixed(1)} kg CO₂</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`eco-card ${getCardGradient(2)}`}>
        <DailyChallenge />
      </Card>
    </div>
  )
}

