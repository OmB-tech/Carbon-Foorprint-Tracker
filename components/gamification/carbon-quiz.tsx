"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, HelpCircle, XCircle, Award, Zap, Leaf } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import confetti from "canvas-confetti"

const quizQuestions = [
  {
    question: "Which of the following has the highest carbon footprint?",
    options: [
      "Taking a bus for 10 miles",
      "Flying for 1 hour",
      "Driving a car for 20 miles",
      "Taking a train for 50 miles",
    ],
    correctAnswer: 1,
    explanation: "Flying has the highest carbon footprint per passenger mile of any form of transport.",
  },
  {
    question: "What percentage of global greenhouse gas emissions come from food production?",
    options: ["Around 5%", "Around 15%", "Around 25%", "Around 35%"],
    correctAnswer: 2,
    explanation: "Food production accounts for about 25% of global greenhouse gas emissions.",
  },
  {
    question: "Which food has the lowest carbon footprint?",
    options: ["Beef", "Chicken", "Cheese", "Lentils"],
    correctAnswer: 3,
    explanation: "Plant-based proteins like lentils have a much lower carbon footprint than animal products.",
  },
  {
    question: "What is the most effective way to reduce your carbon footprint?",
    options: ["Recycling all your waste", "Having fewer children", "Going vegetarian", "Avoiding air travel"],
    correctAnswer: 1,
    explanation:
      "While all these actions help, studies show that having fewer children has the largest impact on reducing one's carbon footprint.",
  },
  {
    question: "How much CO2 does an average tree absorb per year?",
    options: ["About 5 kg", "About 22 kg", "About 50 kg", "About 100 kg"],
    correctAnswer: 1,
    explanation: "An average tree absorbs about 22 kg (48 pounds) of CO2 per year.",
  },
]

export function CarbonQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [animateOption, setAnimateOption] = useState<number | null>(null)
  const [fadeIn, setFadeIn] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setFadeIn(true)
  }, [currentQuestion])

  useEffect(() => {
    if (fadeIn) {
      const timer = setTimeout(() => {
        setFadeIn(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [fadeIn])

  const handleOptionSelect = (optionIndex: number) => {
    if (showAnswer) return
    setAnimateOption(optionIndex)
    setSelectedOption(optionIndex)

    setTimeout(() => {
      setAnimateOption(null)
    }, 300)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return

    setShowAnswer(true)

    if (selectedOption === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1)
      // Play a success sound
      const audio = new Audio("/correct-answer.mp3")
      audio.volume = 0.5
      audio.play().catch((e) => console.log("Audio play failed:", e))
    } else {
      // Play an error sound
      const audio = new Audio("/wrong-answer.mp3")
      audio.volume = 0.5
      audio.play().catch((e) => console.log("Audio play failed:", e))
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
      setShowAnswer(false)
      setFadeIn(true)
    } else {
      setQuizCompleted(true)
      const finalScore = score + (selectedOption === quizQuestions[currentQuestion].correctAnswer ? 1 : 0)
      const percentage = (finalScore / quizQuestions.length) * 100

      toast({
        title: "Quiz Completed!",
        description: `You scored ${finalScore} out of ${quizQuestions.length}`,
      })

      if (percentage >= 80) {
        // Trigger confetti for high scores
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedOption(null)
    setShowAnswer(false)
    setScore(0)
    setQuizCompleted(false)
    setFadeIn(true)
  }

  const currentQuizQuestion = quizQuestions[currentQuestion]
  const progress = ((currentQuestion + (showAnswer ? 1 : 0)) / quizQuestions.length) * 100

  if (quizCompleted) {
    const finalScore = score + (selectedOption === quizQuestions[quizQuestions.length - 1].correctAnswer ? 1 : 0)
    const percentage = (finalScore / quizQuestions.length) * 100

    return (
      <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-500" />
            Quiz Completed!
          </CardTitle>
          <CardDescription>Test your knowledge about carbon emissions and climate change</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold">
                {finalScore} / {quizQuestions.length}
              </h3>
              <p className="text-muted-foreground">Your score</p>
            </div>

            <div className="w-full max-w-md">
              <Progress
                value={percentage}
                className="h-3"
                indicatorClassName={`${
                  percentage >= 80
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : percentage >= 60
                      ? "bg-gradient-to-r from-amber-500 to-amber-600"
                      : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              />
              <p className="text-center mt-2">
                {percentage >= 80 ? (
                  <span className="text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Excellent! You're a carbon footprint expert!
                  </span>
                ) : percentage >= 60 ? (
                  <span className="text-amber-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Good job! You know your stuff.
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center justify-center gap-1">
                    <HelpCircle className="h-4 w-4" /> Keep learning about carbon emissions!
                  </span>
                )}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-medium">Knowledge Level</p>
                <p className="text-xs text-muted-foreground">
                  {percentage >= 80 ? "Expert" : percentage >= 60 ? "Intermediate" : "Beginner"}
                </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg text-center">
                <Leaf className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">CO₂ Awareness</p>
                <p className="text-xs text-muted-foreground">
                  {percentage >= 80 ? "High" : percentage >= 60 ? "Medium" : "Developing"}
                </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium">Eco Badge</p>
                <p className="text-xs text-muted-foreground">
                  {percentage >= 80 ? "Gold" : percentage >= 60 ? "Silver" : "Bronze"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleRestartQuiz}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
          >
            Take Quiz Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800 overflow-hidden">
      <div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-500 ease-in-out"
        style={{ width: `${progress}%` }}
      ></div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-green-500" />
          Carbon Footprint Quiz
        </CardTitle>
        <CardDescription>Test your knowledge about carbon emissions and climate change</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span>Score: {score}</span>
          </div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-green-500 to-teal-500" />
        </div>

        <div className={`py-4 transition-opacity duration-500 ${fadeIn ? "opacity-0" : "opacity-100"}`}>
          <h3 className="text-lg font-medium mb-4">{currentQuizQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuizQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedOption === index
                    ? showAnswer
                      ? index === currentQuizQuestion.correctAnswer
                        ? "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700"
                        : "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700"
                      : "bg-primary/10 border-primary/30"
                    : "hover:bg-white/50 dark:hover:bg-gray-800/50"
                } ${animateOption === index ? "scale-105" : ""}`}
                onClick={() => handleOptionSelect(index)}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showAnswer && index === currentQuizQuestion.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showAnswer && selectedOption === index && index !== currentQuizQuestion.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAnswer && (
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{currentQuizQuestion.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showAnswer ? (
          <Button
            onClick={handleCheckAnswer}
            disabled={selectedOption === null}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
          >
            {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

