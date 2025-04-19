import { NextResponse } from 'next/server'

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY
const TOGETHER_API_URL = 'https://api.together.xyz/inference'

// Helper function to generate Unsplash image URL
const generateImageUrl = (title: string) => {
  const searchQuery = encodeURIComponent(title.replace(/[^a-zA-Z0-9 ]/g, '').trim())
  return `https://source.unsplash.com/featured/400x300/?${searchQuery}`
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

    const prompt = `Generate 6 unique and thoughtful gift ideas for a dad based on these criteria:
    - Occasion: ${occasion || 'any occasion'}
    - Interests: ${interests || 'general interests'}
    - Budget: ${budget || 'flexible budget'}
    
    For each gift idea, provide:
    1. A clear, descriptive product name (e.g., "Bluetooth BBQ Thermometer" or "Noise-Canceling Headphones")
    2. A brief, humorous description
    3. A specific Amazon product name to search for
    4. A price range that matches the budget
    
    Important rules:
    - Product names should be clear and descriptive, not humorous
    - Only suggest real, standalone products commonly found on Amazon
    - No fictional product combinations or kits
    - Keep the humor in the description only
    
    Format the response as a JSON array with these fields:
    - title (clear product name)
    - description (humorous description)
    - amazonSearch (specific product name for Amazon search)
    - priceRange (array of price ranges)
    - interests (array of relevant interests)
    - occasions (array of relevant occasions)`

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
        max_tokens: isContinuation ? 800 : 1200,
        temperature: isContinuation ? 0.8 : 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: isContinuation ? 1.2 : 1.1,
        stop: ['</s>', '```'],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Together.ai API Error:', errorData)
      return NextResponse.json(
        { error: `Together.ai API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('API Response received:', data)
    
    try {
      const outputText = data.output.choices[0].text
      console.log('Raw output text:', outputText)
      
      // Try to parse the JSON directly
      let jsonStr = ''
      try {
        // Find the first [ and last ] to get the JSON array
        const startIndex = outputText.indexOf('[')
        const endIndex = outputText.lastIndexOf(']')
        
        if (startIndex === -1 || endIndex === -1) {
          throw new Error('Could not find JSON array boundaries')
        }
        
        jsonStr = outputText.slice(startIndex, endIndex + 1)
        console.log('Extracted JSON string:', jsonStr)
        
        const giftIdeas = JSON.parse(jsonStr)
        
        // Add image URLs to each gift idea
        const giftIdeasWithImages = giftIdeas.map((gift: any) => ({
          ...gift,
          imageUrl: generateImageUrl(gift.title)
        }))
        
        console.log('Successfully parsed gift ideas with images:', giftIdeasWithImages)
        return NextResponse.json({ giftIdeas: giftIdeasWithImages })
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError)
        console.error('JSON string that failed to parse:', jsonStr)
        throw parseError
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
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