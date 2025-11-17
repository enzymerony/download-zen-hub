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
    const { image, enhancementLevel = 50 } = await req.json();
    
    // Validate image exists
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate image format
    if (!image.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format. Must be a valid image data URL.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate image size (10MB limit)
    const sizeInBytes = (image.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (sizeInBytes > maxSize) {
      return new Response(
        JSON.stringify({ error: 'Image size exceeds 10MB limit' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate enhancement level
    if (typeof enhancementLevel !== 'number' || enhancementLevel < 0 || enhancementLevel > 100) {
      return new Response(
        JSON.stringify({ error: 'Enhancement level must be a number between 0 and 100' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting photo enhancement with level:', enhancementLevel);

    // Create enhancement prompt based on level
    let enhancementPrompt = '';
    if (enhancementLevel < 30) {
      enhancementPrompt = 'Lightly enhance this photo by improving sharpness and clarity while maintaining natural look';
    } else if (enhancementLevel < 70) {
      enhancementPrompt = 'Enhance this photo significantly: improve sharpness, increase detail clarity, enhance colors, reduce noise, and restore faded areas';
    } else {
      enhancementPrompt = 'Dramatically enhance this photo to maximum quality: significantly sharpen details, restore damaged areas, deeply enhance colors and contrast, remove all noise and blur, and make it look professionally restored';
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: enhancementPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credit limit reached. Please add credits to continue.' }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      throw new Error('No enhanced image returned from AI');
    }

    console.log('Photo enhancement completed successfully');

    return new Response(
      JSON.stringify({ enhancedImage: enhancedImageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in enhance-photo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});