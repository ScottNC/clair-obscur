import { describe, it } from 'mocha';
import { expect } from 'chai';
import { chunkText } from '../src/lib/chuncker';

describe('chunker', () => {
  it('should return a single chunk for short text', () => {
    const shortText = 'This is a short text.';
    const chunks = chunkText(shortText, { source: 'test' }, 1000);
    
    expect(chunks).to.have.lengthOf(1);
    expect(chunks[0].content).to.equal(shortText);
    expect(chunks[0].metadata.source).to.equal('test');
  });

  it('should split long text by paragraphs', () => {
    const longText = 'First paragraph.\nSecond paragraph.\nThird paragraph.';
    const chunks = chunkText(longText, { source: 'test' }, 20);

    expect(chunks.length).to.equal(3);
    expect(chunks[0].content).to.equal('First paragraph.');
    expect(chunks[1].content).to.equal('Second paragraph.');
    expect(chunks[2].content).to.equal('Third paragraph.');
  });

  it('should preserve metadata in all chunks', () => {
    const text = 'Some text that will be split.';
    const chunks = chunkText(text, { source: 'test', id: 123 }, 10);
    
    chunks.forEach(chunk => {
      expect(chunk.metadata.source).to.equal('test');
      expect(chunk.metadata.id).to.equal(123);
      expect(chunk.metadata).to.have.property('chunkIndex');
    });
  });

  it('should split text by character length when paragraphs exceed max size', () => {
    const longParagraph = 'This is a very long sentence that needs to be split into multiple Chunks. Because it exceeds the maximum allowed character length per chunk.';
    const chunks = chunkText(longParagraph, { source: 'test' }, 50);
    
    expect(chunks.length).to.equal(2);
  });

  it('should handle exact character limit without splitting', () => {
    const exactText = 'A'.repeat(50);
    const chunks = chunkText(exactText, { source: 'test' }, 50);
    
    expect(chunks).to.have.lengthOf(1);
    expect(chunks[0].content.length).to.equal(50);
  });

  it('should split at sentence boundaries when possible', () => {
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
    const chunks = chunkText(text, { source: 'test' }, 30);
    
    chunks.forEach(chunk => {
      if (chunk.content.length > 0 && chunks.indexOf(chunk) < chunks.length - 1) {
        expect(chunk.content.trim().endsWith('.')).to.be.true;
      }
    });
  });

  it('should handle very large maxChunkSize', () => {
    const text = 'Small text.';
    const chunks = chunkText(text, { source: 'test' }, 1000000);
    
    expect(chunks).to.have.lengthOf(1);
    expect(chunks[0].content).to.equal(text);
  });
});