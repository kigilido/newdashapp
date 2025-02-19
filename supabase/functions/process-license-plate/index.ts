
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()

    if (!image) {
      throw new Error('No image data provided')
    }

    // Send image to OpenAI Vision API for analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a license plate OCR system. Extract ONLY the license plate number from the image. If you can't find a license plate, respond with 'NO_PLATE_FOUND'. Only extract alphanumeric characters that are clearly visible."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What is the license plate number in this image? Return ONLY the plate number, nothing else."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 50
      })
    })

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from OCR service')
    }

    const extractedText = data.choices[0].message.content.trim()
    
    // Clean up the license plate text
    const licensePlate = extractedText === 'NO_PLATE_FOUND' 
      ? 'NO_PLATE_FOUND'
      : extractedText.replace(/[^A-Z0-9]/gi, '').toUpperCase()

    return new Response(
      JSON.stringify({
        licensePlate,
        rawText: extractedText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
