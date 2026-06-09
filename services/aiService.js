/**
 * AI service stubs.
 * Plug in your provider (OpenAI, Gemini, Anthropic, etc.) and return strings.
 * Kept dependency-free so the project runs without an AI key.
 */
exports.summarize = async (text) => {
  if (!text) return '';
  // naive fallback: first 2 sentences
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(' ');
};

exports.suggestTitle = async (text) => {
  if (!text) return 'Untitled';
  const words = text.trim().split(/\s+/).slice(0, 8).join(' ');
  return words.length ? words : 'Untitled';
};
