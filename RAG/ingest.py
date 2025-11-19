import os
from dotenv import load_dotenv
from chromadb import Client
from openai import OpenAI

# Load .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Set GEMINI_API_KEY in your .env file")

# Gemini client
client = OpenAI(
    api_key=API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Chroma client (v0.4+)
chroma = Client()
collection = chroma.get_or_create_collection("market_trends")

# ----------------------------
# Load & index documents
# ----------------------------
def load_and_index(folder="./documents"):
    files_indexed = 0
    if not os.path.exists(folder):
        raise ValueError(f"Documents folder not found: {folder}")

    for filename in os.listdir(folder):
        if not filename.endswith(".txt"):
            continue

        path = os.path.join(folder, filename)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read().strip()
            if not text:
                continue

        # Skip already indexed
        existing = collection.get(ids=[filename])
        if existing["ids"]:
            print(f"Skipping already indexed file: {filename}")
            continue

        # Create embedding
        emb_resp = client.embeddings.create(
            model="gemini-embedding-001",
            input=text
        )
        emb = emb_resp.data[0].embedding

        # Add to Chroma
        collection.add(
            documents=[text],
            embeddings=[emb],
            metadatas=[{"filename": filename}],
            ids=[filename]
        )
        files_indexed += 1
        print(f"Indexed: {filename}")

    print(f"\nDone! {files_indexed} new documents indexed.")

# ----------------------------
# Run ingestion
# ----------------------------
if __name__ == "__main__":
    load_and_index()
