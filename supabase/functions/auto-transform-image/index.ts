import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      throw new Error("No image data provided");
    }

    // Ensure the base64 string has proper data URL format
    let imageUrl = imageBase64;
    if (!imageUrl.startsWith("data:")) {
      imageUrl = `data:image/png;base64,${imageUrl}`;
    }

    console.log("Sending image to AI for enhancement...");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please enhance and restore this image to its best possible quality. Clean up any visual noise, artifacts, or distracting overlaid elements. Reconstruct any obscured areas naturally so the image looks pristine and professional. Preserve the original scene, subject, and composition exactly. Output a high-quality, vivid, sharp version of this photo.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI could not process this image. Using local enhancement instead.", fallback: true }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received, keys:", JSON.stringify(Object.keys(data)));

    // Try multiple possible response structures for the image
    let processedImageUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      data.choices?.[0]?.message?.images?.[0]?.url ||
      data.choices?.[0]?.message?.images?.[0];

    // Check if inline_data format (base64 in response)
    if (!processedImageUrl) {
      const parts = data.choices?.[0]?.message?.content;
      if (Array.isArray(parts)) {
        for (const part of parts) {
          if (part.type === "image_url") {
            processedImageUrl = part.image_url?.url || part.url;
            break;
          }
          if (part.inline_data) {
            processedImageUrl = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
            break;
          }
        }
      }
    }

    if (!processedImageUrl) {
      console.error("No image in AI response:", JSON.stringify(data).slice(0, 800));
      // Return a fallback message instead of 500 so frontend can use canvas fallback
      return new Response(
        JSON.stringify({ error: "AI could not process this image. Using local enhancement instead.", fallback: true }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ processedImageUrl }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("auto-transform-image error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
