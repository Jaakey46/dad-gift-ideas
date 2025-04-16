"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Gift, Search, ShoppingBag, Loader2 } from "lucide-react"

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
  "Finding the perfect gift for the man who has everything (except maybe a sense of style)",
  "Because another tie just isn't going to cut it this year",
  "For the dad who says he doesn't want anything but secretly hopes you got him something cool",
  "Gift ideas that won't end up in his 'drawer of forgotten presents'",
  "Help your dad upgrade from 'World's Best Dad' mug to something he'll actually use",
  "Turning dad jokes into dad gifts, one scroll at a time",
  "Making up for last year's socks",
  "Because he's still talking about that mug you got him in 2017",
  "Let's make this year less 'meh' and more 'whoa!'",
  "He said 'Don't get me anything' — we translated that to 'Surprise me'",
]

// Rotating footer jokes
const footerJokes = [
  "We don't guarantee your dad will like these gifts, but we do guarantee he'll pretend to.",
  "If your dad says he doesn't like his gift, remind him you inherited your taste from him.",
  "Our gifts are dad-tested, child-approved, and mom-tolerated.",
  "Perfect for the man who taught you everything you know (except how to pick good gifts).",
  "Because the best gift is your love and appreciation... but these are pretty good too.",
  "We tested these gifts on real dads. The groans were glorious.",
  "Disclaimer: may cause spontaneous backyard grilling",
  "Side effects may include unsolicited dad advice",
  "He'll pretend to like it — we make sure he actually will",
  "Perfect for Father's Day or Random Tuesday",
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
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    setInterests(newTags.join(", "))
    trackFilterClick('interest', tag)
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
    return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`
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
                onChange={(e) => {
                  setInterests(e.target.value)
                  handleFilterChange()
                }}
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
              className="w-full bg-sky-500 hover:bg-orange-500"
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
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Perfect Gifts For Your Dad</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giftResults.map((gift, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow border-amber-100">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                      <Gift className="h-16 w-16 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl mb-2">{gift.title}</CardTitle>
                    <p className="text-gray-600 mb-4">{gift.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {gift.interests?.map((interest: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Price Range: {gift.priceRange?.[0] || 'Not specified'}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      onClick={() => window.open(getAmazonSearchUrl(gift.amazonSearch), '_blank')}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Find on Amazon
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-600 mt-12">
          <p>© {new Date().getFullYear()} What Should I Get My Dad? | The ultimate dad gift finder</p>
          <p className="text-sm mt-2">{randomFooterJoke}</p>
        </footer>
      </div>
    </main>
  )
}
