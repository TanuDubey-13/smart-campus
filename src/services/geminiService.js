const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Summarizes notice content using Gemini API or local algorithm fallback.
 * @param {string} title - The title of the notice.
 * @param {string} content - The detailed content of the notice.
 * @returns {Promise<string>} The generated summary.
 */
export async function summarizeNoticeContent(title, content) {
  const prompt = `You are a helpful university administration assistant. Please write a highly concise, 1-2 sentence bullet-point summary of the following campus announcement. Focus ONLY on the critical action items or dates for students. Do not write introductory greetings.
  
Notice Title: ${title}
Notice Content: ${content}`;

  // If key is present and not the placeholder
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 100,
              temperature: 0.2,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        return text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, running local summarization fallback.', err);
    }
  }

  // Local Summarizer Fallback (Regex-based Smart Extractor)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Split sentences
      const sentences = content
        .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
        .split("|")
        .map(s => s.trim())
        .filter(s => s.length > 5);

      if (sentences.length === 0) {
        resolve(content.substring(0, 100) + '...');
        return;
      }

      // Look for sentences containing action verbs or key topics (exam, must, register, submit, deadline)
      const keySentences = sentences.filter(s => 
        /exam|timetable|date|submit|deadline|must|register|suspension|alert|required/i.test(s)
      );

      // Take first two key sentences, or just first two sentences
      const chosen = keySentences.length > 0 ? keySentences.slice(0, 2) : sentences.slice(0, 2);
      const summaryText = chosen.join(' ') + (chosen.length < sentences.length ? '..' : '');
      resolve(`✨ AI Summary (Fallback): ${summaryText}`);
    }, 450); // Simulate processing latency
  });
}
