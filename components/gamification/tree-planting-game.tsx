"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function TreePlantingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trees, setTrees] = useState<{ x: number; y: number; size: number; growth: number }[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [waterAmount, setWaterAmount] = useState(50)
  const { toast } = useToast()

  // Game loop
  useEffect(() => {
    if (!gameStarted) return

    let timerId: NodeJS.Timeout

    if (timeLeft > 0) {
      timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1)

        // Grow trees
        setTrees((prevTrees) =>
          prevTrees.map((tree) => ({
            ...tree,
            growth: Math.min(100, tree.growth + Math.random() * 2),
          })),
        )
      }, 1000)
    } else {
      // Game over
      toast({
        title: "Game Over!",
        description: `You planted ${trees.length} trees and scored ${score} points!`,
      })
      setGameStarted(false)
    }

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [gameStarted, timeLeft, trees.length, score, toast])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw ground
    ctx.fillStyle = "#8B4513" // Brown
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50)

    // Draw grass
    ctx.fillStyle = "#228B22" // Forest green
    ctx.fillRect(0, canvas.height - 60, canvas.width, 10)

    // Draw sky
    ctx.fillStyle = "#87CEEB" // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height - 60)

    // Draw sun
    ctx.fillStyle = "#FFD700" // Gold
    ctx.beginPath()
    ctx.arc(canvas.width - 50, 50, 30, 0, Math.PI * 2)
    ctx.fill()

    // Draw trees
    trees.forEach((tree) => {
      // Tree trunk
      ctx.fillStyle = "#8B4513" // Brown
      ctx.fillRect(tree.x - 5, tree.y - 30, 10, 30)

      // Tree leaves
      const leafSize = ((tree.size * tree.growth) / 100) * 20
      ctx.fillStyle = "#006400" // Dark green
      ctx.beginPath()
      ctx.arc(tree.x, tree.y - 40, leafSize, 0, Math.PI * 2)
      ctx.fill()

      // Growth indicator
      if (tree.growth < 100) {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(tree.x - 15, tree.y - 70, 30, 5)

        ctx.fillStyle = "#4CAF50"
        ctx.fillRect(tree.x - 15, tree.y - 70, 30 * (tree.growth / 100), 5)
      }
    })
  }, [trees])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Only allow planting on the ground
    if (y < canvas.height - 60) return

    // Plant a new tree
    const newTree = {
      x,
      y: canvas.height - 60,
      size: Math.random() * 0.5 + 0.5, // Random size between 0.5 and 1
      growth: 0,
    }

    setTrees([...trees, newTree])
    setScore(score + 10)
  }

  const handleWaterTrees = () => {
    if (!gameStarted || waterAmount <= 0) return

    // Water all trees
    setTrees((prevTrees) =>
      prevTrees.map((tree) => ({
        ...tree,
        growth: Math.min(100, tree.growth + 10),
      })),
    )

    // Update score based on tree growth
    const fullyGrownTrees = trees.filter((tree) => tree.growth >= 100).length
    setScore(score + fullyGrownTrees * 5)

    // Reduce water amount
    setWaterAmount(Math.max(0, waterAmount - 10))
  }

  const startGame = () => {
    setTrees([])
    setScore(0)
    setTimeLeft(60)
    setWaterAmount(50)
    setGameStarted(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tree Planting Game</CardTitle>
        <CardDescription>Plant and grow trees to reduce carbon emissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Score: {score}</p>
            <p className="text-sm text-muted-foreground">Trees: {trees.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Time: {timeLeft}s</p>
            <p className="text-sm text-muted-foreground">Water: {waterAmount}%</p>
          </div>
        </div>

        <div className="relative border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            onClick={handleCanvasClick}
            className="w-full cursor-pointer"
          />

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Button onClick={startGame}>Start Game</Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Water Amount</Label>
            <span>{waterAmount}%</span>
          </div>
          <Slider
            value={[waterAmount]}
            max={100}
            step={1}
            disabled={!gameStarted}
            onValueChange={(value) => setWaterAmount(value[0])}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={startGame} disabled={gameStarted}>
          {score > 0 ? "Play Again" : "Start Game"}
        </Button>
        <Button onClick={handleWaterTrees} disabled={!gameStarted || waterAmount <= 0}>
          Water Trees
        </Button>
      </CardFooter>
    </Card>
  )
}

