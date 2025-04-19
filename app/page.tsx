"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Gift, Search, ShoppingBag, Loader2, Music, Wrench, Coffee, Tv, Dumbbell, Shirt, Utensils, Gamepad, Camera, Tent, Watch, Headphones } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trackFilterClick, trackGiftClick } from "@/lib/analytics"

// Define the GiftIdea type
interface GiftIdea {
  title: string
  description: string
  amazonSearch: string
  priceRange: string[]
  interests: string[]
  occasions: string[]
  imageUrl?: string
}

// Fallback mock gift ideas
const mockGiftIdeas: GiftIdea[] = [
  {
    title: "Smart BBQ Thermometer",
    description: "Let dad monitor his grilling masterpiece from his phone. Because standing next to the grill with a beer was too easy!",
    amazonSearch: "Wireless Meat Thermometer for Grilling",
    priceRange: ["$25-$50"],
    interests: ["BBQ", "Tech"],
    occasions: ["Father's Day", "Birthday", "Christmas"]
  },
  {
    title: "Premium Tool Belt",
    description: "For the dad who loves DIY but keeps losing his tools. Now he can lose them all in one organized place!",
    amazonSearch: "Professional Tool Belt",
    priceRange: ["$30-$60"],
    interests: ["Tools", "DIY"],
    occasions: ["Father's Day", "Christmas", "Birthday"]
  },
  {
    title: "Deluxe Coffee Station",
    description: "Transform dad's morning routine from 'don't talk to me yet' to 'let me tell you about coffee origins'.",
    amazonSearch: "Home Coffee Bar Station",
    priceRange: ["$50-$100"],
    interests: ["Coffee", "Luxury"],
    occasions: ["Christmas", "Birthday", "Father's Day"]
  },
  {
    title: "Smart Home Starter Kit",
    description: "Give dad the power to control everything from his chair. Warning: May result in excessive 'Who touched the thermostat?' questions.",
    amazonSearch: "Smart Home Hub Starter Kit",
    priceRange: ["$75-$150"],
    interests: ["Tech", "Gadgets"],
    occasions: ["Christmas", "Birthday", "Father's Day"]
  },
  {
    title: "Personalized Grilling Set",
    description: "Custom BBQ tools that say 'These are dad's tongs' so everyone knows who's really the grill master.",
    amazonSearch: "Personalized BBQ Grilling Tools Set",
    priceRange: ["$40-$80"],
    interests: ["BBQ", "Outdoors"],
    occasions: ["Father's Day", "Birthday", "Christmas"]
  },
  {
    title: "Noise-Canceling Headphones",
    description: "For when dad says 'I just want some peace and quiet' but still wants to listen to his favorite tunes.",
    amazonSearch: "Premium Noise Canceling Headphones",
    priceRange: ["$100-$200"],
    interests: ["Tech", "Music"],
    occasions: ["Birthday", "Christmas", "Father's Day"]
  },
  {
    title: "Multi-Tool Swiss Army Watch",
    description: "A watch that's also a toolkit. Perfect for the dad who likes to fix things on the go!",
    amazonSearch: "Swiss Army Multi Tool Watch",
    priceRange: ["$75-$150"],
    interests: ["Tools", "Luxury", "Tech"],
    occasions: ["Birthday", "Christmas", "Father's Day"]
  },
  {
    title: "Indoor Putting Green",
    description: "Let dad practice his golf game without leaving the house. Comes with built-in excuses for missed putts!",
    amazonSearch: "Indoor Putting Green Mat",
    priceRange: ["$30-$60"],
    interests: ["Sports", "Golf"],
    occasions: ["Birthday", "Christmas", "Father's Day"]
  },
  {
    title: "Vintage Style Record Player",
    description: "Help dad relive his glory days with a modern record player. Now he can tell you how music 'used to sound better' in HD!",
    amazonSearch: "Bluetooth Vintage Record Player",
    priceRange: ["$60-$120"],
    interests: ["Music", "Tech", "Luxury"],
    occasions: ["Birthday", "Christmas", "Father's Day"]
  }
]

// Rotating subheadlines
const subheadlines = [
  "Because 'I don't need anything' really means 'Surprise me'",
  "For the dad who has everything (except another tie)",
  "Better than the 'World's Best Dad' mug he got last year",
  "Gifts that won't end up in the Famous Dad Drawer of Forgotten Presents",
  "Because even dad jokes deserve better gifts than socks",
  "Helping you nail the perfect gift, no hammer required",
  "From 'meh' to 'wow' - dad-approved gift ideas",
  "Gift ideas that'll make him prouder than his lawn",
  "For the man who taught you everything, except gift-giving",
  "Gifts worth more dad jokes than usual"
]

// Rotating footer jokes
const footerJokes = [
  "Dad-tested, child-approved, mom-tolerated",
  "Warning: May cause excessive dad jokes and random BBQ sessions",
  "60% of the time, these gifts work every time",
  "No ties were harmed in the making of these suggestions",
  "Satisfaction guaranteed* (*Terms and conditions set by dad)",
  "Powered by dad jokes and grilling wisdom",
  "Results may include spontaneous lawn mowing",
  "Side effects: Increased dad joke frequency",
  "Our gifts speak dad's love language: power tools",
  "Making dads smile since their last 'Hi Hungry, I'm Dad' joke"
]

// Modify the popularTags array to remove one tag
const popularTags = [
  "BBQ",
  "Tech",
  "Outdoors",
  "Luxury",
  "Sports",
  "Tools",
  "Fitness",
  "Grooming",
  "Humor"
]

// Add a function to get the appropriate icon based on interests
const getGiftIcon = (interests: string[]) => {
  // Sports-related keywords
  const sportsKeywords = ['golf', 'running', 'biking', 'sports', 'fitness', 'workout', 'exercise']
  
  // Check if any interest is sports-related
  const isSportsRelated = interests.some(interest => 
    sportsKeywords.some(keyword => 
      interest.toLowerCase().includes(keyword.toLowerCase())
    )
  )
  
  if (isSportsRelated) {
    return <Dumbbell className="w-12 h-12 text-gray-600" />
  }

  // Map interests to icons
  const interestIconMap: { [key: string]: React.ReactNode } = {
    'Music': <Music className="w-12 h-12 text-gray-600" />,
    'Tools': <Wrench className="w-12 h-12 text-gray-600" />,
    'Coffee': <Coffee className="w-12 h-12 text-gray-600" />,
    'Tech': <Tv className="w-12 h-12 text-gray-600" />,
    'Fashion': <Shirt className="w-12 h-12 text-gray-600" />,
    'BBQ': <Utensils className="w-12 h-12 text-gray-600" />,
    'Gaming': <Gamepad className="w-12 h-12 text-gray-600" />,
    'Photography': <Camera className="w-12 h-12 text-gray-600" />,
    'Outdoors': <Tent className="w-12 h-12 text-gray-600" />,
    'Luxury': <Watch className="w-12 h-12 text-gray-600" />,
    'Audio': <Headphones className="w-12 h-12 text-gray-600" />
  }

  // Find the first matching interest that has an icon
  for (const interest of interests) {
    for (const [key, icon] of Object.entries(interestIconMap)) {
      if (interest.toLowerCase().includes(key.toLowerCase())) {
        return icon
      }
    }
  }

  // Default icon if no matches
  return <Gift className="w-12 h-12 text-gray-600" />
}

export default function Home() {
  const [occasion, setOccasion] = useState<string>("")
  const [interests, setInterests] = useState<string>("")
  const [budget, setBudget] = useState<string>("")
  const [showResults, setShowResults] = useState(false)
  const [giftResults, setGiftResults] = useState<GiftIdea[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtersChanged, setFiltersChanged] = useState(false)

  // Select random subheadline and footer joke on component mount
  const [randomSubheadline] = useState(() => subheadlines[Math.floor(Math.random() * subheadlines.length)])
  const [randomFooterJoke] = useState(() => footerJokes[Math.floor(Math.random() * footerJokes.length)])

  const handleTagClick = (tag: string) => {
    // Update selected tags
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)
    
    // Parse existing interests, removing empty strings and trimming whitespace
    const existingInterests = interests
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0)
    
    // Create a Set to remove duplicates
    const uniqueInterests = new Set([...existingInterests])
    
    // Add or remove the clicked tag
    if (selectedTags.includes(tag)) {
      uniqueInterests.delete(tag)
    } else {
      uniqueInterests.add(tag)
    }
    
    // Convert back to string
    setInterests(Array.from(uniqueInterests).join(', '))
    trackFilterClick('interest', tag)
  }

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterests(e.target.value)
    // Update selected tags based on manual input
    const inputTags = e.target.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
    setSelectedTags(inputTags.filter(tag => popularTags.includes(tag)))
    handleFilterChange()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Track the search in analytics
      trackFilterClick('search', JSON.stringify({ occasion, interests, budget }))

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          occasion,
          interests,
          budget,
          isContinuation: hasSearched && !filtersChanged
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to generate gift ideas')
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      if (!data.giftIdeas || !Array.isArray(data.giftIdeas)) {
        throw new Error('Invalid response format from API')
      }

      setGiftResults(data.giftIdeas)
      setShowResults(true)
      setHasSearched(true)
      setFiltersChanged(false)
    } catch (err) {
      console.error('Submit Error:', err)
      // Use mock data as fallback
      const filteredMocks = mockGiftIdeas
        .filter(gift => 
          (!occasion || gift.occasions.includes(occasion)) &&
          (!interests || interests.split(',').some(interest => 
            gift.interests.some(giftInterest => 
              giftInterest.toLowerCase().includes(interest.trim().toLowerCase())
            )
          ))
        )
        .slice(0, 6)

      if (filteredMocks.length > 0) {
        setGiftResults(filteredMocks)
        setShowResults(true)
        setHasSearched(true)
        setError('Using backup gift ideas - they might not be as personalized!')
      } else {
        setError('No gift ideas found matching your criteria. Try different interests or occasion!')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = () => {
    setHasSearched(false)
    setFiltersChanged(true)
  }

  // Reset filtersChanged when search is performed
  useEffect(() => {
    if (hasSearched) {
      setFiltersChanged(false)
    }
  }, [hasSearched])

  const getAmazonSearchUrl = (searchTerm: string) => {
    trackGiftClick(searchTerm)
    return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=dadgiftidea-20`
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 via-amber-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-sky-600 mb-4">What Should I Get My Dad?</h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">{randomSubheadline}</p>
        </div>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-12 border border-amber-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={occasion} onValueChange={(value) => {
                  setOccasion(value)
                  handleFilterChange()
                }}>
                  <SelectTrigger id="occasion">
                    <SelectValue placeholder="Select an occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                    <SelectItem value="Christmas">Christmas</SelectItem>
                    <SelectItem value="Easter">Easter</SelectItem>
                    <SelectItem value="Father's Day">Father's Day</SelectItem>
                    <SelectItem value="New Year's">New Year's</SelectItem>
                    <SelectItem value="Just Because">Just Because</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Select value={budget} onValueChange={(value) => {
                  setBudget(value)
                  handleFilterChange()
                }}>
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select your budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under $25">Under $25</SelectItem>
                    <SelectItem value="Under $50">Under $50</SelectItem>
                    <SelectItem value="Under $100">Under $100</SelectItem>
                    <SelectItem value="No Budget">No Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Dad's Interests (separate with commas)</Label>
              <Input
                id="interests"
                placeholder="e.g., golf, grilling, fishing, technology"
                value={interests}
                onChange={handleInterestsChange}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      handleTagClick(tag)
                      handleFilterChange()
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${selectedTags.includes(tag)
                        ? 'bg-sky-600 text-white'
                        : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-sky-500 hover:bg-sky-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  {hasSearched ? "Show More Options" : "Find the Perfect Gift"}
                </>
              )}
            </Button>

            {error && (
              <div className="text-red-500 text-sm text-center mt-2">
                {error}
              </div>
            )}

          </form>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {giftResults.map((gift, index) => (
              <Card key={index} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-sky-600">{gift.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="w-full h-32 mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center text-center w-full px-4 h-full py-4">
                      {getGiftIcon(gift.interests)}
                      <span className="text-sm text-gray-500 mt-2 truncate w-full">{gift.interests[0] || 'Gift'}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{gift.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gift.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-sky-100 text-sky-600 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Price Range: {Array.isArray(gift.priceRange) ? gift.priceRange.join(' - ') : gift.priceRange}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#FF9900] hover:bg-[#e68a00]"
                    onClick={() => window.open(getAmazonSearchUrl(gift.amazonSearch), '_blank')}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Find on Amazon
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-600 mt-12">
          <p>© {new Date().getFullYear()} What Should I Get My Dad? | The ultimate dad gift finder</p>
          <p className="text-sm mt-2">{randomFooterJoke}</p>
          <p className="text-xs mt-4 text-gray-500 max-w-xl mx-auto">
            As an Amazon Associate, we earn from qualifying purchases. This means we may earn a commission if you click on certain links and make a purchase.
          </p>
        </footer>
      </div>
    </main>
  )
}
