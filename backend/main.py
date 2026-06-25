from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import time

app = FastAPI(title="Hello World Backend", version="1.0.0")

# Record start time for uptime statistics
START_TIME = time.time()

# Configure CORS Middleware (allows browser fetch requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
def read_hello():
    current_time = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    print(f"[{current_time}] GET /api/hello - Requested")
    return {
        "message": "Hello World from the Backend!",
        "timestamp": current_time,
        "status": "success",
        "version": "1.0.0"
    }

@app.get("/api/health")
def read_health():
    return {
        "status": "UP",
        "uptime": time.time() - START_TIME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=False)
