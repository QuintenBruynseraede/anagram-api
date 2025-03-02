from pathlib import Path

from fastapi import FastAPI, WebSocket
import uvicorn
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from aiostream import stream

from backend.anagram_finder.input import Inputs, Query
from backend.anagram_finder.algorithms import (
    RecursiveAlgorithm,
    AdjectiveNounAlgorithm,
    AdjectiveNameAlgorithm,
    NameNounAlgorithm,
    NounNameAlgorithm,
)

app = FastAPI()
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")


inputs = Inputs.from_files(Path("backend", "dictionaries"))


@app.get("/")
async def get():
    with open("frontend/index.html") as f:
        return HTMLResponse(f.read())


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            query = Query(data)

            algorithms = [
                RecursiveAlgorithm(),
                AdjectiveNounAlgorithm(),
                AdjectiveNameAlgorithm(),
                NameNounAlgorithm(),
                NounNameAlgorithm(),
            ]

            combined = stream.merge(
                *[algorithm.find(inputs, query) for algorithm in algorithms]
            )

            async with combined.stream() as streamer:
                async for item in streamer:
                    await websocket.send_text(item)

            # Final message
            await websocket.send_text("[Done]")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
