from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = FastAPI(title="The Last Memory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DAYDREAM_API_KEY = os.getenv("DAYDREAM_API_KEY")
AGENT_URL = "https://agent.livepeer.org/api/llm/chat"


class MemoryRequest(BaseModel):
    prompt: str


@app.get("/")
def root():
    return {"message": "The Last Memory backend is alive."}


@app.post("/generate-memory")
def generate_memory(request: MemoryRequest):

    if not DAYDREAM_API_KEY:
        return {
            "success": False,
            "message": "Daydream API key not found."
        }

    payload = {
        "messages": [
            {
                "role": "user",
                "content": f"""
You are the AI memory analysis system inside an interactive sci-fi experience called The Last Memory.

Analyze the following memory:

{request.prompt}

Look specifically for:
- missing information
- inconsistencies
- emotional anomalies
- signs that memories were deliberately removed

Respond as the archive system.

Be mysterious, cinematic, and concise.
Do not explain that you are an AI.
"""
            }
        ]
    }

    try:
        response = requests.post(
            AGENT_URL,
            headers={
                "Authorization": f"Bearer {DAYDREAM_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=120,
        )

        try:
            data = response.json()
        except Exception:
            data = response.text

        if not response.ok:
            return {
                "success": False,
                "status_code": response.status_code,
                "message": str(data),
            }

        # Extract the assistant's text from the Livepeer response.
        analysis = None

        if isinstance(data, dict):
            choices = data.get("choices", [])

            if choices:
                message = choices[0].get("message", {})
                analysis = message.get("content")

        return {
            "success": True,
            "analysis": analysis or str(data),
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e),
        }