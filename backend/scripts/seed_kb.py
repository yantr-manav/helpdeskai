# """
# Seed the Qdrant vector database with FlowTask knowledge base.

# Usage:
#   python scripts/seed_kb.py

# Requires Qdrant and OpenAI API key to be configured in .env
# """

# import asyncio
# import sys
# import os

# # Allow imports from project root
# sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# from app.config import get_settings
# from app.services.qdrant_service import QdrantService
# from app.utils.chunker import chunk_document
# from docs.kb.knowledge_base import KB_DOCUMENTS

# settings = get_settings()


# async def seed():
#     print("🚀 Starting FlowTask KB seed...")
#     print(f"📦 Qdrant: {settings.qdrant_host}:{settings.qdrant_port}")
#     print(f"📚 Collection: {settings.qdrant_collection}")
#     print(f"🔑 Embedding model: {settings.openai_embedding_model}")
#     print()

#     qdrant = QdrantService()

#     # Ensure collection exists
#     await qdrant.ensure_collection()

#     total_chunks = 0
#     for doc in KB_DOCUMENTS:
#         print(f"📄 Processing {doc['doc_id']}: {doc['title']}...")
#         chunks = chunk_document(doc)
#         count = await qdrant.upsert_chunks(chunks)
#         total_chunks += count
#         print(f"   ✅ {count} chunks embedded and stored")

#     info = qdrant.collection_info()
#     print()
#     print(f"✅ Seeding complete!")
#     print(f"   Total chunks: {total_chunks}")
#     print(f"   Qdrant points: {info['points_count']}")
#     print()
#     print("You can now start the backend: uvicorn app.main:app --reload")


# if __name__ == "__main__":
#     asyncio.run(seed())




"""
Seed the Qdrant vector database with FlowTask knowledge base.

Usage:
  python scripts/seed_kb.py

Requires Qdrant and embedding model configured in .env
Supports local embeddings (sentence-transformers) and OpenAI (optional)
"""

import asyncio
import sys
import os

# Allow imports from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.services.qdrant_service import QdrantService
from app.utils.chunker import chunk_document
from docs.kb.knowledge_base import KB_DOCUMENTS

settings = get_settings()


async def seed():
    print("🚀 Starting FlowTask KB seed...")
    print(f"📦 Qdrant: {settings.qdrant_host}:{settings.qdrant_port}")
    print(f"📚 Collection: {settings.qdrant_collection}")

    # 🔁 Show correct embedding source
    if settings.embedding_provider == "local":
        print(f"🧠 Using Local embeddings: {settings.local_embedding_model}")
    else:
        print(f"🔑 Using OpenAI embeddings: {settings.openai_embedding_model}")

    print()

    qdrant = QdrantService()

    # Ensure collection exists
    await qdrant.ensure_collection()

    total_chunks = 0

    for doc in KB_DOCUMENTS:
        print(f"📄 Processing {doc['doc_id']}: {doc['title']}...")

        # Chunk the document
        chunks = chunk_document(doc)

        # Store embeddings in Qdrant
        count = await qdrant.upsert_chunks(chunks)
        total_chunks += count

        print(f"   ✅ {count} chunks embedded and stored")

    # Collection info
    info = qdrant.collection_info()

    print()
    print("✅ Seeding complete!")
    print(f"   Total chunks: {total_chunks}")
    print(f"   Qdrant points: {info['points_count']}")
    print()

    print("🚀 Start backend with:")
    print("   uvicorn app.main:app --reload")


if __name__ == "__main__":
    asyncio.run(seed())