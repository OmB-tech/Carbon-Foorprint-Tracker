"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-context"
import { getUserBadges } from "@/lib/data-service"
import { Award, Lock } from "lucide-react"

const badgeColors = {
  bronze: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  silver: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  gold: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  platinum: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
}

const allBadges = [
  {
    id: "transport-hero",
    name: "Transport Hero",
    description: "Reduced transport emissions by 20%",
    tier: "bronze",
    category: "transport",
  },
  {
    id: "transport-champion",
    name: "Transport Champion",
    description: "Reduced transport emissions by 50%",
    tier: "silver",
    category: "transport",
  },
  {
    id: "energy-saver",
    name: "Energy Saver",
    description: "Reduced home energy emissions by 15%",
    tier: "bronze",
    category: "home",
  },
  {
    id: "energy-master",
    name: "Energy Master",
    description: "Reduced home energy emissions by 30%",
    tier: "silver",
    category: "home",
  },
  {
    id: "food-conscious",
    name: "Food Conscious",
    description: "Logged 10 vegetarian meals",
    tier: "bronze",
    category: "food",
  },
  {
    id: "food-champion",
    name: "Food Champion",
    description: "Reduced food emissions by 25%",
    tier: "silver",
    category: "food",
  },
  {
    id: "waste-warrior",
    name: "Waste Warrior",
    description: "Logged recycling activities for 2 weeks",
    tier: "bronze",
    category: "waste",
  },
  {
    id: "challenge-taker",
    name: "Challenge Taker",
    description: "Completed 5 daily challenges",
    tier: "bronze",
    category: "challenges",
  },
  {
    id: "challenge-master",
    name: "Challenge Master",
    description: "Completed 20 daily challenges",
    tier: "gold",
    category: "challenges",
  },
  {
    id: "carbon-reducer",
    name: "Carbon Reducer",
    description: "Reduced total emissions by 10%",
    tier: "silver",
    category: "overall",
  },
  {
    id: "climate-hero",
    name: "Climate Hero",
    description: "Reduced total emissions by 30%",
    tier: "platinum",
    category: "overall",
  },
]

export function UserBadges() {
  const { user } = useAuth()
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return

      try {
        const badgesData = await getUserBadges(user.uid)
        setUserBadges(badgesData.map((badge: any) => badge.badgeId))
      } catch (error) {
        console.error("Error fetching badges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [user])

  const getBadgeColor = (tier: string) => {
    return badgeColors[tier as keyof typeof badgeColors] || "bg-gray-100 text-gray-800"
  }

  const groupedBadges = allBadges.reduce(
    (acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = []
      }
      acc[badge.category].push(badge)
      return acc
    },
    {} as Record<string, typeof allBadges>,
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-2">Loading badges...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Your Achievements
        </CardTitle>
        <CardDescription>Badges earned through your sustainability journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedBadges).map(([category, badges]) => (
            <div key={category}>
              <h3 className="text-sm font-medium mb-2 capitalize">{category} Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => {
                  const isEarned = userBadges.includes(badge.id)

                  return (
                    <div
                      key={badge.id}
                      className="relative group"
                      title={isEarned ? badge.description : `Locked: ${badge.description}`}
                    >
                      <Badge
                        className={`${isEarned ? getBadgeColor(badge.tier) : "bg-gray-100 text-gray-400"} 
                                  transition-all duration-200`}
                      >
                        {badge.name}
                        {!isEarned && <Lock className="h-3 w-3 ml-1 inline" />}
                      </Badge>

                      <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <p className="font-medium">{badge.name}</p>
                        <p className="mt-1">{badge.description}</p>
                        {!isEarned && <p className="mt-1 text-muted-foreground">Complete this achievement to unlock</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

