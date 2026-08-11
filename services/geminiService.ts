
import { GoogleGenAI, Type, Chat, VideosOperation } from "@google/genai";
import { PROMPTS } from '../constants';
import { ImmigrationPathway, EligibilityInputs, Language, ApplicationTimeline, PathwayAnalysisResult, OfficeFinderResult, ApplicationCostResult, DocumentPrepPlanResult, NewsAnalysisMode, DestinationExperience, ImmigrationBriefing } from '../types';

let ai: GoogleGenAI | null = null;

const getApiKey = (): string => {
  // Vite: import.meta.env.VITE_GEMINI_API_KEY, legacy: process.env.API_KEY
  const viteKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
  const procKey = (typeof process !== 'undefined' && (process as any).env?.API_KEY) || (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) || '';
  return viteKey || procKey || '';
};

const getAI = () => {
  if (!ai) {
    const key = getApiKey();
    if (!key) {
      throw new Error("GEMINI_API_KEY not set — add VITE_GEMINI_API_KEY to .env.local (see .env.example)");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
};

export const startChat = (language: Language): Chat => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: PROMPTS.aiConsultant(language).systemInstruction,
    },
  });
  return chat;
};

export const generateImmigrationBriefing = async (language: Language): Promise<ImmigrationBriefing> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      visaTip: { type: Type.STRING },
      countrySpotlight: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          icon: { type: Type.STRING, description: "A single, relevant emoji." },
        },
        required: ['name', 'description', 'icon'],
      },
      quickFact: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ['question', 'answer'],
      },
      positiveNews: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          source: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              uri: { type: Type.STRING, description: "A plausible but placeholder URI." },
            },
            required: ['title', 'uri'],
          },
        },
        required: ['summary', 'source'],
      },
    },
    required: ['visaTip', 'countrySpotlight', 'quickFact', 'positiveNews'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: "Generate a new immigration briefing." }] },
    config: {
      systemInstruction: PROMPTS.immigrationBriefingGenerator(language).systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });
  
  return JSON.parse(response.text);
};


export const generateImmigrationPathways = async (
  inputs: EligibilityInputs,
  language: Language
): Promise<ImmigrationPathway[]> => {
  const ai = getAI();

  const immigrationStepSchema = {
    type: Type.OBJECT,
    properties: {
      icon: { type: Type.STRING, description: "A single emoji representing the step." },
      name: { type: Type.STRING },
      description: { type: Type.STRING },
      duration: { type: Type.STRING, description: "A plausible estimated duration for the step (e.g., '2-4 weeks', '3 months')." }
    },
    required: ['icon', 'name', 'description', 'duration']
  };

  const immigrationPathwaySchema = {
      type: Type.OBJECT,
      properties: {
          pathwayTitle: { type: Type.STRING },
          profileSummary: { type: Type.STRING },
          suggestedSteps: { type: Type.ARRAY, items: immigrationStepSchema },
          disclaimer: { type: Type.STRING, description: "A brief, friendly but firm disclaimer that this is an AI-generated suggestion and a real consultation with a licensed consultant is mandatory." }
      },
      required: ['pathwayTitle', 'profileSummary', 'suggestedSteps', 'disclaimer']
  };
  
  const schema = {
    type: Type.ARRAY,
    items: immigrationPathwaySchema,
  } as any;

  let userPromptText = `User Profile: "${inputs.profileDescription}".\nINSTRUCTION: Generate EXACTLY 2 DISTINCT immigration pathways. They must differ in strategy (e.g., Pathway 1: Skilled Worker/Express Entry, Pathway 2: Alternative such as Student, Provincial Nominee, Investor, or Family). Do NOT duplicate.\n`;

  if (inputs.useHistory && inputs.backgroundInfo) {
    userPromptText += `Additional Info: "Please consider the following details when making suggestions: ${inputs.backgroundInfo}".\n`;
  }
  
  if (inputs.supportingDocument) {
     userPromptText += "Additionally, please analyze the attached document for keywords related to the user's qualifications and tailor suggestions accordingly.";
  }

  const textPart = { text: userPromptText };
  const parts: ({ text: string; } | { inlineData: { data: string; mimeType: string; }; })[] = [textPart];

  if (inputs.supportingDocument) {
    const imagePart = {
      inlineData: {
        data: inputs.supportingDocument.base64,
        mimeType: inputs.supportingDocument.mimeType,
      },
    };
    parts.unshift(imagePart);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: parts },
    config: {
      systemInstruction: PROMPTS.immigrationPathwayGenerator(language).systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });
  const parsed = JSON.parse(response.text);
  if (Array.isArray(parsed) && parsed.length >= 2) {
    return parsed.slice(0, 2);
  }
  if (Array.isArray(parsed) && parsed.length === 1) {
    // Fallback: ask model again? For now duplicate with note
    const dup = { ...parsed[0], pathwayTitle: parsed[0].pathwayTitle + " (Alternative View)", disclaimer: parsed[0].disclaimer };
    return [parsed[0], dup];
  }
  return parsed;
};

export interface DestinationExperienceTextResult {
  culturalInsights: string;
  jobMarketOverview: string[];
  lifestyleTips: string;
  cityscapeImagePrompt: string;
  localAmbianceImagePrompt: string;
}

export const generateDestinationExperienceText = async (description: string, language: Language): Promise<DestinationExperienceTextResult> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      culturalInsights: { type: Type.STRING, description: "A short, welcoming paragraph about the culture." },
      jobMarketOverview: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 simple tips about the job market." },
      lifestyleTips: { type: Type.STRING, description: "A descriptive paragraph of the local lifestyle." },
      cityscapeImagePrompt: { type: Type.STRING, description: "A detailed, artistic prompt for an image generator to create a cityscape image." },
      localAmbianceImagePrompt: { type: Type.STRING, description: "A detailed, artistic prompt for an image generator to create a local ambiance scene." },
    },
    required: ['culturalInsights', 'jobMarketOverview', 'lifestyleTips', 'cityscapeImagePrompt', 'localAmbianceImagePrompt'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: `Generate a destination experience for a person with this profile: ${description}` }] },
    config: {
      systemInstruction: PROMPTS.destinationExperienceGenerator(language).systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  return JSON.parse(response.text);
};

export const generateImage = async (
    prompt: string,
    context: 'product' | 'ambiance',
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1',
    numberOfImages: number = 1
): Promise<string[]> => {
    const ai = getAI();
    
    const ambianceKeywords = "photorealistic, natural light, vibrant, high detail, professional photography";
    
    let enhancedPrompt = `${prompt}, ${ambianceKeywords}`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    }
    throw new Error("Image generation failed to produce any images.");
};

export const analyzePathway = async (description: string, language: Language): Promise<PathwayAnalysisResult> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      primaryPathway: { type: Type.STRING },
      pathwayDescription: { type: Type.STRING },
      potentialCountries: { type: Type.ARRAY, items: { type: Type.STRING } },
      nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
      eligibilityFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
      disclaimer: { type: Type.STRING },
    },
    required: ['primaryPathway', 'pathwayDescription', 'potentialCountries', 'nextSteps', 'eligibilityFactors', 'disclaimer']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: description }] },
    config: {
      systemInstruction: PROMPTS.pathwayAnalyzer(language).systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  return JSON.parse(response.text);
};

// FIX: Added missing generateMatches function for LawyerFinder component.
export const generateMatches = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
    });
    return response.text;
};

export const generateImmigrationNews = async (query: string, language: Language, mode: NewsAnalysisMode): Promise<string> => {
  const ai = getAI();

  let systemInstruction = '';
  switch (mode) {
    case 'in-depth':
      systemInstruction = PROMPTS.immigrationNewsInDepth(language).systemInstruction;
      break;
    case 'myth-busting':
      systemInstruction = PROMPTS.immigrationNewsMythBusting(language).systemInstruction;
      break;
    case 'quick':
    default:
      systemInstruction = PROMPTS.immigrationNewsSummarizer(language).systemInstruction;
      break;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: query }] },
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  const responseWithSources = {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => chunk.web)
      .filter((web): web is { uri: string; title?: string } => !!web?.uri)
      .filter((web, index, self) => self.findIndex(w => w.uri === web.uri) === index)
      .map(web => ({
        uri: web.uri,
        title: web.title || web.uri,
      })) || [],
  };
  
  return JSON.stringify(responseWithSources);
};

export const generateVideo = async (
  prompt: string,
  onProgress: (message: string) => void,
  progressMessages: string[]
): Promise<Blob> => {
  const ai = getAI();
  
  let messageIndex = 0;
  const updateProgress = () => {
    onProgress(progressMessages[messageIndex % progressMessages.length]);
    messageIndex++;
  };

  updateProgress();

  let operation: VideosOperation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
    }
  });

  const progressInterval = setInterval(updateProgress, 7000);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  
  clearInterval(progressInterval);

  if (operation.error) {
    throw new Error(operation.error.message || "Video generation failed with an error.");
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation completed but no download link was found.");
  }
  
  const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
  if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const videoBlob = await response.blob();
  return videoBlob;
};

export const generateApplicationTimeline = async (pathway: ImmigrationPathway, language: Language): Promise<ApplicationTimeline> => {
  const ai = getAI();
  
  const schema = {
      type: Type.OBJECT,
      properties: {
          preparation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of tasks before applying." },
          submission: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of tasks during application." },
          postSubmission: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of tasks after applying." },
      },
      required: ['preparation', 'submission', 'postSubmission'],
  };

  const pathwayString = JSON.stringify({ title: pathway.pathwayTitle, steps: pathway.suggestedSteps.map(t => t.name) });
  const userPrompt = `Generate an application timeline based on this immigration pathway: ${pathwayString}`;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: userPrompt }] },
      config: {
          systemInstruction: PROMPTS.applicationTimelineGenerator(language).systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema,
      },
  });

  return JSON.parse(response.text);
};

export const findOfficialOffices = async (
  search: { latitude: number; longitude: number } | { query: string },
  language: Language
): Promise<OfficeFinderResult> => {
    const ai = getAI();

    const userPrompt = 'latitude' in search
        ? `Find embassies, consulates, and visa application centers near latitude: ${search.latitude}, longitude: ${search.longitude}.`
        : `Find embassies, consulates, and visa application centers for "${search.query}".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: userPrompt }] },
        config: {
            systemInstruction: PROMPTS.officeFinder(language).systemInstruction,
            tools: [{ googleSearch: {} }],
        },
    });

    try {
        let jsonString = response.text.trim();
        const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        }

        const parsedData = JSON.parse(jsonString);
        
        if (parsedData && Array.isArray(parsedData.offices)) {
            return parsedData;
        }

        if (Array.isArray(parsedData)) {
            return { offices: parsedData };
        }
        
        console.warn("Parsed JSON from findOfficialOffices has unexpected structure:", parsedData);
        return { offices: [] };

    } catch (e) {
        console.error("Failed to parse JSON from findOfficialOffices:", response.text);
        return { offices: [] };
    }
};

export const findOfficesForPathway = async (
  pathway: ImmigrationPathway,
  language: Language
): Promise<OfficeFinderResult> => {
  const ai = getAI();

  const userPrompt = `Based on this immigration pathway, find the best local offices (embassies, consulates, biometrics centers):
  - Pathway: ${pathway.pathwayTitle}
  - Summary: ${pathway.profileSummary}
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: userPrompt }] },
    config: {
      systemInstruction: PROMPTS.officeFinderForPathway(language).systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    let jsonString = response.text.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }
    const parsedData = JSON.parse(jsonString);
    if (parsedData && Array.isArray(parsedData.offices)) {
      return parsedData;
    }
    if (Array.isArray(parsedData)) {
      return { offices: parsedData };
    }
    console.warn("Parsed JSON from findOfficesForPathway has unexpected structure:", parsedData);
    return { offices: [] };
  } catch (e) {
    console.error("Failed to parse JSON from findOfficesForPathway:", response.text, e);
    throw new Error("Failed to parse office search results.");
  }
};

export const calculateApplicationCosts = async (pathway: ImmigrationPathway, language: Language): Promise<ApplicationCostResult> => {
  const ai = getAI();

  const costItemSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the application fee or item." },
      estimatedCost: { type: Type.NUMBER, description: "The estimated cost in the relevant currency." },
      currency: { type: Type.STRING, description: "The currency for the estimated cost (e.g., 'USD', 'CAD', 'EUR')." },
    },
    required: ['name', 'estimatedCost', 'currency'],
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      applicationCosts: { type: Type.ARRAY, items: costItemSchema },
    },
    required: ['applicationCosts'],
  };

  const steps = {
    steps: pathway.suggestedSteps.map(item => item.name),
  };
  const userPrompt = `Estimate potential costs for the following immigration application steps: ${JSON.stringify(steps)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: userPrompt }] },
    config: {
      systemInstruction: PROMPTS.applicationCostEstimator(language).systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  return JSON.parse(response.text);
};

export const generateDocumentPrepPlan = async (pathway: ImmigrationPathway, language: Language): Promise<DocumentPrepPlanResult> => {
  const ai = getAI();

  const planItemSchema = {
    type: Type.OBJECT,
    properties: {
      document: { type: Type.STRING, description: "The name of the document." },
      details: { type: Type.STRING, description: "A brief instruction or detail about the document." },
    },
    required: ['document', 'details'],
  };
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      threeMonthsBefore: { type: Type.ARRAY, items: planItemSchema },
      oneMonthBefore: { type: Type.ARRAY, items: planItemSchema },
      oneWeekBefore: { type: Type.ARRAY, items: planItemSchema },
    },
    required: ['threeMonthsBefore', 'oneMonthBefore', 'oneWeekBefore'],
  };

  const pathwayString = JSON.stringify({ title: pathway.pathwayTitle, steps: pathway.suggestedSteps.map(t => t.name) });
  const userPrompt = `Generate a document preparation plan for this immigration pathway: ${pathwayString}`;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: userPrompt }] },
      config: {
          systemInstruction: PROMPTS.documentPrepPlanGenerator(language).systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema,
      },
  });

  return JSON.parse(response.text);
};
