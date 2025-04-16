import { NextResponse } from 'next/server'

const TOGETHER_API_URL = 'https://api.together.xyz/inference'
const TEST_API_KEY = 'tgp_v1_msSW-49BCw6cNEJw84E2zTFGa_1qQsy6sV0_61YlpuI'

export async function GET() {
  try {
    const prompt = `Generate 6 unique and thoughtful gift ideas for a dad based on these criteria:
    - Occasion: Father's Day
    - Interests: technology, grilling
    - Budget: Under $100
    
    For each gift idea, provide:
    1. A creative title
    2. A brief, humorous description
    3. A specific Amazon product name to search for
    4. A price range that matches the budget
    
    Format the response as a JSON array with these fields:
    - title
    - description
    - amazonSearch
    - priceRange
    - interests (array of relevant interests)
    - occasions (array of relevant occasions)`

    console.log('Making test API request to Together.ai...')
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        prompt,
        max_tokens: 1200,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: 1.1,
        stop: ['</s>', '```'],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Test API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Test API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Test API Response received:', data)
    
    let giftIdeas
    try {
      const jsonMatch = data.output.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        giftIdeas = JSON.parse(jsonMatch[1])
      } else {
        giftIdeas = JSON.parse(data.output)
      }
    } catch (error) {
      console.error('Error parsing test AI response:', error)
      throw new Error('Failed to parse test gift ideas')
    }

    return NextResponse.json({ giftIdeas })
  } catch (error) {
    console.error('Error in test route:', error)
    return NextResponse.json(
      { error: 'Failed in test route' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { occasion, interests, budget } = await request.json()

    const prompt = `Generate 6 unique and thoughtful gift ideas for a dad based on these criteria:
    - Occasion: ${occasion || 'any occasion'}
    - Interests: ${interests || 'general interests'}
    - Budget: ${budget || 'flexible budget'}
    
    For each gift idea, provide:
    1. A creative title
    2. A brief, humorous description
    3. A specific Amazon product name to search for
    4. A price range that matches the budget
    
    Format the response as a JSON array with these fields:
    - title
    - description
    - amazonSearch
    - priceRange
    - interests (array of relevant interests)
    - occasions (array of relevant occasions)`

    console.log('Making test API request to Together.ai...')
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        prompt,
        max_tokens: 1200,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: 1.1,
        stop: ['</s>', '```'],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Test API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Test API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Test API Response received:', data)
    
    let giftIdeas
    try {
      const jsonMatch = data.output.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        giftIdeas = JSON.parse(jsonMatch[1])
      } else {
        giftIdeas = JSON.parse(data.output)
      }
    } catch (error) {
      console.error('Error parsing test AI response:', error)
      throw new Error('Failed to parse test gift ideas')
    }

    return NextResponse.json({ giftIdeas })
  } catch (error) {
    console.error('Error in test route:', error)
    return NextResponse.json(
      { error: 'Failed in test route' },
      { status: 500 }
    )
  }
} 