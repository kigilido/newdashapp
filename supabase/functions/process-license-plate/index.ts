
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createWorker } from 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.3/dist/tesseract.esm.min.js';

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

    console.log('Starting Tesseract worker...');
    const worker = await createWorker({
      logger: m => console.log(m),
      errorHandler: err => console.error('Tesseract Error:', err)
    });

    console.log('Loading language...');
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    console.log('Setting parameters...');
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    });

    console.log('Starting recognition...');
    const { data: { text } } = await worker.recognize(image);
    console.log('Recognition complete. Raw text:', text);
    
    await worker.terminate();

    // Clean and process the text
    const cleanText = text.replace(/\s+/g, '').toUpperCase();
    const licensePlateMatch = cleanText.match(/[A-Z0-9]{5,8}/);
    const licensePlate = licensePlateMatch ? licensePlateMatch[0] : 'NO_PLATE_FOUND';
    
    console.log('Processed license plate:', licensePlate);

    return new Response(
      JSON.stringify({ licensePlate, rawText: text.trim() }),
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
