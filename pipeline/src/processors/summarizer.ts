import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// Use local Ollama — no rate limits, no API key needed
const ollama = new OpenAI({
  apiKey: 'ollama',
  baseURL: 'http://localhost:11434/v1',
});

const MODEL = 'llama3.1:8b';

const SYSTEM_PROMPT = `You are a technical editor for EthPulse, a news digest for Ethereum ecosystem
professionals. Your task is to summarise source content into exactly 60 words.
The audience is fluent in blockchain technology and does not require definitions
of common terms.`;

function buildUserPrompt(content: string): string {
  return `Summarise the following content in exactly 60 words.

Rules:
- State what happened or was proposed, who authored or decided it, and why it
  matters to protocol developers or ecosystem participants.
- Preserve all specific technical identifiers: EIP numbers, vote percentages,
  dollar amounts, client version numbers, and named authors.
- Do not editorialize, speculate, or express opinions.
- If the content covers a governance vote, include the outcome and participation
  metrics.
- Output only the 60-word summary. No preamble, no suffix, no markdown
  formatting.

${content}`;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export async function summarize(
  fullText: string,
  title: string
): Promise<{ headline: string; summary: string }> {
  // Truncate to keep inference fast on local model
  const maxChars = 6000;
  const truncatedText = fullText.length > maxChars
    ? fullText.slice(0, maxChars) + '\n\n[Content truncated]'
    : fullText;

  let summary = '';
  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const prompt = attempt === 1
      ? buildUserPrompt(truncatedText)
      : buildUserPrompt(truncatedText) + `\n\nIMPORTANT: Your previous summary was ${countWords(summary)} words. It MUST be exactly 60 words.`;

    const response = await ollama.chat.completions.create({
      model: MODEL,
      max_tokens: 200,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    summary = response.choices[0]?.message?.content?.trim() ?? '';

    const summaryWordCount = countWords(summary);
    if (summaryWordCount >= 40 && summaryWordCount <= 80) {
      break;
    }

    // On last retry, accept any summary with at least 20 words
    if (attempt === MAX_RETRIES) {
      if (summaryWordCount >= 20) {
        break;
      }
      throw new Error(
        `Summarization failed after ${MAX_RETRIES} retries (last word count: ${summaryWordCount})`
      );
    }
  }

  // Generate headline (max 12 words)
  const headlineResponse = await ollama.chat.completions.create({
    model: MODEL,
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Write a headline of at most 12 words for this article. Output only the headline, no quotes, no punctuation at the end.\n\nTitle: ${title}\n\nSummary: ${summary}`,
      },
    ],
  });

  const headline =
    headlineResponse.choices[0]?.message?.content?.trim() ??
    title.split(' ').slice(0, 12).join(' ');

  return { headline, summary };
}
