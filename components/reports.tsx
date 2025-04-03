"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  Filter,
  AlertCircle,
  BarChart2,
  LineChartIcon,
  Activity,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { getUserEmissions } from "@/lib/data-service"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

export default function Reports() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState("monthly")
  const [category, setCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [chartType, setChartType] = useState("line") // line, bar, area, pie
  const [dateRange, setDateRange] = useState("all") // all, week, month, year
  const [refreshKey, setRefreshKey] = useState(0)
  const [dynamicTitle, setDynamicTitle] = useState("Emissions Over Time")
  const [dynamicDescription, setDynamicDescription] = useState("Track your carbon footprint trends")
  const chartContainerRef = useRef(null)

  const [reportData, setReportData] = useState({
    monthlyData: [],
    weeklyData: [],
    yearlyData: [],
    categoryData: [],
    activityData: [],
    totalEmissions: 0,
    monthlyAverage: 0,
    biggestSource: { category: "", percentage: 0 },
    trend: 0,
    emissionsByDay: [],
    topSources: [],
    comparisonData: {
      user: 0,
      community: 0,
      global: 0,
    },
    savingsOpportunities: [],
    emissionIntensity: 0,
    reductionGoals: {
      current: 0,
      target: 200,
      progress: 0,
    },
    carbonScore: 0,
    historicalData: [],
    forecastData: [],
  })

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError("")

        // Fetch user emissions
        const emissions = await getUserEmissions(user.uid)

        if (emissions.length === 0) {
          setLoading(false)
          return
        }

        // Calculate total emissions
        const totalEmissions = emissions.reduce((sum, e) => sum + (e.emissions || 0), 0)

        // Calculate monthly average
        const uniqueMonths = new Set()
        emissions.forEach((e) => {
          const date = new Date(e.date)
          uniqueMonths.add(`${date.getFullYear()}-${date.getMonth()}`)
        })
        const monthlyAverage = totalEmissions / Math.max(1, uniqueMonths.size)

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
          const year = date.getFullYear()
          const key = `${month} ${year}`

          if (!acc[key]) acc[key] = { month: key, emissions: 0, target: 150 }
          acc[key].emissions += e.emissions || 0
          return acc
        }, {})

        // Group by week for chart data
        const weeklyData = emissions.reduce((acc, e) => {
          const date = new Date(e.date)
          const weekNumber = getWeekNumber(date)
          const year = date.getFullYear()
          const weekLabel = `Week ${weekNumber}, ${year}`

          if (!acc[weekLabel]) acc[weekLabel] = { week: weekLabel, emissions: 0, target: 40 }
          acc[weekLabel].emissions += e.emissions || 0
          return acc
        }, {})

        // Group by year for chart data
        const yearlyData = emissions.reduce((acc, e) => {
          const date = new Date(e.date)
          const year = date.getFullYear().toString()

          if (!acc[year]) acc[year] = { year, emissions: 0, target: 2000 }
          acc[year].emissions += e.emissions || 0
          return acc
        }, {})

        // Group by category
        const categoryData = emissions.reduce((acc, e) => {
          if (!acc[e.category]) acc[e.category] = { category: e.category, emissions: 0 }
          acc[e.category].emissions += e.emissions || 0
          return acc
        }, {})

        // Find biggest source
        let biggestCategory = ""
        let biggestAmount = 0
        Object.entries(categoryData).forEach(([category, data]) => {
          if (data.emissions > biggestAmount) {
            biggestAmount = data.emissions
            biggestCategory = category
          }
        })

        const biggestSourcePercentage = (biggestAmount / totalEmissions) * 100

        // Group by day of week
        const emissionsByDay = emissions.reduce((acc, e) => {
          const date = new Date(e.date)
          const day = date.toLocaleString("default", { weekday: "short" })

          if (!acc[day]) acc[day] = { day, emissions: 0, count: 0 }
          acc[day].emissions += e.emissions || 0
          acc[day].count += 1
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

        // Create comparison data (mock data for community and global)
        const comparisonData = {
          user: monthlyAverage,
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

        // Calculate carbon score (0-100)
        // Lower emissions = higher score
        const carbonScore = Math.max(0, Math.min(100, 100 - (monthlyAverage / 20) * 100))

        // Generate historical data (last 12 months)
        const historicalData = []
        const today = new Date()
        for (let i = 11; i >= 0; i--) {
          const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const monthStr = month.toLocaleString("default", { month: "short" })
          const yearStr = month.getFullYear()
          const key = `${monthStr} ${yearStr}`

          historicalData.push({
            date: key,
            emissions: monthlyData[key]?.emissions || 0,
          })
        }

        // Generate forecast data (next 3 months)
        const forecastData = []
        // Simple linear regression based on last 3 months
        const last3Months = historicalData.slice(-3)
        const trend3Month = 0
        if (last3Months.length === 3) {
          const avgChange = (last3Months[2].emissions - last3Months[0].emissions) / 2
          for (let i = 1; i <= 3; i++) {
            const month = new Date(today.getFullYear(), today.getMonth() + i, 1)
            const monthStr = month.toLocaleString("default", { month: "short" })
            const yearStr = month.getFullYear()

            forecastData.push({
              date: `${monthStr} ${yearStr}`,
              emissions: Math.max(0, last3Months[2].emissions + avgChange * i),
            })
          }
        }

        // Format activity data
        const activityData = emissions
          .map((e) => ({
            id: e.id,
            date: e.date,
            activity: e.activity,
            category: e.category,
            emissions: e.emissions || 0,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Filter activities by category if needed
        const filteredActivities =
          category === "all"
            ? activityData
            : activityData.filter((item) => item.category.toLowerCase() === category.toLowerCase())

        // Calculate reduction goals
        const reductionGoals = {
          current: totalEmissions,
          target: 200, // Example target
          progress: Math.min(100, (totalEmissions / 200) * 100),
        }

        setReportData({
          monthlyData: Object.values(monthlyData),
          weeklyData: Object.values(weeklyData),
          yearlyData: Object.values(yearlyData),
          categoryData: Object.entries(categoryData).map(([category, data], index) => ({
            category,
            emissions: data.emissions,
            fill: CHART_COLORS[index % CHART_COLORS.length],
          })),
          activityData: filteredActivities,
          totalEmissions,
          monthlyAverage,
          biggestSource: {
            category: biggestCategory,
            percentage: biggestSourcePercentage,
          },
          trend,
          emissionsByDay: Object.values(emissionsByDay).map((item) => ({
            ...item,
            average: item.emissions / item.count,
          })),
          topSources,
          comparisonData,
          savingsOpportunities,
          emissionIntensity,
          reductionGoals,
          carbonScore,
          historicalData,
          forecastData,
        })
      } catch (error) {
        console.error("Error fetching report data:", error)
        setError("Failed to load report data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [user, category])

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // Update chart title and description based on selections
  useEffect(() => {
    if (timeframe === "weekly") {
      setDynamicTitle("Weekly Emissions")
      setDynamicDescription("Your carbon footprint by week")
    } else if (timeframe === "monthly") {
      setDynamicTitle("Monthly Emissions")
      setDynamicDescription("Your carbon footprint by month")
    } else if (timeframe === "yearly") {
      setDynamicTitle("Yearly Emissions")
      setDynamicDescription("Your carbon footprint by year")
    }
  }, [timeframe])

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

  // Get data for the selected time range
  const getTimeRangeData = () => {
    switch (timeframe) {
      case "weekly":
        return reportData.weeklyData
      case "yearly":
        return reportData.yearlyData
      case "monthly":
      default:
        return reportData.monthlyData
    }
  }

  // Get x-axis key for the selected time range
  const getTimeRangeKey = () => {
    switch (timeframe) {
      case "weekly":
        return "week"
      case "yearly":
        return "year"
      case "monthly":
      default:
        return "month"
    }
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

  // Render the main chart based on selected type and timeframe
  const renderMainChart = () => {
    const timeRangeData = getTimeRangeData()
    const timeRangeKey = getTimeRangeKey()

    if (timeRangeData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium">No data available</h3>
          <p className="text-sm text-muted-foreground">Log activities to generate reports</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/dashboard?tab=tracker")}>
            Log Activities
          </Button>
        </div>
      )
    }

    if (chartType === "line") {
      return (
        <LineChart
          data={timeRangeData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey={timeRangeKey} tickLine={false} axisLine={false} />
          <YAxis hide />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="emissions"
            stroke={COLORS.green.primary}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 0, fill: COLORS.green.primary }}
            activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.green.dark }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke={COLORS.amber.primary}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, strokeWidth: 0, fill: COLORS.amber.primary }}
          />
        </LineChart>
      )
    } else if (chartType === "bar") {
      return (
        <BarChart
          data={timeRangeData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
          <XAxis dataKey={timeRangeKey} tickLine={false} axisLine={false} />
          <YAxis hide />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="emissions" fill={COLORS.green.primary} radius={4} />
          <Bar dataKey="target" fill={COLORS.amber.primary} radius={4} />
        </BarChart>
      )
    } else if (chartType === "area") {
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
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.amber.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.amber.primary} stopOpacity={0.1} />
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
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke={COLORS.amber.primary}
            fillOpacity={1}
            fill="url(#colorTarget)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </AreaChart>
      )
    } else if (chartType === "pie") {
      return (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reportData.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="emissions"
                nameKey="category"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {reportData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    }
  }

  // Render the forecast chart
  const renderForecastChart = () => {
    const combinedData = [...reportData.historicalData.slice(-3), ...reportData.forecastData]

    if (combinedData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium">No data available</h3>
          <p className="text-sm text-muted-foreground">Log more activities to generate forecasts</p>
        </div>
      )
    }

    return (
      <LineChart
        data={combinedData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis hide />
        <ChartTooltip />
        <Line
          type="monotone"
          dataKey="emissions"
          stroke={COLORS.green.primary}
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 0, fill: COLORS.green.primary }}
          activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.green.dark }}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={COLORS.purple.primary}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 4, strokeWidth: 0, fill: COLORS.purple.primary }}
        />
      </LineChart>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <p className="mt-2">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (reportData.activityData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="font-medium mt-2">No data available</h3>
          <p className="text-muted-foreground">Log activities to generate reports</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/dashboard?tab=tracker")}>
            Log Activities
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animated-bg nature-bg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Carbon Emissions Reports</h2>
          <p className="text-muted-foreground">Analyze your carbon footprint data and track your progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`eco-card eco-card-hover ${getCardBackground(0)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: COLORS.green.primary }}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalEmissions.toFixed(1)} kg CO₂</div>
            <div className="flex items-center mt-1">
              {reportData.trend !== 0 && (
                <span
                  className={`text-xs flex items-center ${reportData.trend < 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {reportData.trend < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(reportData.trend).toFixed(1)}% from last period
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Based on your logged activities</p>
          </CardContent>
        </Card>

        <Card className={`eco-card eco-card-hover ${getCardBackground(1)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: COLORS.teal.primary }}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.monthlyAverage.toFixed(1)} kg CO₂</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center mt-1 cursor-help">
                    <span className="text-xs text-muted-foreground">What's this?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  <p>Your average monthly carbon emissions based on your logged activities.</p>
                  <p className="text-xs mt-1">The global average is around 400 kg CO₂ per month.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-xs text-muted-foreground">Average monthly emissions</p>
          </CardContent>
        </Card>

        <Card className={`eco-card eco-card-hover ${getCardBackground(2)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biggest Source</CardTitle>
            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: COLORS.amber.primary }}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{reportData.biggestSource.category}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.biggestSource.percentage.toFixed(0)}% of your total emissions
            </p>
          </CardContent>
        </Card>

        <Card className={`eco-card eco-card-hover ${getCardBackground(3)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Score</CardTitle>
            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: COLORS.terracotta.primary }}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.carbonScore.toFixed(0)}/100</div>
            <Progress
              value={reportData.carbonScore}
              className="h-2 mt-1"
              indicatorClassName={`${
                reportData.carbonScore > 80
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : reportData.carbonScore > 50
                    ? "bg-gradient-to-r from-amber-500 to-amber-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {reportData.carbonScore > 80
                ? "Excellent! You're making a positive impact."
                : reportData.carbonScore > 50
                  ? "Good progress. Keep reducing your emissions."
                  : "Room for improvement. Check our suggestions."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gradient-to-r from-green-50/80 to-teal-50/80 dark:from-green-900/20 dark:to-teal-900/20 p-1 rounded-lg shadow-md">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
          >
            Trends
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
          >
            Activities
          </TabsTrigger>
          <TabsTrigger
            value="forecast"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
          >
            Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2" ref={chartContainerRef}>
            <Card className={`col-span-1 eco-card eco-card-hover ${getCardGradient(0)}`}>
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{dynamicTitle}</CardTitle>
                    <CardDescription>{dynamicDescription}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={chartType === "line" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("line")}
                      className="h-8 px-2"
                      style={{
                        backgroundColor: chartType === "line" ? COLORS.green.primary : "",
                        borderColor: chartType !== "line" ? COLORS.green.primary : "",
                      }}
                    >
                      <LineChartIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={chartType === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("bar")}
                      className="h-8 px-2"
                      style={{
                        backgroundColor: chartType === "bar" ? COLORS.amber.primary : "",
                        borderColor: chartType !== "bar" ? COLORS.amber.primary : "",
                      }}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={chartType === "area" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("area")}
                      className="h-8 px-2"
                      style={{
                        backgroundColor: chartType === "area" ? COLORS.teal.primary : "",
                        borderColor: chartType !== "area" ? COLORS.teal.primary : "",
                      }}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  key={`main-chart-${refreshKey}-${chartType}-${timeframe}`}
                  config={{
                    emissions: {
                      label: "CO₂ Emissions (kg)",
                      color: COLORS.green.primary,
                    },
                    target: {
                      label: "Target Emissions (kg)",
                      color: COLORS.amber.primary,
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  {renderMainChart()}
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className={`col-span-1 eco-card eco-card-hover ${getCardGradient(1)}`}>
              <CardHeader>
                <CardTitle>Emissions by Category</CardTitle>
                <CardDescription>Breakdown of your carbon sources</CardDescription>
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
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="emissions"
                          nameKey="category"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {reportData.categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className={`eco-card eco-card-hover ${getCardGradient(2)}`}>
              <CardHeader>
                <CardTitle>Top Emission Sources</CardTitle>
                <CardDescription>Your biggest carbon footprint contributors</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.topSources.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.topSources.map((source, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className="h-4 w-4 mr-2 rounded-full"
                              style={{ backgroundColor: getCategoryColor(source.category) }}
                            ></div>
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
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No data available</h3>
                    <p className="text-sm text-muted-foreground">Log activities to see your top emission sources</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={`eco-card eco-card-hover ${getCardGradient(3)}`}>
              <CardHeader>
                <CardTitle>Emission Reduction Opportunities</CardTitle>
                <CardDescription>Potential savings based on your activity patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.savingsOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.savingsOpportunities.map((opportunity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-muted/20 transition-colors"
                      >
                        <div className="mt-1">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: getCategoryColor(opportunity.category) }}
                          ></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{opportunity.title}</h3>
                          <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg" style={{ color: getCategoryColor(opportunity.category) }}>
                            {opportunity.potential} kg
                          </div>
                          <div className="text-xs text-muted-foreground">potential savings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No data available</h3>
                    <p className="text-sm text-muted-foreground">
                      Log more activities to get personalized savings opportunities
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className={`eco-card eco-card-hover ${getCardGradient(0)}`}>
            <CardHeader>
              <CardTitle>Emission Trends</CardTitle>
              <CardDescription>Your carbon footprint over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                key={`trends-chart-${refreshKey}`}
                config={{
                  emissions: {
                    label: "CO₂ Emissions (kg)",
                    color: COLORS.green.primary,
                  },
                }}
                className="h-[400px]"
              >
                <AreaChart
                  data={reportData.monthlyData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.green.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.green.primary} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="emissions"
                    stroke={COLORS.green.primary}
                    fill="url(#colorEmissions)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className={`eco-card eco-card-hover ${getCardGradient(1)}`}>
              <CardHeader>
                <CardTitle>Daily Emission Patterns</CardTitle>
                <CardDescription>Your carbon footprint by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  key={`daily-chart-${refreshKey}`}
                  config={{
                    average: {
                      label: "Average Emissions (kg)",
                      color: COLORS.amber.primary,
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <BarChart
                    data={reportData.emissionsByDay}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <ChartTooltip
                      formatter={(value) => [`${value.toFixed(1)} kg CO₂`, "Average Emissions"]}
                      labelFormatter={(name) => name}
                    />
                    <Bar dataKey="average" fill={COLORS.amber.primary} radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className={`eco-card eco-card-hover ${getCardGradient(2)}`}>
              <CardHeader>
                <CardTitle>Emissions Comparison</CardTitle>
                <CardDescription>How you compare to averages</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  key={`comparison-chart-${refreshKey}`}
                  config={{
                    value: {
                      label: "Daily Emissions (kg)",
                      color: COLORS.teal.primary,
                    },
                  }}
                  className="aspect-[4/3]"
                >
                  <BarChart
                    data={[
                      { name: "You", value: reportData.comparisonData.user, fill: COLORS.green.primary },
                      { name: "Community", value: reportData.comparisonData.community, fill: COLORS.amber.primary },
                      { name: "Global", value: reportData.comparisonData.global, fill: COLORS.terracotta.primary },
                    ]}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <ChartTooltip
                      formatter={(value) => [`${value.toFixed(1)} kg CO₂/day`, "Daily Emissions"]}
                      labelFormatter={(name) => name}
                    />
                    <Bar dataKey="value" radius={4}>
                      {[
                        { fill: COLORS.green.primary },
                        { fill: COLORS.amber.primary },
                        { fill: COLORS.terracotta.primary },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card className={`eco-card eco-card-hover ${getCardGradient(0)}`}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Detailed record of your carbon-emitting activities</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Emissions (kg CO₂)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.activityData.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                      <TableCell>{activity.activity}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            color: getCategoryColor(activity.category),
                            borderColor: getCategoryColor(activity.category),
                          }}
                        >
                          {activity.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{activity.emissions.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card className={`eco-card eco-card-hover ${getCardGradient(0)}`}>
            <CardHeader>
              <CardTitle>Emissions Forecast</CardTitle>
              <CardDescription>Projected emissions based on your current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                key={`forecast-chart-${refreshKey}`}
                config={{
                  emissions: {
                    label: "Historical Emissions (kg)",
                    color: COLORS.green.primary,
                  },
                  forecast: {
                    label: "Forecasted Emissions (kg)",
                    color: COLORS.purple.primary,
                  },
                }}
                className="h-[400px]"
              >
                {renderForecastChart()}
              </ChartContainer>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">About This Forecast</h3>
                <p className="text-sm text-muted-foreground">
                  This forecast is based on your recent emission patterns. It's a projection of what your emissions
                  might look like if current trends continue. Take action now to reduce your future carbon footprint.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`eco-card eco-card-hover ${getCardGradient(1)}`}>
            <CardHeader>
              <CardTitle>Reduction Goals</CardTitle>
              <CardDescription>Track your progress towards emission reduction targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {reportData.reductionGoals.current.toFixed(1)} kg CO₂</span>
                    <span>Target: {reportData.reductionGoals.target} kg CO₂</span>
                  </div>
                  <Progress
                    value={reportData.reductionGoals.progress}
                    className="h-3"
                    indicatorClassName={`${
                      reportData.reductionGoals.progress > 80
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : reportData.reductionGoals.progress > 50
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {reportData.reductionGoals.progress < 100
                      ? `${(reportData.reductionGoals.target - reportData.reductionGoals.current).toFixed(1)} kg remaining to reach your target`
                      : "You've exceeded your target. Consider setting a more ambitious goal."}
                  </p>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="border rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground">Potential Annual Savings</h3>
                    <p className="text-3xl font-bold" style={{ color: COLORS.green.primary }}>
                      {reportData.savingsOpportunities.reduce((sum, item) => sum + item.potential, 0)} kg
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground">Carbon Score Improvement</h3>
                    <p className="text-3xl font-bold" style={{ color: COLORS.amber.primary }}>
                      +{Math.min(100 - reportData.carbonScore, 20).toFixed(0)} pts
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Recommended Actions</h3>
                  <ul className="space-y-2">
                    {reportData.savingsOpportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div
                          className="h-4 w-4 mt-1 rounded-full"
                          style={{ backgroundColor: getCategoryColor(opportunity.category) }}
                        ></div>
                        <span className="text-sm">{opportunity.description}</span>
                      </li>
                    ))}
                    {reportData.savingsOpportunities.length === 0 && (
                      <li className="text-sm text-muted-foreground">
                        Log more activities to get personalized recommendations
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

