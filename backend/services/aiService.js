/**
 * AI Service - Resume Analysis
 * Uses an AI API (OpenAI) to analyze resume text and return a structured ATS-style breakdown.
 */
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
});

const ANALYSIS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.
Analyze the resume text provided and return a structured JSON response with:
1. issues: array of 3-7 key problems (strings)
2. suggestions: array of 3-7 actionable improvements (strings)
3. feedback: array of 2-5 strengths (strings)

Be concise and specific. Focus on ATS optimization, formatting, content quality, and industry best practices.
Return ONLY valid JSON, no markdown or extra text.`;

const ANALYSIS_USER_PROMPT = (resumeText) => `Analyze this resume and return the JSON analysis:

---
${resumeText.substring(0, 12000)}
---
`;

/**
 * Call AI API to analyze resume text
 * Returns structured response: { atsScore, issues, suggestions, feedback }
 */
export const analyzeResume = async (resumeText) => {
  if (!resumeText || resumeText.trim().length < 50) {
    return getFallbackResponse('Resume text is too short to analyze effectively.');
  }

  // Check if API key is configured
  if (!process.env.AI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.warn('AI_API_KEY not set - using fallback analysis');
    return getFallbackResponse('AI API not configured. Configure AI_API_KEY for full analysis.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: ANALYSIS_USER_PROMPT(resumeText) },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty AI response');
    }

    // Parse JSON from response (handle possible markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const parsed = JSON.parse(jsonStr);

    const tokensUsed =
      completion.usage?.total_tokens ??
      (completion.usage?.prompt_tokens || 0) + (completion.usage?.completion_tokens || 0) ??
      null;

    // Validate and normalize response (scores are computed deterministically elsewhere)
    return {
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
      _meta: {
        provider: 'openai',
        model: completion.model || 'gpt-4o-mini',
        tokensUsed,
      },
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return getFallbackResponse('AI analysis failed. Please try again.');
  }
};

/**
 * Fallback response when AI is unavailable
 */
function getFallbackResponse(reason) {
  return {
    issues: [
      'Unable to complete full AI analysis',
      reason,
    ],
    suggestions: [
      'Re-upload your resume and try again',
      'Ensure your resume is in PDF or DOCX format',
    ],
    feedback: [
      'Resume was received successfully',
      'Consider adding measurable achievements and industry keywords',
    ],
    _meta: {
      provider: 'fallback',
      model: null,
      tokensUsed: null,
    },
  };
}
