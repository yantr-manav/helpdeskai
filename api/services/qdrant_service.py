# from qdrant_client import QdrantClient
# from qdrant_client.models import (
#     Distance, VectorParams, PointStruct,
#     Filter, FieldCondition, MatchValue,
#     SearchRequest, ScoredPoint
# )
# from openai import AsyncOpenAI
# from app.config import get_settings
# import uuid

# settings = get_settings()


# class QdrantService:
#     def __init__(self):
#         self.client = QdrantClient(
#             host=settings.qdrant_host,
#             port=settings.qdrant_port,
#             timeout=30,
#         )
#         self.openai = AsyncOpenAI(api_key=settings.openai_api_key)
#         self.collection = settings.qdrant_collection
#         self.dimension = settings.embedding_dimension

#     async def ensure_collection(self):
#         """Create collection if it doesn't exist."""
#         existing = [c.name for c in self.client.get_collections().collections]
#         if self.collection not in existing:
#             self.client.create_collection(
#                 collection_name=self.collection,
#                 vectors_config=VectorParams(
#                     size=self.dimension,
#                     distance=Distance.COSINE,
#                 ),
#             )
#             print(f"✅ Created Qdrant collection: {self.collection}")
#         else:
#             print(f"✅ Qdrant collection exists: {self.collection}")

#     async def embed(self, text: str) -> list[float]:
#         """Embed text using OpenAI text-embedding-3-small."""
#         response = await self.openai.embeddings.create(
#             input=text,
#             model=settings.openai_embedding_model,
#         )
#         return response.data[0].embedding

#     async def upsert_chunks(self, chunks: list[dict]):
#         """
#         Upsert document chunks into Qdrant.
#         Each chunk: { doc_id, title, content, chunk_index, topics }
#         """
#         points = []
#         for chunk in chunks:
#             vector = await self.embed(chunk["content"])
#             points.append(
#                 PointStruct(
#                     id=str(uuid.uuid4()),
#                     vector=vector,
#                     payload={
#                         "doc_id": chunk["doc_id"],
#                         "title": chunk["title"],
#                         "content": chunk["content"],
#                         "chunk_index": chunk.get("chunk_index", 0),
#                         "topics": chunk.get("topics", []),
#                     },
#                 )
#             )
#         self.client.upsert(
#             collection_name=self.collection,
#             points=points,
#         )
#         return len(points)

#     async def search(self, query: str, top_k: int = 5) -> list[dict]:
#         """
#         Semantic search: embed query → search Qdrant → return top_k chunks.
#         Returns list of { content, title, doc_id, score }
#         """
#         query_vector = await self.embed(query)
#         results: list[ScoredPoint] = self.client.search(
#             collection_name=self.collection,
#             query_vector=query_vector,
#             limit=top_k,
#             with_payload=True,
#         )
#         return [
#             {
#                 "content": r.payload["content"],
#                 "title": r.payload["title"],
#                 "doc_id": r.payload["doc_id"],
#                 "score": r.score,
#             }
#             for r in results
#         ]

#     def collection_info(self) -> dict:
#         info = self.client.get_collection(self.collection)
#         return {
#             "vectors_count": info.vectors_count,
#             "points_count": info.points_count,
#         }

#     def delete_collection(self):
#         self.client.delete_collection(self.collection)



# app/services/qdrant_service.py

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct,
    ScoredPoint
)
from ..config import get_settings
from sentence_transformers import SentenceTransformer
from openai import AsyncOpenAI
import uuid

settings = get_settings()


class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
            timeout=30,
        )

        self.collection = settings.qdrant_collection
        self.dimension = settings.embedding_dimension

        # 🔁 Embedding provider switch
        self.provider = settings.embedding_provider

        if self.provider == "openai":
            self.openai = AsyncOpenAI(api_key=settings.openai_api_key)
            print("⚠️ Using OpenAI embeddings (paid)")
        else:
            self.model = SentenceTransformer(settings.local_embedding_model)
            print("🧠 Using local embeddings (FREE)")

    # ─────────────────────────────────────────────

    async def ensure_collection(self):
        """Create collection if it doesn't exist."""
        existing = [c.name for c in self.client.get_collections().collections]

        if self.collection not in existing:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=Distance.COSINE,
                ),
            )
            print(f"✅ Created Qdrant collection: {self.collection}")
        else:
            print(f"✅ Qdrant collection exists: {self.collection}")

    # ─────────────────────────────────────────────

    async def embed(self, texts):
        """
        Embed text(s) using selected provider.
        Supports both single string and list[str]
        """

        # Normalize input
        single_input = False
        if isinstance(texts, str):
            texts = [texts]
            single_input = True

        # 🔹 OpenAI (paid)
        if self.provider == "openai":
            response = await self.openai.embeddings.create(
                input=texts,
                model=settings.openai_embedding_model,
            )
            vectors = [item.embedding for item in response.data]

        # 🔹 Local (FREE)
        else:
            vectors = self.model.encode(texts).tolist()

        return vectors[0] if single_input else vectors

    # ─────────────────────────────────────────────

    async def upsert_chunks(self, chunks: list[dict]):
        """
        Upsert document chunks into Qdrant.
        Each chunk: { doc_id, title, content, chunk_index, topics }
        """

        # ✅ Batch embedding (important optimization)
        texts = [chunk["content"] for chunk in chunks]
        vectors = await self.embed(texts)

        points = []
        for i, chunk in enumerate(chunks):
            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vectors[i],
                    payload={
                        "doc_id": chunk["doc_id"],
                        "title": chunk["title"],
                        "content": chunk["content"],
                        "chunk_index": chunk.get("chunk_index", 0),
                        "topics": chunk.get("topics", []),
                    },
                )
            )

        self.client.upsert(
            collection_name=self.collection,
            points=points,
        )

        return len(points)

    # ─────────────────────────────────────────────

    async def search(self, query: str, top_k: int = 5) -> list[dict]:
        """
        Semantic search: embed query → search Qdrant → return top_k chunks.
        """

        query_vector = await self.embed(query)

        results: list[ScoredPoint] = self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            limit=top_k,
            with_payload=True,
        )

        return [
            {
                "content": r.payload["content"],
                "title": r.payload["title"],
                "doc_id": r.payload["doc_id"],
                "score": r.score,
            }
            for r in results
        ]

    # ─────────────────────────────────────────────

    def collection_info(self) -> dict:
        info = self.client.get_collection(self.collection)
        return {
            "vectors_count": info.vectors_count,
            "points_count": info.points_count,
        }

    def delete_collection(self):
        self.client.delete_collection(self.collection)