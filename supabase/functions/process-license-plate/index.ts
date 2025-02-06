
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createWorker } from 'https://cdn.skypack.dev/tesseract.js@4.1.1';

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

    console.log('Starting OCR process...');
    
    // Convert base64 to binary if it's a base64 string
    let imageData = image;
    if (image.startsWith('data:image')) {
      const base64Data = image.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageData = bytes;
    }

    console.log('Creating Tesseract worker...');
    const worker = await createWorker();
    
    try {
      console.log('Loading language...');
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      console.log('Setting parameters...');
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      });

      console.log('Starting recognition...');
      const { data: { text } } = await worker.recognize(imageData);
      console.log('Raw OCR result:', text);

      // Clean and process the text
      const cleanText = text.replace(/[^A-Z0-9]/g, '').toUpperCase();
      console.log('Cleaned text:', cleanText);
      
      const licensePlateMatch = cleanText.match(/[A-Z0-9]{5,8}/);
      const licensePlate = licensePlateMatch ? licensePlateMatch[0] : 'NO_PLATE_FOUND';
      
      console.log('Extracted license plate:', licensePlate);

      await worker.terminate();

      return new Response(
        JSON.stringify({ 
          success: true,
          licensePlate, 
          rawText: text.trim() 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );

    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (error) {
          console.error('Error terminating worker:', error);
        }
      }
    }

  } catch (error) {
    console.error('Error in license plate processing:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process image'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
