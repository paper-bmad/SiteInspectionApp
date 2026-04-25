import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Missing Gemini API key - note review features will be disabled');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

const SYSTEM_PROMPT = `You are an AI assistant that helps site inspectors improve the clarity and professionalism of their inspection notes. Your task is to take the provided notes and turn them into grammatically correct and complete sentences. Ensure that you do not add or create new information, defects, or risks. If the original notes lack sufficient detail, return the initial text unchanged and append the phrase: "Provide more detail." Follow these rules strictly:

Do not invent or infer details that are not explicitly stated in the original notes.
Maintain a professional tone, ensuring proper grammar and clear sentence structure.
Preserve the meaning and intent of the original notes without adding any additional context.`;

interface NoteReviewResult {
  improved: string;
  changes: {
    grammar: string[];
    clarity: string[];
    technical: string[];
  };
}

export async function reviewInspectionNote(
  note: string,
  category: 'Defect' | 'Risk' | 'Overview',
  constructionContext?: string
): Promise<NoteReviewResult> {
  if (!API_KEY || !note.trim()) {
    return {
      improved: note,
      changes: { grammar: [], clarity: [], technical: [] }
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.45,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `
Context:
- Note Category: ${category}
${constructionContext ? `- Construction Context: ${constructionContext}` : ''}

Original Note:
"${note}"

Please analyze this construction site inspection note and provide:
1. An improved version with better clarity and professionalism
2. List specific improvements made in these categories:
   - Grammar and style
   - Clarity and completeness
   - Technical accuracy

Format your response exactly like this:
{
  "improved": "improved note text",
  "changes": {
    "grammar": ["list of grammar improvements"],
    "clarity": ["list of clarity improvements"],
    "technical": ["list of technical improvements"]
  }
}`;

    const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
    const response = await result.response;
    const raw = response.text();
    // Strip markdown code fences that LLMs commonly wrap JSON in
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    try {
      // Attempt to parse the response as JSON
      const parsed = JSON.parse(text);

      // Validate the response structure
      if (!parsed.improved || !parsed.changes || 
          !Array.isArray(parsed.changes.grammar) || 
          !Array.isArray(parsed.changes.clarity) || 
          !Array.isArray(parsed.changes.technical)) {
        throw new Error('Invalid response structure');
      }

      return {
        improved: parsed.improved,
        changes: {
          grammar: parsed.changes.grammar,
          clarity: parsed.changes.clarity,
          technical: parsed.changes.technical
        }
      };
    } catch (parseError) {
      // If JSON parsing fails, try to extract content using regex
      const improvedMatch = text.match(/"improved":\s*"([^"]+)"/);
      const grammarMatch = text.match(/"grammar":\s*\[(.*?)\]/s);
      const clarityMatch = text.match(/"clarity":\s*\[(.*?)\]/s);
      const technicalMatch = text.match(/"technical":\s*\[(.*?)\]/s);

      if (!improvedMatch) {
        throw new Error('Could not parse improved note from response');
      }

      return {
        improved: improvedMatch[1],
        changes: {
          grammar: grammarMatch ? parseStringArray(grammarMatch[1]) : [],
          clarity: clarityMatch ? parseStringArray(clarityMatch[1]) : [],
          technical: technicalMatch ? parseStringArray(technicalMatch[1]) : []
        }
      };
    }
  } catch (error) {
    console.error('Error reviewing note with Gemini:', error);
    return {
      improved: note,
      changes: { grammar: [], clarity: [], technical: [] }
    };
  }
}

function parseStringArray(input: string): string[] {
  try {
    return JSON.parse(`[${input}]`);
  } catch {
    return input
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.replace(/^["']|["']$/g, ''));
  }
}