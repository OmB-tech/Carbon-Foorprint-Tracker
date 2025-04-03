"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Car, Home, Leaf, ShoppingBag, Utensils } from "lucide-react"

export default function CarbonCalculator() {
  const [results, setResults] = useState(null)

  // Transport form state
  const [transportValues, setTransportValues] = useState({
    carKm: 50,
    carEfficiency: "medium",
    publicTransportKm: 20,
    flightsShort: 2,
    flightsLong: 1,
  })

  // Home form state
  const [homeValues, setHomeValues] = useState({
    homeType: "apartment",
    occupants: 2,
    energySource: "mixed",
    electricityUsage: 300,
    hasGas: "yes",
    gasUsage: 100,
    waterUsage: 150,
  })

  // Food form state
  const [foodValues, setFoodValues] = useState({
    dietType: "omnivore",
    localFood: "sometimes",
    foodWaste: "some",
    meatConsumption: "medium",
    dairyConsumption: "medium",
  })

  // Other form state
  const [otherValues, setOtherValues] = useState({
    shoppingFrequency: "monthly",
    electronicsFrequency: "yearly",
    secondHand: "sometimes",
    recycle: "yes",
  })

  const handleTransportChange = (field, value) => {
    setTransportValues({
      ...transportValues,
      [field]: value,
    })
  }

  const handleHomeChange = (field, value) => {
    setHomeValues({
      ...homeValues,
      [field]: value,
    })
  }

  const handleFoodChange = (field, value) => {
    setFoodValues({
      ...foodValues,
      [field]: value,
    })
  }

  const handleOtherChange = (field, value) => {
    setOtherValues({
      ...otherValues,
      [field]: value,
    })
  }

  const calculateEmissions = () => {
    // Transport emissions calculation
    const carEmissions =
      transportValues.carKm *
      (transportValues.carEfficiency === "high" ? 0.1 : transportValues.carEfficiency === "medium" ? 0.15 : 0.25) *
      52 // weekly to yearly

    const publicTransportEmissions = transportValues.publicTransportKm * 0.05 * 52
    const flightEmissionsShort = transportValues.flightsShort * 500
    const flightEmissionsLong = transportValues.flightsLong * 1800

    // Home emissions calculation
    let homeEmissions = 0

    // Base emissions by home type
    if (homeValues.homeType === "apartment") {
      homeEmissions = 1500
    } else if (homeValues.homeType === "house-small") {
      homeEmissions = 2000
    } else if (homeValues.homeType === "house-medium") {
      homeEmissions = 2500
    } else if (homeValues.homeType === "house-large") {
      homeEmissions = 3500
    }

    // Adjust by energy source
    if (homeValues.energySource === "renewable") {
      homeEmissions *= 0.3
    } else if (homeValues.energySource === "mixed") {
      homeEmissions *= 0.8
    } else if (homeValues.energySource === "fossil") {
      homeEmissions *= 1.2
    }

    // Adjust by occupants (more occupants = less per person)
    const occupantsCount = Number.parseInt(homeValues.occupants) || 1
    if (occupantsCount > 1) {
      homeEmissions = (homeEmissions / occupantsCount) * (1 + occupantsCount * 0.2)
    }

    // Add gas usage if applicable
    if (homeValues.hasGas === "yes") {
      homeEmissions += 500
    }

    // Food emissions calculation
    let foodEmissions = 0

    // Base emissions by diet type
    if (foodValues.dietType === "meat-heavy") {
      foodEmissions = 2500
    } else if (foodValues.dietType === "omnivore") {
      foodEmissions = 1800
    } else if (foodValues.dietType === "flexitarian") {
      foodEmissions = 1200
    } else if (foodValues.dietType === "vegetarian") {
      foodEmissions = 800
    } else if (foodValues.dietType === "vegan") {
      foodEmissions = 500
    }

    // Adjust by local food consumption
    if (foodValues.localFood === "always") {
      foodEmissions *= 0.8
    } else if (foodValues.localFood === "often") {
      foodEmissions *= 0.9
    } else if (foodValues.localFood === "rarely") {
      foodEmissions *= 1.1
    } else if (foodValues.localFood === "never") {
      foodEmissions *= 1.2
    }

    // Adjust by food waste
    if (foodValues.foodWaste === "none") {
      foodEmissions *= 0.8
    } else if (foodValues.foodWaste === "little") {
      foodEmissions *= 0.9
    } else if (foodValues.foodWaste === "significant") {
      foodEmissions *= 1.2
    }

    // Shopping/Other emissions calculation
    let shoppingEmissions = 0

    // Base emissions by shopping frequency
    if (otherValues.shoppingFrequency === "weekly") {
      shoppingEmissions = 800
    } else if (otherValues.shoppingFrequency === "monthly") {
      shoppingEmissions = 500
    } else if (otherValues.shoppingFrequency === "quarterly") {
      shoppingEmissions = 300
    } else if (otherValues.shoppingFrequency === "biannually") {
      shoppingEmissions = 200
    } else if (otherValues.shoppingFrequency === "annually") {
      shoppingEmissions = 100
    }

    // Adjust by electronics purchases
    if (otherValues.electronicsFrequency === "monthly") {
      shoppingEmissions += 600
    } else if (otherValues.electronicsFrequency === "quarterly") {
      shoppingEmissions += 300
    } else if (otherValues.electronicsFrequency === "yearly") {
      shoppingEmissions += 100
    }

    // Adjust by second-hand purchases
    if (otherValues.secondHand === "always") {
      shoppingEmissions *= 0.6
    } else if (otherValues.secondHand === "sometimes") {
      shoppingEmissions *= 0.8
    }

    // Adjust by recycling habits
    if (otherValues.recycle === "yes") {
      shoppingEmissions *= 0.8
    } else if (otherValues.recycle === "sometimes") {
      shoppingEmissions *= 0.9
    }

    const totalEmissions =
      carEmissions +
      publicTransportEmissions +
      flightEmissionsShort +
      flightEmissionsLong +
      homeEmissions +
      foodEmissions +
      shoppingEmissions

    const data = [
      {
        category: "Transport",
        emissions: Math.round(carEmissions + publicTransportEmissions + flightEmissionsShort + flightEmissionsLong),
      },
      { category: "Home", emissions: Math.round(homeEmissions) },
      { category: "Food", emissions: Math.round(foodEmissions) },
      { category: "Shopping", emissions: Math.round(shoppingEmissions) },
    ]

    setResults({
      total: Math.round(totalEmissions),
      data,
      globalAverage: 5000,
      countryAverage: 8000,
      suggestions: [
        "Reduce car usage by 20% to save 300kg CO₂ annually",
        "Switch to renewable energy to save up to 1500kg CO₂",
        "Eat plant-based meals 3 days a week to save 600kg CO₂",
      ],
    })
  }

  return (
    <div className="space-y-6">
      {!results ? (
        <Card>
          <CardHeader>
            <CardTitle>Carbon Footprint Calculator</CardTitle>
            <CardDescription>Answer questions about your lifestyle to calculate your carbon footprint</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transport">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="transport">
                  <Car className="h-4 w-4 mr-2" />
                  Transport
                </TabsTrigger>
                <TabsTrigger value="home">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="food">
                  <Utensils className="h-4 w-4 mr-2" />
                  Food
                </TabsTrigger>
                <TabsTrigger value="shopping">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shopping
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transport" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Car Usage</h3>

                  <div className="space-y-2">
                    <Label>Do you own or regularly use a car?</Label>
                    <RadioGroup defaultValue="yes" className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="car-yes" />
                        <Label htmlFor="car-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="car-no" />
                        <Label htmlFor="car-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="car-km">Weekly kilometers driven</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="car-km"
                        min={0}
                        max={500}
                        step={10}
                        value={[transportValues.carKm]}
                        onValueChange={(value) => handleTransportChange("carKm", value[0])}
                      />
                      <span className="w-12 text-center">{transportValues.carKm}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="car-efficiency">Car fuel efficiency</Label>
                    <Select
                      value={transportValues.carEfficiency}
                      onValueChange={(value) => handleTransportChange("carEfficiency", value)}
                    >
                      <SelectTrigger id="car-efficiency">
                        <SelectValue placeholder="Select efficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (Electric/Hybrid)</SelectItem>
                        <SelectItem value="medium">Medium (Small-Medium Car)</SelectItem>
                        <SelectItem value="low">Low (Large Car/SUV)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Public Transport</h3>

                  <div className="space-y-2">
                    <Label htmlFor="public-transport">Weekly kilometers on public transport</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="public-transport"
                        min={0}
                        max={200}
                        step={5}
                        value={[transportValues.publicTransportKm]}
                        onValueChange={(value) => handleTransportChange("publicTransportKm", value[0])}
                      />
                      <span className="w-12 text-center">{transportValues.publicTransportKm}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Air Travel</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flights-short">Short flights per year (less than 3 hours)</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          id="flights-short"
                          min={0}
                          max={20}
                          step={1}
                          value={[transportValues.flightsShort]}
                          onValueChange={(value) => handleTransportChange("flightsShort", value[0])}
                        />
                        <span className="w-12 text-center">{transportValues.flightsShort}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flights-long">Long flights per year (more than 3 hours)</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          id="flights-long"
                          min={0}
                          max={10}
                          step={1}
                          value={[transportValues.flightsLong]}
                          onValueChange={(value) => handleTransportChange("flightsLong", value[0])}
                        />
                        <span className="w-12 text-center">{transportValues.flightsLong}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="home" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Housing</h3>

                  <div className="space-y-2">
                    <Label htmlFor="home-type">Type of home</Label>
                    <Select value={homeValues.homeType} onValueChange={(value) => handleHomeChange("homeType", value)}>
                      <SelectTrigger id="home-type">
                        <SelectValue placeholder="Select home type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house-small">Small House</SelectItem>
                        <SelectItem value="house-medium">Medium House</SelectItem>
                        <SelectItem value="house-large">Large House</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="home-occupants">Number of occupants</Label>
                    <Select
                      value={homeValues.occupants.toString()}
                      onValueChange={(value) => handleHomeChange("occupants", value)}
                    >
                      <SelectTrigger id="home-occupants">
                        <SelectValue placeholder="Select number of occupants" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="3">3 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="5">5+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Energy</h3>

                  <div className="space-y-2">
                    <Label htmlFor="energy-source">Primary energy source</Label>
                    <Select
                      value={homeValues.energySource}
                      onValueChange={(value) => handleHomeChange("energySource", value)}
                    >
                      <SelectTrigger id="energy-source">
                        <SelectValue placeholder="Select energy source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="renewable">100% Renewable</SelectItem>
                        <SelectItem value="mixed">Mixed Sources</SelectItem>
                        <SelectItem value="fossil">Primarily Fossil Fuels</SelectItem>
                        <SelectItem value="unknown">Don't Know</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="energy-usage">Monthly electricity usage (kWh)</Label>
                    <Input
                      type="number"
                      id="energy-usage"
                      placeholder="e.g. 300"
                      value={homeValues.electricityUsage}
                      onChange={(e) => handleHomeChange("electricityUsage", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Do you use gas for heating or cooking?</Label>
                    <RadioGroup
                      value={homeValues.hasGas}
                      onValueChange={(value) => handleHomeChange("hasGas", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="gas-yes" />
                        <Label htmlFor="gas-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="gas-no" />
                        <Label htmlFor="gas-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {homeValues.hasGas === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="gas-usage">Monthly gas usage (units)</Label>
                      <Input
                        type="number"
                        id="gas-usage"
                        placeholder="e.g. 100"
                        value={homeValues.gasUsage}
                        onChange={(e) => handleHomeChange("gasUsage", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="water-usage">Monthly water usage (gallons)</Label>
                    <Input
                      type="number"
                      id="water-usage"
                      placeholder="e.g. 150"
                      value={homeValues.waterUsage}
                      onChange={(e) => handleHomeChange("waterUsage", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="food" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Diet</h3>

                  <div className="space-y-2">
                    <Label htmlFor="diet-type">Primary diet type</Label>
                    <Select value={foodValues.dietType} onValueChange={(value) => handleFoodChange("dietType", value)}>
                      <SelectTrigger id="diet-type">
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meat-heavy">Meat with every meal</SelectItem>
                        <SelectItem value="omnivore">Regular meat eater</SelectItem>
                        <SelectItem value="flexitarian">Flexitarian (occasional meat)</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meat-consumption">Meat consumption (if applicable)</Label>
                    <Select
                      value={foodValues.meatConsumption}
                      onValueChange={(value) => handleFoodChange("meatConsumption", value)}
                    >
                      <SelectTrigger id="meat-consumption">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Daily (most meals)</SelectItem>
                        <SelectItem value="medium">Several times a week</SelectItem>
                        <SelectItem value="low">Once a week or less</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dairy-consumption">Dairy consumption</Label>
                    <Select
                      value={foodValues.dairyConsumption}
                      onValueChange={(value) => handleFoodChange("dairyConsumption", value)}
                    >
                      <SelectTrigger id="dairy-consumption">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Daily (most meals)</SelectItem>
                        <SelectItem value="medium">Several times a week</SelectItem>
                        <SelectItem value="low">Once a week or less</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local-food">How often do you eat locally produced food?</Label>
                    <Select
                      value={foodValues.localFood}
                      onValueChange={(value) => handleFoodChange("localFood", value)}
                    >
                      <SelectTrigger id="local-food">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Almost always</SelectItem>
                        <SelectItem value="often">Often</SelectItem>
                        <SelectItem value="sometimes">Sometimes</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="food-waste">How much food do you typically waste?</Label>
                    <Select
                      value={foodValues.foodWaste}
                      onValueChange={(value) => handleFoodChange("foodWaste", value)}
                    >
                      <SelectTrigger id="food-waste">
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Almost none</SelectItem>
                        <SelectItem value="little">Very little</SelectItem>
                        <SelectItem value="some">Some</SelectItem>
                        <SelectItem value="significant">Significant amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shopping" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Consumer Habits</h3>

                  <div className="space-y-2">
                    <Label htmlFor="shopping-frequency">How often do you buy new clothes?</Label>
                    <Select
                      value={otherValues.shoppingFrequency}
                      onValueChange={(value) => handleOtherChange("shoppingFrequency", value)}
                    >
                      <SelectTrigger id="shopping-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Every few months</SelectItem>
                        <SelectItem value="biannually">Twice a year</SelectItem>
                        <SelectItem value="annually">Once a year or less</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="electronics">How often do you buy new electronics?</Label>
                    <Select
                      value={otherValues.electronicsFrequency}
                      onValueChange={(value) => handleOtherChange("electronicsFrequency", value)}
                    >
                      <SelectTrigger id="electronics">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Every few months</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="rarely">Every few years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Do you prioritize buying second-hand items?</Label>
                    <RadioGroup
                      value={otherValues.secondHand}
                      onValueChange={(value) => handleOtherChange("secondHand", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="always" id="secondhand-always" />
                        <Label htmlFor="secondhand-always">Always</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sometimes" id="secondhand-sometimes" />
                        <Label htmlFor="secondhand-sometimes">Sometimes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="never" id="secondhand-never" />
                        <Label htmlFor="secondhand-never">Never</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Do you recycle regularly?</Label>
                    <RadioGroup
                      value={otherValues.recycle}
                      onValueChange={(value) => handleOtherChange("recycle", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="recycle-yes" />
                        <Label htmlFor="recycle-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sometimes" id="recycle-sometimes" />
                        <Label htmlFor="recycle-sometimes">Sometimes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="recycle-no" />
                        <Label htmlFor="recycle-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={calculateEmissions} className="w-full">
              Calculate My Carbon Footprint
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Carbon Footprint Results</CardTitle>
              <CardDescription>
                Based on your lifestyle, here's an estimate of your annual carbon emissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-2 p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-medium">Annual Carbon Footprint</h3>
                <div className="text-4xl font-bold text-emerald-600">{results.total} kg CO₂e</div>
                <div className="text-sm text-muted-foreground">
                  Global Average: {results.globalAverage} kg CO₂e | Country Average: {results.countryAverage} kg CO₂e
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Emissions by Category</h3>
                <ChartContainer
                  config={{
                    transport: {
                      label: "Transport",
                      color: "hsl(var(--chart-1))",
                    },
                    home: {
                      label: "Home",
                      color: "hsl(var(--chart-2))",
                    },
                    food: {
                      label: "Food",
                      color: "hsl(var(--chart-3))",
                    },
                    shopping: {
                      label: "Shopping",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={results.data}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="emissions" radius={4} />
                  </BarChart>
                </ChartContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Personalized Recommendations</h3>
                <ul className="space-y-2">
                  {results.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <Leaf className="h-5 w-5 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button onClick={() => setResults(null)} variant="outline" className="w-full">
                Recalculate
              </Button>
              <Button className="w-full">Download Detailed Report</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

