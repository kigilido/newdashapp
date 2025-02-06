
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { image } = await req.json();
    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Processing license plate image...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a license plate OCR system. Extract the license plate number AND all visible text from the image. Return both the license plate number and the raw text found. If no license plate is visible, return "NO_PLATE_FOUND" for the license plate number.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Extract the license plate number and all text visible in this image.' 
              },
              { 
                type: 'image_url', 
                image_url: { url: image }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OCR response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const rawText = data.choices[0].message.content;
    // Try to extract license plate from the response
    const licensePlate = rawText.includes('NO_PLATE_FOUND') ? 'NO_PLATE_FOUND' : 
                        rawText.match(/[A-Z0-9]{5,8}/)?.[0] || 'NO_PLATE_FOUND';
    
    return new Response(
      JSON.stringify({ licensePlate, rawText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing license plate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
