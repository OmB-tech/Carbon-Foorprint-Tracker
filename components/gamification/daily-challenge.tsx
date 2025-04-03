"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { getDailyChallenges, acceptChallenge, completeChallenge, getUserChallenges } from "@/lib/data-service"

export function DailyChallenge() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<any[]>([])
  const [userChallenges, setUserChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return

      try {
        const [challengesData, userChallengesData] = await Promise.all([
          getDailyChallenges(),
          getUserChallenges(user.uid),
        ])

        setChallenges(challengesData)
        setUserChallenges(userChallengesData)
      } catch (error) {
        console.error("Error fetching challenges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [user])

  const handleAcceptChallenge = async (challengeId: string) => {
    if (!user) return

    try {
      const userChallengeRef = await acceptChallenge(user.uid, challengeId)
      // Refresh user challenges
      const updatedUserChallenges = await getUserChallenges(user.uid)
      setUserChallenges(updatedUserChallenges)
    } catch (error) {
      console.error("Error accepting challenge:", error)
    }
  }

  const handleCompleteChallenge = async (userChallengeId: string) => {
    try {
      await completeChallenge(userChallengeId)
      // Refresh user challenges
      const updatedUserChallenges = await getUserChallenges(user.uid)
      setUserChallenges(updatedUserChallenges)
    } catch (error) {
      console.error("Error completing challenge:", error)
    }
  }

  const getChallengeStatus = (challengeId: string) => {
    const userChallenge = userChallenges.find((uc) => uc.challengeId === challengeId)
    if (!userChallenge) return "not-started"
    return userChallenge.status
  }

  const getUserChallengeId = (challengeId: string) => {
    const userChallenge = userChallenges.find((uc) => uc.challengeId === challengeId)
    return userChallenge?.id
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-2">Loading challenges...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Daily Challenges
        </CardTitle>
        <CardDescription>Complete challenges to earn points and badges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active challenges at the moment. Check back later!</p>
          </div>
        ) : (
          challenges.map((challenge) => {
            const status = getChallengeStatus(challenge.id)
            const userChallengeId = getUserChallengeId(challenge.id)

            return (
              <div key={challenge.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  {status === "completed" && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                    {challenge.points} points
                  </span>

                  {status === "not-started" ? (
                    <Button size="sm" onClick={() => handleAcceptChallenge(challenge.id)}>
                      Accept Challenge
                    </Button>
                  ) : status === "accepted" ? (
                    <Button size="sm" variant="outline" onClick={() => handleCompleteChallenge(userChallengeId)}>
                      Mark as Completed
                    </Button>
                  ) : (
                    <span className="text-green-600 font-medium">Completed</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">Completing challenges helps reduce your carbon footprint</div>
      </CardFooter>
    </Card>
  )
}

