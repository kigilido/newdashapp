
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { getLicensePlateModel } from "./models/license-plate.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MINDEE_API_KEY = Deno.env.get('MINDEE_API_KEY')
const MINDEE_WEBHOOK_ID = Deno.env.get('MINDEE_WEBHOOK_ID')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method === 'POST' && req.headers.get('x-mindee-webhook-id') === MINDEE_WEBHOOK_ID) {
      // Handle webhook callback from Mindee
      const webhookData = await req.json();
      console.log('Received webhook data from Mindee:', webhookData);
      
      // Process the webhook data and extract license plate
      // You'll need to implement this based on the webhook response format
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image } = await req.json()

    if (!image) {
      throw new Error('No image data provided')
    }

    // Get model configuration
    const model = getLicensePlateModel();
    console.log('Using model:', model.name, model.version);

    if (!MINDEE_API_KEY) {
      throw new Error('MINDEE_API_KEY is not configured')
    }

    // Extract base64 data
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    // Create form data
    const formData = new FormData();
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    formData.append('document', blob, 'license_plate.jpg');

    // If webhook ID is configured, add it to the request
    if (MINDEE_WEBHOOK_ID) {
      formData.append('webhook_id', MINDEE_WEBHOOK_ID);
    }

    console.log('Sending request to Mindee API...');

    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${MINDEE_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mindee API detailed error:', errorText);
      throw new Error(`Mindee API error: ${response.status} ${response.statusText}`);
    }

    // For now, return a processing status
    return new Response(
      JSON.stringify({
        status: 'processing',
        message: 'Image is being processed. Results will be sent via webhook.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})
