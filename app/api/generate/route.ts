import { NextResponse } from 'next/server'

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY
const TOGETHER_API_URL = 'https://api.together.xyz/inference'
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

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
  }
]

// Helper function to generate image search term
const generateImageSearchTerm = (title: string): string => {
  // Remove any special characters and extra spaces
  const cleanTitle = title
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Map of specific product categories to better search terms
  const searchTermMap: { [key: string]: string } = {
    'BBQ': 'barbecue grill cooking',
    'Golf': 'golf club sport',
    'Thermometer': 'digital thermometer cooking',
    'Tool Set': 'professional tools workshop',
    'Watch': 'luxury watch wrist',
    'Headphones': 'premium headphones audio',
    'Camera': 'professional camera photography',
    'Knife': 'premium knife kitchen',
    'Grill': 'outdoor grill bbq',
    'Coffee': 'coffee maker brewing',
    'Speaker': 'bluetooth speaker audio',
    'Wallet': 'leather wallet mens',
    'Sunglasses': 'mens sunglasses fashion',
    'Bag': 'mens leather bag'
  };

  // Check if the title contains any of our mapped terms
  for (const [key, value] of Object.entries(searchTermMap)) {
    if (cleanTitle.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // If no specific mapping, use the cleaned title + some context
  return cleanTitle + ' product photography';
}

// Helper function to generate reliable Unsplash image URLs
const generateUnsplashUrl = (searchTerm: string): string => {
  try {
    // Default categories for fallback
    const defaultCategories = ['gift', 'gadget', 'tool', 'hobby', 'lifestyle'];
    
    // Clean and prepare keywords
    const keywords = searchTerm
      .toLowerCase()
      .replace(/[^\w\s]/g, '')         // Remove punctuation
      .split(' ')                       // Split into individual words
      .filter(w => w.length > 2)        // Remove very short/common words
      .slice(0, 3)                      // Limit to 3 keywords max
      .join(',');
    
    // If we have valid keywords, use them; otherwise use random default category
    if (keywords.length > 0) {
      return `https://source.unsplash.com/800x600/?${keywords}`;
    } else {
      const randomCategory = defaultCategories[Math.floor(Math.random() * defaultCategories.length)];
      return `https://source.unsplash.com/800x600/?${randomCategory}`;
    }
  } catch (error) {
    console.error('Error generating Unsplash URL:', error);
    return `https://source.unsplash.com/800x600/?gift`;
  }
}

// Helper function to get image from Pixabay
async function getPixabayImage(query: string): Promise<string> {
  try {
    if (!PIXABAY_API_KEY) {
      console.warn('Pixabay API key not configured')
      return '/gift-placeholder.jpg' // You should add a placeholder image in your public folder
    }

    // Clean and prepare the search query
    const searchQuery = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(w => w.length > 2)
      .slice(0, 2)
      .join(' ')

    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&safesearch=true&per_page=3`
    )

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`)
    }

    const data = await response.json()
    return data.hits?.[0]?.webformatURL || '/gift-placeholder.jpg'
  } catch (error) {
    console.error('Error fetching Pixabay image:', error)
    return '/gift-placeholder.jpg'
  }
}

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

export async function POST(request: Request) {
  try {
    const { occasion, interests, budget, isContinuation = false } = await request.json()
    console.log('Received request:', { occasion, interests, budget, isContinuation })

    if (!TOGETHER_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Extract budget constraints
    const { min, max } = extractBudgetRange(budget)
    const budgetConstraint = budget ? `Stay within budget: $0-$${max}. All gift suggestions MUST be under $${max}.` : ''

    const prompt = isContinuation 
      ? `Generate 6 more gift ideas similar to previous suggestions. These should be for a dad who likes ${interests || 'various activities'}, for ${occasion || 'any occasion'}.

Remember:
- Use generic product names (no brands or bundles)
- Keep descriptions light and fun
- Match the interests and occasion
${budgetConstraint}

Output only a JSON array with this schema:
{
  "title": "",
  "description": "",
  "amazonSearch": "",
  "priceRange": ["$25", "$50"],
  "interests": [],
  "occasions": []
}`
      : `Generate 6 unique and practical gift ideas for a dad, based on:

- Occasion: ${occasion || 'any occasion'}
- Interests: ${interests || 'general interests'}
- Budget: ${budget || 'flexible'}

For each gift, return:
1. A clear, generic product name (no brands, no made-up names, no bundles — just one real item)
2. A short, light-hearted description (can be witty, but not confusing)
3. A generic Amazon search term (same as the product name, no brands)
4. A realistic price range ${budgetConstraint ? `under $${max}` : ''}
5. Matching interests and occasions (as arrays)

${budgetConstraint}

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

    console.log('Making API request to Together.ai...')
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        prompt,
        max_tokens: isContinuation ? 800 : 1500,
        temperature: isContinuation ? 0.8 : 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: isContinuation ? 1.2 : 1.1,
        stop: ['</s>', '```'],
      }),
    })

    if (!response.ok) {
      throw new Error(`Together.ai API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('API Response received:', data)
    
    try {
      const outputText = data.output.choices[0].text
      console.log('Raw output text:', outputText)
      
      // Clean and format the response text
      const cleanResponse = outputText
        // Remove numbered prefixes like "1.", "2.", etc.
        .replace(/^\d+\.\s*/gm, '')
        // Remove any "Example:" prefix
        .replace(/^Example:\s*/i, '')
        // Remove any comments
        .replace(/\/\/.*$/gm, '')
        // Ensure proper array formatting
        .replace(/}\s*{/g, '},{')
        .trim()

      // Wrap in array brackets if not present
      const jsonStr = cleanResponse.startsWith('[') ? cleanResponse : `[${cleanResponse}]`
      
      console.log('Cleaned JSON string:', jsonStr)
      
      const giftIdeas = JSON.parse(jsonStr)
      
      if (!Array.isArray(giftIdeas)) {
        throw new Error('Invalid gift ideas format')
      }

      // Filter out any invalid items and take first 6
      const validGiftIdeas = giftIdeas
        .filter(gift => 
          gift && 
          typeof gift === 'object' && 
          typeof gift.title === 'string' && 
          gift.title.trim() !== ''
        )
        .slice(0, 6)

      // If we have less than 6 items, fill with mock data
      let finalGiftIdeas = validGiftIdeas
      if (validGiftIdeas.length < 6) {
        // Get random items from mockGiftIdeas that aren't too similar to existing ideas
        const mockIdeas = mockGiftIdeas
          .filter((mock: GiftIdea) => !validGiftIdeas.some(valid => 
            valid.title.toLowerCase().includes(mock.title.toLowerCase()) ||
            mock.title.toLowerCase().includes(valid.title.toLowerCase())
          ))
          .sort(() => Math.random() - 0.5)
          .slice(0, 6 - validGiftIdeas.length)

        finalGiftIdeas = [...validGiftIdeas, ...mockIdeas]
      }
      
      // Add image URLs to each gift idea using Pixabay
      const giftIdeasWithImages = await Promise.all(
        finalGiftIdeas.map(async (gift: any) => {
          // Filter out gifts that exceed budget
          if (max !== Infinity) {
            const giftMax = parseInt(gift.priceRange[1].replace('$', ''))
            if (giftMax > max) {
              console.log(`Filtering out gift "${gift.title}" as it exceeds budget: $${giftMax} > $${max}`)
              return null
            }
          }

          console.log(`Fetching image for "${gift.title}" using search term "${gift.amazonSearch}"`)
          const imageUrl = await getPixabayImage(gift.amazonSearch)
          return {
            ...gift,
            imageUrl
          }
        })
      )

      // Filter out any null results (gifts that exceeded budget)
      const filteredGiftIdeas = giftIdeasWithImages.filter(gift => gift !== null)

      console.log('Successfully parsed gift ideas with images:', filteredGiftIdeas)
      return NextResponse.json({ giftIdeas: filteredGiftIdeas })
    } catch (error) {
      console.error('Error processing response:', error)
      return NextResponse.json(
        { error: 'Failed to process gift ideas' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('General error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 