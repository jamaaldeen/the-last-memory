from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
import time

load_dotenv()

app = FastAPI(title="The Last Memory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DAYDREAM_API_KEY = os.getenv("DAYDREAM_API_KEY")

AGENT_URL = "https://agent.livepeer.org/api/llm/chat"
MCP_CREATIVE_URL = "https://agent.livepeer.org/api/mcp/creative"


class MemoryRequest(BaseModel):
    prompt: str


class VideoRequest(BaseModel):
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
Do not use Markdown, asterisks, bullet points, headings, or special formatting.
Return clean plain text only.
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


@app.post("/create-video")
def create_video(request: VideoRequest):

    if not request.prompt.strip():
        return {
            "success": False,
            "message": "Please describe the memory you want to create."
        }

    headers = {
        "Accept": "application/json, text/event-stream",
        "Content-Type": "application/json",
    }

    try:

        # ---------------------------------------------------------
        # STEP 1 — Generate image
        # ---------------------------------------------------------

        image_response = requests.post(
            MCP_CREATIVE_URL,
            headers=headers,
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": "create_media",
                    "arguments": {
                        "action": "generate",
                        "prompt": request.prompt
                    }
                }
            },
            timeout=120,
        )

        try:
            image_data = image_response.json()
        except Exception:
            image_data = image_response.text

        if not image_response.ok:
            return {
                "success": False,
                "status_code": image_response.status_code,
                "message": str(image_data)
            }

        image_structured = (
            image_data
            .get("result", {})
            .get("structuredContent", {})
        )

        image_url = image_structured.get("url")

        if not image_url:
            return {
                "success": False,
                "message": "Livepeer did not return an image URL.",
                "raw_response": image_data
            }

        # ---------------------------------------------------------
        # STEP 2 — Start image-to-video job
        # ---------------------------------------------------------

        video_response = requests.post(
            MCP_CREATIVE_URL,
            headers=headers,
            json={
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "create_media",
                    "arguments": {
                        "action": "animate",
                        "source_url": image_url,
                        "prompt": request.prompt,
                        "duration": 5
                    }
                }
            },
            timeout=120,
        )

        try:
            video_data = video_response.json()
        except Exception:
            video_data = video_response.text

        if not video_response.ok:
            return {
                "success": False,
                "status_code": video_response.status_code,
                "message": str(video_data)
            }

        video_result = video_data.get("result", {})
        video_structured = video_result.get("structuredContent", {})

        video_url = video_structured.get("url")
        job_id = video_structured.get("job_id")

        # Some responses may return a finished URL immediately.
        if video_url:
            return {
                "success": True,
                "image_url": image_url,
                "video_url": video_url
            }

        if not job_id:
            return {
                "success": False,
                "message": "Livepeer did not return a video URL or job ID.",
                "image_url": image_url,
                "animation_response": video_data
            }

        # ---------------------------------------------------------
        # STEP 3 — Poll asynchronous Livepeer job
        # ---------------------------------------------------------

        max_attempts = 24

        for attempt in range(max_attempts):

            time.sleep(8)

            poll_response = requests.post(
                MCP_CREATIVE_URL,
                headers=headers,
                json={
                    "jsonrpc": "2.0",
                    "id": 3,
                    "method": "tools/call",
                    "params": {
                        "name": "get_create_media",
                        "arguments": {
                            "job_id": job_id
                        }
                    }
                },
                timeout=60,
            )

            try:
                poll_data = poll_response.json()
            except Exception:
                poll_data = poll_response.text

            if not poll_response.ok:
                continue

            poll_result = poll_data.get("result", {})
            poll_structured = poll_result.get(
                "structuredContent",
                {}
            )

            status = poll_structured.get("status")

            # Look for the final media URL.
            completed_url = poll_structured.get("url")

            if completed_url:
                return {
                    "success": True,
                    "image_url": image_url,
                    "video_url": completed_url,
                    "job_id": job_id
                }

            # Some versions may return the URL under result/content.
            content = poll_result.get("content", [])

            if isinstance(content, list):
                for item in content:

                    if not isinstance(item, dict):
                        continue

                    possible_url = item.get("url")

                    if possible_url:
                        return {
                            "success": True,
                            "image_url": image_url,
                            "video_url": possible_url,
                            "job_id": job_id
                        }

            if status == "failed":
                return {
                    "success": False,
                    "message": "Livepeer video generation failed.",
                    "image_url": image_url,
                    "job_id": job_id,
                    "poll_response": poll_data
                }

        # ---------------------------------------------------------
        # STEP 4 — Timeout
        # ---------------------------------------------------------

        return {
            "success": False,
            "message": "Livepeer video generation is still processing. Please try again shortly.",
            "image_url": image_url,
            "job_id": job_id
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }