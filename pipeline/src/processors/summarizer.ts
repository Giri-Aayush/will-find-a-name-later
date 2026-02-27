import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { checkEntityPreservation } from './entity-checker.js';

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

const MAX_RETRIES = 3;
const MIN_WORDS = 58;
const MAX_WORDS = 62;
// Looser fallback for local Ollama — tighten after Anthropic migration
const FALLBACK_MIN = 50;
const FALLBACK_MAX = 70;

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
  let lastWordCount = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let prompt = buildUserPrompt(truncatedText);

    // On retry: provide word count feedback
    if (attempt > 1) {
      prompt += `\n\nIMPORTANT: Your previous summary was ${lastWordCount} words. It MUST be between ${MIN_WORDS} and ${MAX_WORDS} words. Count carefully.`;
    }

    // On retry: check entity preservation from previous attempt
    if (attempt > 1 && summary) {
      const entityCheck = checkEntityPreservation(truncatedText, summary);
      if (!entityCheck.passed && entityCheck.missingEntities.length > 0) {
        prompt += `\nYou MUST include these entities: ${entityCheck.missingEntities.join(', ')}`;
      }
    }

    const response = await ollama.chat.completions.create({
      model: MODEL,
      max_tokens: 200,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    summary = response.choices[0]?.message?.content?.trim() ?? '';
    lastWordCount = countWords(summary);

    // Strict range: 58-62 words
    if (lastWordCount >= MIN_WORDS && lastWordCount <= MAX_WORDS) {
      break;
    }

    // On final retry: accept looser range, otherwise fail
    if (attempt === MAX_RETRIES) {
      if (lastWordCount >= FALLBACK_MIN && lastWordCount <= FALLBACK_MAX) {
        logger.warn(
          `Summary word count ${lastWordCount} outside strict range (${MIN_WORDS}-${MAX_WORDS}), accepting after ${MAX_RETRIES} retries`
        );
        break;
      }
      if (lastWordCount >= 20) {
        logger.warn(
          `Summary word count ${lastWordCount} far from target, accepting minimal summary after ${MAX_RETRIES} retries`
        );
        break;
      }
      throw new Error(
        `Summarization failed after ${MAX_RETRIES} retries (last word count: ${lastWordCount})`
      );
    }

    logger.debug(`Attempt ${attempt}: summary was ${lastWordCount} words, retrying...`);
  }

  // Final entity preservation check — log warning but don't block
  const entityCheck = checkEntityPreservation(truncatedText, summary);
  if (!entityCheck.passed) {
    logger.warn(
      `Entity preservation check failed: missing [${entityCheck.missingEntities.join(', ')}]`
    );
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
