"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, ThermometerSun, Trash2, Factory, Car, Shirt, TreePine } from "lucide-react"

const facts = [
  {
    title: "Global Emissions",
    description: "Every year, human activities release over 40 billion tons of CO₂ into the atmosphere.",
    icon: <Factory className="h-12 w-12 text-red-500" />,
    color: "bg-red-50 border-red-200",
  },
  {
    title: "Tree Absorption",
    description: "It takes one tree a whole year to absorb the CO₂ emitted by driving a car for just 15 minutes.",
    icon: <TreePine className="h-12 w-12 text-emerald-500" />,
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    title: "Fashion Industry",
    description:
      "The fashion industry is responsible for 10% of global carbon emissions—more than all international flights and maritime shipping combined.",
    icon: <Shirt className="h-12 w-12 text-purple-500" />,
    color: "bg-purple-50 border-purple-200",
  },
  {
    title: "Transportation",
    description:
      "A single passenger on a long-haul flight produces more CO₂ in a few hours than many people do in an entire year in some developing countries.",
    icon: <Car className="h-12 w-12 text-blue-500" />,
    color: "bg-blue-50 border-blue-200",
  },
  {
    title: "Food Waste",
    description:
      "If food waste were a country, it would be the third-largest emitter of greenhouse gases after the US and China.",
    icon: <Trash2 className="h-12 w-12 text-orange-500" />,
    color: "bg-orange-50 border-orange-200",
  },
  {
    title: "Temperature Rise",
    description:
      "The Earth's average temperature has increased by 1.1°C since the pre-industrial era. A rise of 2°C would have catastrophic consequences for millions of people.",
    icon: <ThermometerSun className="h-12 w-12 text-yellow-500" />,
    color: "bg-yellow-50 border-yellow-200",
  },
]

export default function HarshReality() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length)
      }, 8000)
    }

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const currentFact = facts[currentFactIndex]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-2">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
          <h1 className="text-3xl font-bold">Harsh Reality</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          These sobering facts about carbon emissions and climate change highlight the urgent need for action.
          Understanding the reality is the first step toward making meaningful changes.
        </p>
      </div>

      <div className="relative h-[400px] w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Card className={`h-full overflow-hidden border-2 ${currentFact.color}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center">
                  {currentFact.icon}
                  <span className="ml-3">{currentFact.title}</span>
                </CardTitle>
                <CardDescription>Swipe or use the buttons to see more facts</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-between h-[calc(100%-5rem)]">
                <p className="text-xl leading-relaxed">{currentFact.description}</p>

                <div className="flex justify-between items-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentFactIndex((prev) => (prev - 1 + facts.length) % facts.length)}
                  >
                    Previous
                  </Button>

                  <div className="flex space-x-1">
                    {facts.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full ${index === currentFactIndex ? "bg-primary" : "bg-muted"}`}
                        onClick={() => setCurrentFactIndex(index)}
                      />
                    ))}
                  </div>

                  <Button variant="outline" onClick={() => setCurrentFactIndex((prev) => (prev + 1) % facts.length)}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
          {isAutoPlaying ? "Pause Slideshow" : "Start Slideshow"}
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>What Can You Do?</CardTitle>
          <CardDescription>Small changes can make a big difference</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <h3 className="font-medium mb-2">Reduce Transportation Emissions</h3>
            <p className="text-sm text-muted-foreground">
              Use public transport, carpool, bike, or walk whenever possible. If you must drive, consider an electric or
              hybrid vehicle.
            </p>
          </div>

          <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <h3 className="font-medium mb-2">Eat More Plant-Based Foods</h3>
            <p className="text-sm text-muted-foreground">
              Reducing meat consumption, especially beef and lamb, can significantly lower your carbon footprint.
            </p>
          </div>

          <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <h3 className="font-medium mb-2">Save Energy at Home</h3>
            <p className="text-sm text-muted-foreground">
              Switch to LED bulbs, improve insulation, use energy-efficient appliances, and consider renewable energy
              sources.
            </p>
          </div>

          <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <h3 className="font-medium mb-2">Reduce, Reuse, Recycle</h3>
            <p className="text-sm text-muted-foreground">
              Minimize waste, repair items instead of replacing them, and recycle properly to reduce landfill emissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

