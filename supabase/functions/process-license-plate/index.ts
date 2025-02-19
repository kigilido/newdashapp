
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { getLicensePlateModel } from "./models/license-plate.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MINDEE_API_KEY = Deno.env.get('MINDEE_API_KEY')
const MINDEE_WEBHOOK_ID = Deno.env.get('MINDEE_WEBHOOK_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface MindeeResponse {
  api_request: {
    error: Record<string, unknown>;
    resources: string[];
    status: string;
    status_code: number;
    url: string;
  };
  document: {
    id: string;
    inference: {
      finished_at: string;
      started_at: string;
      processing_time: number;
      prediction: {
        license_plate_number: {
          value: string | null;
        };
        state: {
          value: string | null;
        };
        vehicle_make: {
          value: string | null;
        };
        vehicle_model: {
          value: string | null;
        };
        vehicle_year: {
          value: string | null;
        };
      };
      product: {
        features: string[];
        name: string;
        version: string;
      };
    };
    n_pages: number;
    name: string;
  };
  job: {
    available_at: string;
    id: string;
    issued_at: string;
    status: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    // Handle webhook callback from Mindee
    if (req.method === 'POST' && req.headers.get('x-mindee-webhook-id') === MINDEE_WEBHOOK_ID) {
      const webhookData = await req.json() as MindeeResponse;
      console.log('Received webhook data from Mindee:', webhookData);

      let licensePlate = 'NO_PLATE_FOUND';
      let rawText = '';

      if (webhookData.document?.inference?.prediction?.license_plate_number?.value) {
        licensePlate = webhookData.document.inference.prediction.license_plate_number.value.toUpperCase();
        const details = [
          webhookData.document.inference.prediction.state?.value,
          webhookData.document.inference.prediction.vehicle_make?.value,
          webhookData.document.inference.prediction.vehicle_model?.value,
          webhookData.document.inference.prediction.vehicle_year?.value
        ].filter(Boolean).join(' ');
        rawText = details || '';
      }

      const { error } = await supabaseClient
        .from('license_plate_results')
        .update({
          license_plate: licensePlate,
          raw_text: rawText,
          status: 'completed'
        })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error storing license plate result:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image } = await req.json();

    if (!image) {
      throw new Error('No image data provided');
    }

    const model = getLicensePlateModel();
    console.log('Using model:', model.name, model.version);

    if (!MINDEE_API_KEY) {
      throw new Error('MINDEE_API_KEY is not configured');
    }

    // Extract base64 data
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    // Create form data for Mindee API
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

    if (MINDEE_WEBHOOK_ID) {
      formData.append('webhook_id', MINDEE_WEBHOOK_ID);
    }

    console.log('Sending request to Mindee API...');
    console.log('Endpoint:', model.endpoint);

    // Make initial async request
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

    const result = await response.json();
    console.log('Mindee API initial response:', result);

    return new Response(
      JSON.stringify({
        status: 'processing',
        message: 'Image is being processed. Results will be sent via webhook.',
        job_id: result.job?.id || result.document?.id
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
