# main.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from chromadb import Client

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Please set GEMINI_API_KEY in your .env file")

# -----------------------------
# Initialize Gemini client
# -----------------------------
client = OpenAI(
    api_key=API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# -----------------------------
# Initialize Chroma client
# -----------------------------
chroma = Client()  # uses local DuckDB+Parquet by default
collection = chroma.get_or_create_collection("market_trends")

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Fashion RAG API")

class QueryRequest(BaseModel):
    query: str
    context_type: str | None = "market_trends"

# -----------------------------
# Load documents on startup
# -----------------------------
@app.on_event("startup")
def startup_event():
    # No-op if you already indexed documents with ingest.py
    # Or you can add logic here to re-load if needed
    print("RAG backend ready. Documents assumed indexed in Chroma.")

# -----------------------------
# RAG query endpoint
# -----------------------------
@app.post("/api/rag/query")
def rag_query(data: QueryRequest):
    try:
        # 1. Embed the user query
        emb_resp = client.embeddings.create(
            model="gemini-embedding-001",
            input=data.query
        )
        query_vector = emb_resp.data[0].embedding

        # 2. Retrieve top 3 relevant documents from Chroma
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=3,
            include=["documents", "metadatas"]
        )

        docs = results["documents"][0] if results["documents"] else []
        context = "\n\n".join(docs) if docs else "No relevant context found."

        # 3. Generate answer using Gemini
        prompt = f"""You are a Fashion Trends Analyst. Use this context to answer the question.\n\nContext:\n{context}\n\nQuestion: {data.query}"""

        completion = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512
        )

        answer = completion.choices[0].message.content
        return {"response": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")
