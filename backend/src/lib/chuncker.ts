import { TextChunk } from "../types/chunk";

function splitLongParagraph(
  trimmedParagraph: string,
  metadata: Record<string, any>,
  maxChunkSize: number,
  chunks: TextChunk[],
  chunkIndex: number
): number {
  const sentences = trimmedParagraph.split(/(?<=[.!?])\s+/);
  let sentenceChunk = '';

  for (const sentence of sentences) {
    if ((sentenceChunk + sentence).length > maxChunkSize && sentenceChunk.length > 0) {
      chunks.push({
        content: sentenceChunk.trim(),
        metadata: { ...metadata, chunkIndex: chunkIndex++ }
      });
      sentenceChunk = sentence;
    } else {
      sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
    }
  }

  if (sentenceChunk.trim()) {
    chunks.push({
      content: sentenceChunk.trim(),
      metadata: { ...metadata, chunkIndex: chunkIndex++ }
    });
  }

  return chunkIndex;
}

function accumulateParagraph(
  trimmedParagraph: string,
  currentChunk: string,
  maxChunkSize: number,
  chunks: TextChunk[],
  metadata: Record<string, any>,
  chunkIndex: number
): { currentChunk: string; chunkIndex: number } {
  if ((currentChunk + '\n\n' + trimmedParagraph).length > maxChunkSize && currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { ...metadata, chunkIndex: chunkIndex++ }
    });
    return { currentChunk: trimmedParagraph, chunkIndex };
  } else {
    const newChunk = currentChunk + (currentChunk ? '\n\n' : '') + trimmedParagraph;
    return { currentChunk: newChunk, chunkIndex };
  }
}

export function chunkText(
  content: string,
  metadata: Record<string, any>,
  maxChunkSize: number = 1000
): TextChunk[] {
  const chunks: TextChunk[] = [];

  const paragraphs = content.split(/\n+/);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    if (trimmedParagraph.length > maxChunkSize) {
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { ...metadata, chunkIndex: chunkIndex++ }
        });
        currentChunk = '';
      }

      chunkIndex = splitLongParagraph(trimmedParagraph, metadata, maxChunkSize, chunks, chunkIndex);
    } else {
      const result = accumulateParagraph(trimmedParagraph, currentChunk, maxChunkSize, chunks, metadata, chunkIndex);
      currentChunk = result.currentChunk;
      chunkIndex = result.chunkIndex;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { ...metadata, chunkIndex: chunkIndex }
    });
  }

  if (chunks.length === 0) {
    return [{
      content: content,
      metadata: { ...metadata, chunkIndex: 0 }
    }];
  }

  return chunks;
}