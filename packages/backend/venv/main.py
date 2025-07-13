from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ברוכה הבאה ל-API של תמלול 😄"}
