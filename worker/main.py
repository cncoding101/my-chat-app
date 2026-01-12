from fastapi import FastAPI
from routers.chat import router as chat_router

app = FastAPI(title="Chat App Worker")

app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"message": "Chat App Worker API"}
