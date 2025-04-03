"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, Home, Leaf, ShoppingBag, Utensils } from "lucide-react"
import { getRecentActivitiesForAllUsers } from "@/lib/data-service"

type Activity = {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  category: string
  activity: string
  emissions: number
  date: string
  createdAt: any
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getRecentActivitiesForAllUsers(20)
        setActivities(data)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "transport":
        return <Car className="h-4 w-4 text-blue-500" />
      case "home":
        return <Home className="h-4 w-4 text-orange-500" />
      case "food":
        return <Utensils className="h-4 w-4 text-green-500" />
      case "shopping":
        return <ShoppingBag className="h-4 w-4 text-purple-500" />
      default:
        return <Leaf className="h-4 w-4 text-emerald-500" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Leaf className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-2">Loading recent activities...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Community Activities</CardTitle>
        <CardDescription>See what others in the community are doing to reduce their carbon footprint</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2">No activities recorded yet. Be the first to log an activity!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                <Avatar>
                  <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                  <AvatarFallback>{getInitials(activity.userName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{activity.userName}</p>
                    <Badge variant="outline" className="flex items-center">
                      {getCategoryIcon(activity.category)}
                      <span className="ml-1">{activity.category}</span>
                    </Badge>
                  </div>
                  <p>{activity.activity}</p>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatDate(activity.date)}</span>
                    <span>{activity.emissions.toFixed(1)} kg CO₂</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-4">
          Load More Activities
        </Button>
      </CardContent>
    </Card>
  )
}

