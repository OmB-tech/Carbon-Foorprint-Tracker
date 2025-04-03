"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Leaf,
  Trophy,
  Users,
  AlertCircle,
  Bike,
  Zap,
  Droplet,
  Recycle,
  Wind,
  Sun,
  Coffee,
  Car,
  Utensils,
} from "lucide-react"
import { DailyChallenge } from "@/components/gamification/daily-challenge"
import { UserBadges } from "@/components/gamification/badges"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { CarbonQuiz } from "@/components/gamification/carbon-quiz"
import { useAuth } from "@/components/auth/auth-context"
import { useToast } from "@/components/ui/use-toast"

const challenges = [
  {
    id: 1,
    title: "No Car Week",
    description: "Avoid using your car for an entire week",
    participants: 245,
    duration: "7 days",
    startDate: "2023-07-20",
    category: "Transport",
    difficulty: "Medium",
    impact: "Save up to 30kg CO₂",
    joined: false,
    icon: <Car className="h-5 w-5 text-teal-500" />,
    color: "bg-teal-100 dark:bg-teal-900/30",
    borderColor: "border-teal-300 dark:border-teal-700",
  },
  {
    id: 2,
    title: "Meatless Month",
    description: "Go vegetarian for 30 days and reduce your food emissions",
    participants: 189,
    duration: "30 days",
    startDate: "2023-07-15",
    category: "Food",
    difficulty: "Hard",
    impact: "Save up to 100kg CO₂",
    joined: true,
    progress: 40,
    icon: <Utensils className="h-5 w-5 text-green-500" />,
    color: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-300 dark:border-green-700",
  },
  {
    id: 3,
    title: "Energy Saver",
    description: "Reduce your home energy consumption by 20%",
    participants: 312,
    duration: "14 days",
    startDate: "2023-07-25",
    category: "Home",
    difficulty: "Easy",
    impact: "Save up to 50kg CO₂",
    joined: false,
    icon: <Zap className="h-5 w-5 text-amber-500" />,
    color: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
  },
  {
    id: 4,
    title: "Zero Waste Weekend",
    description: "Produce no landfill waste for an entire weekend",
    participants: 156,
    duration: "2 days",
    startDate: "2023-07-22",
    category: "Lifestyle",
    difficulty: "Medium",
    impact: "Save up to 5kg CO₂",
    joined: false,
    icon: <Recycle className="h-5 w-5 text-purple-500" />,
    color: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700",
  },
  {
    id: 5,
    title: "Bike to Work",
    description: "Use a bicycle for your daily commute for a week",
    participants: 278,
    duration: "7 days",
    startDate: "2023-08-01",
    category: "Transport",
    difficulty: "Medium",
    impact: "Save up to 25kg CO₂",
    joined: false,
    icon: <Bike className="h-5 w-5 text-teal-500" />,
    color: "bg-teal-100 dark:bg-teal-900/30",
    borderColor: "border-teal-300 dark:border-teal-700",
  },
  {
    id: 6,
    title: "Water Conservation",
    description: "Reduce your water usage by 30% for two weeks",
    participants: 203,
    duration: "14 days",
    startDate: "2023-08-05",
    category: "Home",
    difficulty: "Easy",
    impact: "Save up to 15kg CO₂",
    joined: false,
    icon: <Droplet className="h-5 w-5 text-blue-500" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
  },
  {
    id: 7,
    title: "Local Food Only",
    description: "Eat only locally produced food for a week",
    participants: 167,
    duration: "7 days",
    startDate: "2023-08-10",
    category: "Food",
    difficulty: "Medium",
    impact: "Save up to 20kg CO₂",
    joined: false,
    icon: <Coffee className="h-5 w-5 text-green-500" />,
    color: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-300 dark:border-green-700",
  },
  {
    id: 8,
    title: "Renewable Energy Switch",
    description: "Switch to a renewable energy provider",
    participants: 342,
    duration: "Permanent",
    startDate: "2023-08-15",
    category: "Home",
    difficulty: "Hard",
    impact: "Save up to 200kg CO₂",
    joined: false,
    icon: <Sun className="h-5 w-5 text-amber-500" />,
    color: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
  },
]

export default function Community() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [joinedChallenges, setJoinedChallenges] = useState(challenges.filter((challenge) => challenge.joined))
  const [activeTab, setActiveTab] = useState("challenges")
  const [animateCard, setAnimateCard] = useState(null)

  const handleJoinChallenge = (challengeId) => {
    setAnimateCard(challengeId)

    setTimeout(() => {
      const updatedChallenges = challenges.map((challenge) =>
        challenge.id === challengeId ? { ...challenge, joined: true, progress: 0 } : challenge,
      )
      setJoinedChallenges(updatedChallenges.filter((challenge) => challenge.joined))

      toast({
        title: "Challenge Joined!",
        description: "You've successfully joined a new challenge. Good luck!",
        variant: "success",
      })

      setAnimateCard(null)
    }, 600)
  }

  // Animation effect for new challenges
  useEffect(() => {
    const animateItems = () => {
      const items = document.querySelectorAll(".challenge-card")
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add("animate-in", "fade-in-50", "slide-in-from-bottom-5", "duration-500")
        }, index * 100)
      })
    }

    if (activeTab === "challenges") {
      animateItems()
    }
  }, [activeTab])

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="font-medium mt-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to access community features</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30">
          <TabsTrigger value="challenges" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950">
            <Trophy className="h-4 w-4 mr-2 text-amber-500" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="badges" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950">
            <Leaf className="h-4 w-4 mr-2 text-green-500" />
            Badges
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
          >
            <Users className="h-4 w-4 mr-2 text-purple-500" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950">
            <Trophy className="h-4 w-4 mr-2 text-teal-500" />
            Carbon Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          <DailyChallenge />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                  Your Active Challenges
                </CardTitle>
                <CardDescription>Track your progress on current challenges</CardDescription>
              </CardHeader>
              <CardContent>
                {joinedChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {joinedChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className={`border rounded-lg p-4 space-y-3 transition-all duration-300 ${challenge.color} ${challenge.borderColor}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {challenge.icon}
                            <div className="ml-2">
                              <h3 className="font-medium">{challenge.title}</h3>
                              <p className="text-sm text-muted-foreground">{challenge.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <Progress
                            value={challenge.progress}
                            className="h-2"
                            indicatorClassName={`bg-gradient-to-r ${
                              challenge.category === "Transport"
                                ? "from-teal-500 to-teal-600"
                                : challenge.category === "Food"
                                  ? "from-green-500 to-green-600"
                                  : challenge.category === "Home"
                                    ? "from-amber-500 to-amber-600"
                                    : "from-purple-500 to-purple-600"
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{challenge.duration}</span>
                          <span>{challenge.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Trophy className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No active challenges</h3>
                    <p className="text-sm text-muted-foreground">Join a challenge to start tracking your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-green-50 dark:from-amber-950/30 dark:to-green-950/30 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-500" />
                  Your Impact
                </CardTitle>
                <CardDescription>Your contribution to carbon reduction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 text-center bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                    <h3 className="text-sm font-medium text-muted-foreground">Challenges Completed</h3>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                    <h3 className="text-sm font-medium text-muted-foreground">CO₂ Saved</h3>
                    <p className="text-3xl font-bold">215 kg</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                    <h3 className="text-sm font-medium text-muted-foreground">Community Rank</h3>
                    <p className="text-3xl font-bold">#42</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                    <h3 className="text-sm font-medium text-muted-foreground">Trees Equivalent</h3>
                    <p className="text-3xl font-bold">3.5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-teal-50 to-purple-50 dark:from-teal-950/30 dark:to-purple-950/30 border-teal-200 dark:border-teal-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wind className="h-5 w-5 mr-2 text-teal-500" />
                Available Challenges
              </CardTitle>
              <CardDescription>Join community challenges to reduce your carbon footprint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {challenges
                  .filter((challenge) => !challenge.joined)
                  .map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`challenge-card border rounded-lg p-4 space-y-3 transition-all duration-300 ${
                        animateCard === challenge.id ? "scale-105 shadow-lg" : ""
                      } ${challenge.color} ${challenge.borderColor} opacity-0`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {challenge.icon}
                          <div className="ml-2">
                            <h3 className="font-medium">{challenge.title}</h3>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{challenge.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Duration: {challenge.duration}</span>
                        <span>Difficulty: {challenge.difficulty}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center">
                          <Leaf className="h-4 w-4 mr-1 text-emerald-500" />
                          {challenge.impact}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className={`transition-all duration-300 ${
                            challenge.category === "Transport"
                              ? "bg-teal-500 hover:bg-teal-600"
                              : challenge.category === "Food"
                                ? "bg-green-500 hover:bg-green-600"
                                : challenge.category === "Home"
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-purple-500 hover:bg-purple-600"
                          }`}
                        >
                          Join Challenge
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Challenges
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <UserBadges />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <CarbonQuiz />
        </TabsContent>
      </Tabs>
    </div>
  )
}

