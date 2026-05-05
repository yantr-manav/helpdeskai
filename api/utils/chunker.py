"""
Simple sentence/paragraph chunker for KB documents.
Splits text into overlapping chunks of ~400 tokens.
"""

import re


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    """
    Split text into overlapping chunks by words.
    chunk_size: target words per chunk
    overlap: words to repeat between consecutive chunks
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        if end == len(words):
            break
        start += chunk_size - overlap
    return chunks


def chunk_document(doc: dict) -> list[dict]:
    """
    Takes a KB doc dict:
      { doc_id, title, content, topics }
    Returns list of chunk dicts ready for Qdrant upsert.
    """
    raw_chunks = chunk_text(doc["content"])
    result = []
    for i, chunk in enumerate(raw_chunks):
        result.append({
            "doc_id": doc["doc_id"],
            "title": doc["title"],
            "content": chunk,
            "chunk_index": i,
            "topics": doc.get("topics", []),
        })
    return result
