"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-context"
import { getLeaderboard } from "@/lib/data-service"
import { Trophy, Users } from "lucide-react"

export function Leaderboard() {
  const { user } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard(10)
        setLeaderboardData(data)

        if (user) {
          // Find user's rank
          const userIndex = data.findIndex((entry: any) => entry.userId === user.uid)
          if (userIndex !== -1) {
            setUserRank(userIndex + 1)
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-2">Loading leaderboard...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Community Leaderboard
        </CardTitle>
        <CardDescription>Top carbon reducers in your community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2">No data available yet. Be the first to join the leaderboard!</p>
            </div>
          ) : (
            leaderboardData.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index < 3 ? "bg-muted/50 border" : ""
                } ${entry.userId === user?.uid ? "border-2 border-primary/50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : index === 1
                          ? "bg-gray-100 text-gray-800"
                          : index === 2
                            ? "bg-amber-100 text-amber-800"
                            : ""
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar>
                    <AvatarImage src={entry.photoURL || ""} alt={entry.name} />
                    <AvatarFallback>{getInitials(entry.name || "User")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{entry.name || "Anonymous User"}</p>
                    <p className="text-xs text-muted-foreground">Carbon reduction: {entry.totalReduction || 0}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{entry.points || 0}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))
          )}
        </div>

        {userRank && userRank > 10 && (
          <div className="mt-4 p-3 rounded-lg border-2 border-primary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold">{userRank}</div>
                <Avatar>
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                  <AvatarFallback>{getInitials(user?.displayName || "You")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">You</p>
                  <p className="text-xs text-muted-foreground">Keep going to climb the ranks!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{leaderboardData.find((entry) => entry.userId === user?.uid)?.points || 0}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

