import { NextResponse } from 'next/server'

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY
const TOGETHER_API_URL = 'https://api.together.xyz/inference'

// Define the GiftIdea type
interface GiftIdea {
  title: string
  description: string
  amazonSearch: string
  priceRange: string[]
  interests: string[]
  occasions: string[]
  imageUrl: string
}

// Fallback mock gift ideas
const mockGiftIdeas: GiftIdea[] = [
  {
    title: "Smart BBQ Thermometer",
    description: "Let dad monitor his grilling masterpiece from his phone. Because standing next to the grill with a beer was too easy!",
    amazonSearch: "Wireless Meat Thermometer for Grilling",
    priceRange: ["$25-$50"],
    interests: ["BBQ", "Tech"],
    occasions: ["Father's Day", "Birthday", "Christmas"],
    imageUrl: "/gift-placeholder.jpg"
  },
  {
    title: "Premium Tool Belt",
    description: "For the dad who loves DIY but keeps losing his tools. Now he can lose them all in one organized place!",
    amazonSearch: "Professional Tool Belt",
    priceRange: ["$30-$60"],
    interests: ["Tools", "DIY"],
    occasions: ["Father's Day", "Christmas", "Birthday"],
    imageUrl: "/gift-placeholder.jpg"
  },
  {
    title: "Deluxe Coffee Station",
    description: "Transform dad's morning routine from 'don't talk to me yet' to 'let me tell you about coffee origins'.",
    amazonSearch: "Home Coffee Bar Station",
    priceRange: ["$50-$100"],
    interests: ["Coffee", "Luxury"],
    occasions: ["Christmas", "Birthday", "Father's Day"],
    imageUrl: "/gift-placeholder.jpg"
  },
  {
    title: "Smart Home Starter Kit",
    description: "Give dad the power to control everything from his chair. Warning: May result in excessive 'Who touched the thermostat?' questions.",
    amazonSearch: "Smart Home Hub Starter Kit",
    priceRange: ["$75-$150"],
    interests: ["Tech", "Gadgets"],
    occasions: ["Christmas", "Birthday", "Father's Day"],
    imageUrl: "/gift-placeholder.jpg"
  },
  {
    title: "Personalized Grilling Set",
    description: "Custom BBQ tools that say 'These are dad's tongs' so everyone knows who's really the grill master.",
    amazonSearch: "Personalized BBQ Grilling Tools Set",
    priceRange: ["$40-$80"],
    interests: ["BBQ", "Outdoors"],
    occasions: ["Father's Day", "Birthday", "Christmas"],
    imageUrl: "/gift-placeholder.jpg"
  },
  {
    title: "Noise-Canceling Headphones",
    description: "For when dad says 'I just want some peace and quiet' but still wants to listen to his favorite tunes.",
    amazonSearch: "Premium Noise Canceling Headphones",
    priceRange: ["$100-$200"],
    interests: ["Tech", "Music"],
    occasions: ["Birthday", "Christmas", "Father's Day"],
    imageUrl: "/gift-placeholder.jpg"
  }
]

// Extract budget range from string
function extractBudgetRange(budget: string): { min: number; max: number } {
  if (!budget) return { min: 0, max: Infinity }

  const match = budget.match(/Under \$(\d+)/)
  if (match) {
    const max = parseInt(match[1])
    return { min: 0, max }
  }

  return { min: 0, max: Infinity }
}

function cleanAndParseResponse(text: string): GiftIdea[] {
  console.log('Cleaning and parsing response:', text)
  
  // If response is empty or too short, return mock data
  if (!text || text.trim().length < 10) {
    console.log('Response is empty or too short, using mock data')
    return mockGiftIdeas
  }

  try {
    // First try to parse the entire response as JSON
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      const validGifts = parsed.map(gift => ({
        ...gift,
        // Ensure all required fields are present and properly formatted
        title: gift.title || '',
        description: gift.description || '',
        amazonSearch: gift.amazonSearch || gift.title || '',
        priceRange: Array.isArray(gift.priceRange) ? gift.priceRange : ['$0', '$100'],
        interests: Array.isArray(gift.interests) ? gift.interests : [],
        occasions: Array.isArray(gift.occasions) ? gift.occasions : [],
        imageUrl: '/gift-placeholder.jpg'
      }))

      // If we have exactly 6 valid gifts, return them
      if (validGifts.length === 6) {
        return validGifts
      }
    }
  } catch (e) {
    console.log('Failed to parse as JSON array, trying to clean and parse...')
  }

  // Clean the text
  let cleaned = text
    .replace(/Example output:/g, '') // Remove example text
    .replace(/^\s*\[\s*|\s*\]\s*$/g, '') // Remove outer brackets if present
    .trim()

  // If cleaned text is empty, return mock data
  if (!cleaned) {
    console.log('Cleaned text is empty, using mock data')
    return mockGiftIdeas
  }

  // Split into individual objects
  const objects = cleaned.split(/\}\s*,\s*\{|\}\s*\{/).map(obj => {
    // Add back the curly braces if they were removed
    if (!obj.startsWith('{')) obj = '{' + obj
    if (!obj.endsWith('}')) obj = obj + '}'
    return obj
  })

  console.log('Found objects:', objects.length)

  const validGiftIdeas: GiftIdea[] = []
  
  for (const obj of objects) {
    try {
      // Clean up the object string
      const cleanedObj = obj
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/"\s*,\s*"/g, '","') // Fix spacing around commas
        .replace(/"\s*:\s*"/g, '":"') // Fix spacing around colons
        .replace(/"\s*:\s*\[/g, '":[') // Fix spacing around array colons
        .replace(/\[\s*"/g, '["') // Fix spacing in arrays
        .replace(/"\s*\]/g, '"]') // Fix spacing in arrays
        .replace(/"\s*,\s*\[/g, '",[') // Fix spacing before arrays
        .replace(/\]\s*,\s*"/g, '],"') // Fix spacing after arrays

      const parsed = JSON.parse(cleanedObj)
      
      // Validate the object has required fields
      if (
        typeof parsed.title === 'string' &&
        typeof parsed.description === 'string' &&
        typeof parsed.amazonSearch === 'string' &&
        Array.isArray(parsed.priceRange) &&
        Array.isArray(parsed.interests) &&
        Array.isArray(parsed.occasions)
      ) {
        validGiftIdeas.push({
          ...parsed,
          imageUrl: '/gift-placeholder.jpg'
        })
      }
    } catch (e) {
      console.log('Failed to parse object:', obj)
    }
  }

  console.log('Successfully parsed gift ideas:', validGiftIdeas.length)

  // If we have exactly 6 valid gifts, return them
  if (validGiftIdeas.length === 6) {
    return validGiftIdeas
  }

  // If we have more than 6 gifts, return the first 6
  if (validGiftIdeas.length > 6) {
    return validGiftIdeas.slice(0, 6)
  }

  // If we have less than 6 gifts, fill in with mock data
  const remainingGifts = 6 - validGiftIdeas.length
  const filledGifts = [...validGiftIdeas]
  
  // Add mock gifts until we have 6
  for (let i = 0; i < remainingGifts; i++) {
    filledGifts.push(mockGiftIdeas[i % mockGiftIdeas.length])
  }

  return filledGifts
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { occasion, interests, budget, isContinuation } = body

    // Set default values for empty fields
    const defaultOccasion = occasion || "Birthday"
    const defaultInterests = interests || "Tech, Tools, Sports"
    const defaultBudget = budget || "Under $100"

    // Extract budget range for price filtering
    const budgetRange = extractBudgetRange(defaultBudget)
    const maxPrice = budgetRange.max

    // Generate prompt for the AI
    const prompt = `Generate 6 unique and practical gift ideas for a dad, based on:
- Occasion: ${defaultOccasion}
- Interests: ${defaultInterests}
- Budget: Under $${maxPrice}

For each gift, return:
1. A clear, generic product name (no brands, no made-up names, no bundles — just one real item)
2. A short, light-hearted description (can be witty, but not confusing)
3. A generic Amazon search term (same as the product name, no brands)
4. A realistic price range under $${maxPrice}
5. Matching interests and occasions (as arrays)

Stay within budget: $0-$${maxPrice}. All gift suggestions MUST be under $${maxPrice}.

Examples of good product names:
- "Camping Chair", "Digital Meat Thermometer", "Golf Practice Net", "BBQ Tool Set"

Examples of bad product names:
- "Dad's Ultimate Grill Pack", "GrillMaster Pro 9000", "Coleman Tent" (no vague terms, fake names, or brands)

Output only a JSON array with this schema for each item:
{
  "title": "",
  "description": "",
  "amazonSearch": "",
  "priceRange": ["$25", "$50"],
  "interests": [],
  "occasions": []
}`

    // Make API request to Together
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        prompt,
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: 1.1,
        stop: ['</s>', '```']
      })
    })

    if (!response.ok) {
      throw new Error(`Together API error: ${response.status}`)
    }

    const data = await response.json()
    const rawOutput = data.output.choices[0].text
    console.log('Raw output text:', rawOutput)

    // Extract JSON string from the response
    const jsonMatch = rawOutput.match(/\[[\s\S]*\]/)
    const jsonString = jsonMatch ? jsonMatch[0] : '[]'
    console.log('Extracted JSON string:', jsonString)

    // Parse and clean the response
    const giftIdeas = cleanAndParseResponse(jsonString)

    // Validate the parsed gift ideas
    if (!Array.isArray(giftIdeas) || giftIdeas.length === 0) {
      console.error('Invalid gift ideas format:', giftIdeas)
      return NextResponse.json(
        { error: 'Failed to generate valid gift ideas' },
        { status: 500 }
      )
    }

    // Ensure each gift has all required fields and valid data
    const validatedGiftIdeas = giftIdeas.map(gift => ({
      ...gift,
      title: gift.title || '',
      description: gift.description || '',
      amazonSearch: gift.amazonSearch || gift.title || '',
      priceRange: Array.isArray(gift.priceRange) ? gift.priceRange : ['$0', '$100'],
      interests: Array.isArray(gift.interests) ? gift.interests : [],
      occasions: Array.isArray(gift.occasions) ? gift.occasions : [],
      imageUrl: '/gift-placeholder.jpg'
    }))

    // Filter gifts based on price only
    const filteredGiftIdeas = validatedGiftIdeas.filter(gift => {
      // Extract the maximum price from the price range
      const maxGiftPrice = Math.max(
        ...gift.priceRange.map(price => {
          const match = price.match(/\$(\d+)/)
          return match ? parseInt(match[1]) : 0
        })
      )
      return maxGiftPrice <= maxPrice
    })

    // If we have no gifts after price filtering, return all gifts
    const finalGiftIdeas = filteredGiftIdeas.length > 0 ? filteredGiftIdeas : validatedGiftIdeas

    return NextResponse.json({ 
      giftIdeas: finalGiftIdeas,
      hasMore: true // Always indicate there are more options available
    })
  } catch (error) {
    console.error('Error in generate route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 