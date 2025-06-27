

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT, PROMPT_OUTPUT_REGEX, MAX_CHAIN_DEPTH, GENERATE_PROMPT_IDEA_METAPROMPT } from "../constants";
import { getPrompt as fetchPromptById } from "./db"; // Import DB service to fetch prompts by ID
import { Prompt, ModelConfig } from "../types";

let globalAiInstance: GoogleGenAI | null = null;
// This will read from window.process.env.API_KEY thanks to the shim in index.html
const envApiKey = process.env.API_KEY;

if (envApiKey && !envApiKey.startsWith('---')) {
  try {
    globalAiInstance = new GoogleGenAI({ apiKey: envApiKey });
  } catch (error) {
    console.error("Failed to initialize global GoogleGenAI instance with process.env.API_KEY:", error);
  }
} else {
  console.warn("process.env.API_KEY is not defined or is a placeholder. Global Gemini instance not created. User-provided keys will be required for Gemini features.");
}

export const isGeminiGloballyAvailable = (): boolean => !!globalAiInstance;

// Helper to substitute variables (from PromptEditor)
const substituteVariables = (content: string, values: Record<string, string>): string => {
  let newContent = content;
  for (const key in values) {
    newContent = newContent.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), values[key] || '');
  }
  return newContent;
};


// Main function to handle prompt execution, including chaining (AFR-1.2)
export const generateText = async (
  mainPromptContent: string,
  mainPromptVariables: Record<string, string>, // Variables for the current prompt being processed
  apiKeyOverride?: string,
  modelId: string = GEMINI_MODEL_TEXT,
  modelConfig?: ModelConfig, 
  currentChainDepth: number = 0,
  mainPromptId?: string // ID of the prompt initiating this specific call, for cycle detection.
): Promise<string> => {
  if (currentChainDepth > MAX_CHAIN_DEPTH) {
    throw new Error(`Maximum prompt chain depth of ${MAX_CHAIN_DEPTH} exceeded. Possible circular reference.`);
  }

  let L_ai: GoogleGenAI | null = null;
  if (apiKeyOverride) {
    try {
      L_ai = new GoogleGenAI({ apiKey: apiKeyOverride });
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI with provided API key override:", error);
      throw new Error("Invalid API key provided or failed to initialize Gemini.");
    }
  } else if (globalAiInstance) {
    L_ai = globalAiInstance;
  } else {
    throw new Error("Gemini API key not configured. Please add an API key in settings or ensure process.env.API_KEY is set.");
  }

  if (!L_ai) {
      throw new Error("Gemini API is not initialized.");
  }
  
  // 1. Substitute variables for the *current* prompt content first
  let processedContent = substituteVariables(mainPromptContent, mainPromptVariables);

  // 2. Process chained prompts {{promptOutput:ID}}
  const outputPromises: Promise<{ placeholder: string, output: string }>[] = [];
  PROMPT_OUTPUT_REGEX.lastIndex = 0; 
  let match;

  while ((match = PROMPT_OUTPUT_REGEX.exec(processedContent)) !== null) {
    const placeholder = match[0]; 
    const subPromptId = match[1]; 

    if (subPromptId === mainPromptId && currentChainDepth > 0) { 
      throw new Error(`Circular reference detected: Prompt ID ${mainPromptId} is trying to call itself in a chain.`);
    }
    
    outputPromises.push(
      (async () => {
        const subPromptData = await fetchPromptById(subPromptId);
        if (!subPromptData) {
          throw new Error(`Chained prompt with ID ${subPromptId} not found.`);
        }
        
        // For sub-prompts, use their own inherent model config if available, or default.
        // For simplicity here, we pass undefined, meaning sub-prompts run with default Gemini settings unless their content implies otherwise via system instructions.
        const subPromptOutput = await generateText(
          subPromptData.content,
          {}, 
          apiKeyOverride, 
          modelId,        
          undefined,      
          currentChainDepth + 1,
          subPromptId 
        );
        return { placeholder, output: subPromptOutput };
      })()
    );
  }

  const resolvedOutputs = await Promise.all(outputPromises);
  for (const resolved of resolvedOutputs) {
    const escapedPlaceholder = resolved.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    processedContent = processedContent.replace(new RegExp(escapedPlaceholder, 'g'), resolved.output);
  }

  // 3. Execute the final, fully processed content
  if (!processedContent.trim()) {
      throw new Error(`Prompt content (after variable and chain substitution) cannot be empty.`);
  }

  try {
    const geminiAPIConfig: any = {};
    if (modelConfig?.systemInstruction && modelConfig.systemInstruction.trim() !== "") {
      geminiAPIConfig.systemInstruction = modelConfig.systemInstruction;
    }
    if (typeof modelConfig?.temperature === 'number' && !isNaN(modelConfig.temperature)) {
      geminiAPIConfig.temperature = modelConfig.temperature;
    }
    if (typeof modelConfig?.topP === 'number' && !isNaN(modelConfig.topP)) {
      geminiAPIConfig.topP = modelConfig.topP;
    }
    if (typeof modelConfig?.topK === 'number' && !isNaN(modelConfig.topK) && modelConfig.topK > 0) {
      geminiAPIConfig.topK = modelConfig.topK;
    }
    if (modelConfig?.responseMimeType) { // Added this
      geminiAPIConfig.responseMimeType = modelConfig.responseMimeType;
    }


    const response: GenerateContentResponse = await L_ai.models.generateContent({
      model: modelId,
      contents: processedContent,
      ...(Object.keys(geminiAPIConfig).length > 0 && { config: geminiAPIConfig }),
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("The provided API key is not valid. Please check your API key and try again.");
        }
        if (error.message.toLowerCase().includes("candidate was blocked due to safety")) {
            return "Response blocked due to safety settings. Try adjusting the prompt or model configuration if applicable.";
        }
        throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating text with Gemini.");
  }
};

export interface GeneratedPromptIdea {
  title: string;
  content: string;
  notes?: string;
  suggestedTags?: string[];
}

export const generatePromptIdea = async (apiKey: string): Promise<GeneratedPromptIdea> => {
  let L_ai: GoogleGenAI;
  try {
    L_ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI for prompt idea generation:", error);
    throw new Error("Invalid API key or failed to initialize Gemini for idea generation.");
  }

  try {
    const response: GenerateContentResponse = await L_ai.models.generateContent({
      model: GEMINI_MODEL_TEXT, // Use the standard text model
      contents: GENERATE_PROMPT_IDEA_METAPROMPT,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8, // Slightly higher temperature for more creative ideas
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as GeneratedPromptIdea;

    if (!parsedData.title || !parsedData.content) {
        throw new Error("AI response missing required fields (title or content).");
    }
    // Ensure tags are an array of strings, even if AI returns something else for that field
    if (parsedData.suggestedTags && !Array.isArray(parsedData.suggestedTags)) {
        parsedData.suggestedTags = [];
    } else if (parsedData.suggestedTags) {
        parsedData.suggestedTags = parsedData.suggestedTags.filter(tag => typeof tag === 'string');
    }


    return parsedData;

  } catch (error) {
    console.error("Error generating prompt idea with Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error("The provided API key is not valid for generating prompt ideas.");
    }
    throw new Error(`Gemini API error during idea generation: ${error instanceof Error ? error.message : String(error)}`);
  }
};