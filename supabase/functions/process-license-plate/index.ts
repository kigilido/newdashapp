
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createWorker } from 'https://esm.sh/tesseract.js@5.0.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Processing license plate image with Tesseract...');

    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Configure Tesseract to look for text that might be a license plate
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    });

    const result = await worker.recognize(image);
    console.log('Tesseract result:', result);
    
    await worker.terminate();

    const rawText = result.data.text.trim();
    // Try to extract license plate from the text (looking for patterns that match license plates)
    const licensePlate = rawText.match(/[A-Z0-9]{5,8}/)?.[0] || 'NO_PLATE_FOUND';
    
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
