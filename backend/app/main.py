from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/hello")
def say_hello():
    return {"message": "Hello from FastAPI!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# fastapiの起動時読み込み
# from fastapi import FastAPI
# from fastapi.exceptions import HTTPException

# from app.core.exceptions import (
#     http_exception_handler,
#     unhandled_exception_handler,
# )

# app = FastAPI()

# app.add_exception_handler(HTTPException, http_exception_handler)
# app.add_exception_handler(Exception, unhandled_exception_handler)
