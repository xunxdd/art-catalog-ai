import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ArtworkAnalysis {
  title: string;
  artist?: string;
  medium: string;
  estimatedYear?: string;
  condition: string;
  style: string[];
  themes: string[];
  colors: string[];
  suggestedPrice: number;
  description: string;
  confidence: number;
}

export async function analyzeArtworkImage(base64Image: string): Promise<ArtworkAnalysis> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert art appraiser and cataloger. Analyze the artwork image and provide detailed information in JSON format. Be professional and accurate in your assessment.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this artwork image and provide the following information in JSON format:
              - title: A descriptive title for the artwork
              - artist: Artist name if recognizable (or null if unknown)
              - medium: The artistic medium used (e.g., "Oil on Canvas", "Acrylic", "Watercolor", etc.)
              - estimatedYear: Estimated year or decade if determinable
              - condition: Condition assessment ("Excellent", "Good", "Fair", "Poor")
              - style: Array of art styles/movements (e.g., ["Abstract Expressionism", "Contemporary"])
              - themes: Array of themes/subjects depicted
              - colors: Array of dominant colors
              - suggestedPrice: Estimated market value in USD (integer)
              - description: Detailed professional description (2-3 sentences)
              - confidence: Your confidence in this analysis (0-1 scale)`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(visionResponse.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Untitled Artwork",
      artist: result.artist || undefined,
      medium: result.medium || "Mixed Media",
      estimatedYear: result.estimatedYear || undefined,
      condition: result.condition || "Good",
      style: Array.isArray(result.style) ? result.style : [],
      themes: Array.isArray(result.themes) ? result.themes : [],
      colors: Array.isArray(result.colors) ? result.colors : [],
      suggestedPrice: typeof result.suggestedPrice === 'number' ? result.suggestedPrice : 500,
      description: result.description || "A unique artwork with distinctive characteristics.",
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.7
    };
  } catch (error) {
    console.error("Error analyzing artwork:", error);
    throw new Error("Failed to analyze artwork: " + error.message);
  }
}

export async function generateArtworkDescription(artwork: {
  title: string;
  medium?: string;
  style?: string[];
  themes?: string[];
  colors?: string[];
}): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert art writer creating compelling descriptions for artwork listings. Write engaging, professional descriptions that would appeal to collectors and art enthusiasts."
        },
        {
          role: "user",
          content: `Create a compelling artwork description for:
          Title: ${artwork.title}
          Medium: ${artwork.medium || 'Mixed Media'}
          Style: ${artwork.style?.join(', ') || 'Contemporary'}
          Themes: ${artwork.themes?.join(', ') || 'Abstract'}
          Colors: ${artwork.colors?.join(', ') || 'Various'}
          
          Write 2-3 sentences that would be compelling for potential buyers.`
        }
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "A captivating artwork that demonstrates exceptional artistic skill and creative vision.";
  } catch (error) {
    console.error("Error generating description:", error);
    throw new Error("Failed to generate description: " + error.message);
  }
}

export async function suggestArtworkPrice(artwork: {
  medium?: string;
  style?: string[];
  dimensions?: string;
  artist?: string;
  condition?: string;
}): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an art market expert. Provide realistic price estimates for artworks based on current market conditions. Respond with JSON containing a price in USD."
        },
        {
          role: "user",
          content: `Estimate the market value for an artwork with these characteristics:
          Medium: ${artwork.medium || 'Mixed Media'}
          Style: ${artwork.style?.join(', ') || 'Contemporary'}
          Dimensions: ${artwork.dimensions || 'Medium size'}
          Artist: ${artwork.artist || 'Emerging/Unknown'}
          Condition: ${artwork.condition || 'Good'}
          
          Provide a realistic market price estimate in JSON format: {"price": number}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"price": 500}');
    return typeof result.price === 'number' ? result.price : 500;
  } catch (error) {
    console.error("Error suggesting price:", error);
    return 500; // Default fallback price
  }
}
