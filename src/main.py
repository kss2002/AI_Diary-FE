from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os, json
from dotenv import load_dotenv
from analyze_diary_openai import analyze_with_openai  

load_dotenv()
app = FastAPI()

#  CORS 설정 (테스트 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  감정 분석 엔드포인트
@app.post("/analyze")
async def analyze_diary(request: Request):
    try:
        data = await request.json()
        content = data.get("content", "").strip()

        if not content:
            return {
                "status": "ERROR",
                "message": "내용이 비어 있습니다.",
            }

        # 실제 감정분석 수행
        result = analyze_with_openai(content)

        return {
            "status": "DONE",
            "provider": result["provider"],
            "label": result["label"],
            "score": result["score"],
            "summary": result["summary"],
            "empathy": result["empathy"],
            "recommendations": result["recommendations"],
            "safety": result["safety"],
        }

    except Exception as e:
        print(" 분석 오류:", e)
        return {
            "status": "ERROR",
            "message": str(e),
        }
