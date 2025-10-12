#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
감정 분석 + 공감형 요약 (700자 이내, 유동 길이) + 감정 라벨 + 감정 스코어

입력(JSON):
{
  "post_id": 1,
  "content": "요즘 일이 너무 많아서 지치고 피곤해요."
}

출력(JSON):
{
  "post_id": 1,
  "status": "DONE",
  "provider": "openai",
  "label": "NEGATIVE",
  "score": 0.83,
  "text": "공감과 감정 해석, 맞춤 제안이 담긴 자연스러운 상담가 톤 문장 (최대 700자)"
}


환경변수:
- OPENAI_API_KEY (필수)
- OPENAI_MODEL (선택, 기본값: gpt-4o-mini)
"""


"""
[bash 실행 예시]

export OPENAI_API_KEY="sk-proj-XXXX..."
export OPENAI_MODEL="gpt-4o-mini"

echo '{
  "post_id": 11,
  "content": "요즘 유난히 피곤하고 의욕이 없어요. 그래도 산책을 다녀오면 조금은 마음이 가라앉아요."
}' | python3 analyze_diary_openai.py

"""

import os, sys, json, re
from typing import Any, Dict, Optional
import urllib.request

# --------- 유틸 ---------
def read_json_from_stdin_or_file() -> Dict[str, Any]:
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            return json.load(f)
    data = sys.stdin.read()
    if not data.strip():
        raise SystemExit("No input provided. Pass a file path or pipe JSON into stdin.")
    return json.loads(data)

def extract_json(s: str) -> Optional[Dict[str, Any]]:
    """출력에 텍스트가 섞여도 가장 바깥 JSON만 추출."""
    if not s:
        return None
    candidates = re.findall(r'\{[\s\S]*\}', s)
    for cand in candidates[::-1]:
        try:
            return json.loads(cand)
        except Exception:
            continue
    return None

def build_prompt(text: str) -> str:
    # 공감 중심 프롬프트 (한국어 응답, 존댓말, JSON-only)
    return (
        "역할: 당신은 따뜻하고 세심하게 공감하는 감정 분석 보조자입니다. 한국어로 존댓말을 사용하세요.\n"
        "목표: 사용자의 일기 텍스트를 분석해 감정을 분류하고(정확·공정), 요약과 함께 공감/위로 문장을 제공하며,\n"
        "가벼운 행동 제안·노래·음식·활동·저널링 프롬프트를 제시합니다.\n"
        "주의:\n"
        "- 반드시 JSON만 출력하세요. 마크다운/설명/코드블록/여분 텍스트 금지.\n"
        "- 의학적 진단/치료 지시/전문가 행세 금지. 과도한 확신 금지. 상업적 브랜드 권장 금지.\n"
        "- 자해/위기 신호가 뚜렷하면 safety.crisis=true와 함께 안전 안내 메시지를 note에 제공하세요 (간결하게, 한국 로컬 기준 일반 안내 표현).\n"
        "- 추천은 현실적이고 부담이 적은 가벼운 것 위주로 2~4개씩 제시.\n"
        "- 가능하면 사용자의 정서 톤을 반영해 공감 문장을 개인화하세요.\n"
        "라벨 규칙:\n"
        '- "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED"\n'
        "스코어는 0.0~1.0 (신뢰/강도 추정)로 부여.\n"
        "JSON 스키마:\n"
        "{\n"
        '  "label": "POSITIVE|NEGATIVE|NEUTRAL|MIXED",\n'
        '  "score": number,\n'
        '  "summary": "한 줄 요약(한국어)",\n'
        '  "empathy": "짧은 공감/위로 문장(한국어, 존댓말)",\n'
        '  "recommendations": {\n'
        '    "actions": [string],\n'
        '    "songs": [string],\n'
        '    "foods": [string],\n'
        '    "activities": [string],\n'
        '    "journaling_prompts": [string]\n'
        '  },\n'
        '  "safety": {"crisis": boolean, "note": "null 또는 짧은 안내문(한국어)" }\n'
        "}\n"
        "출력은 위 스키마의 JSON만 포함해야 합니다.\n"
        f"분석 대상 텍스트:\n{text}"
    )

def http_request(url: str, method: str = "POST", headers: Dict[str,str]=None, data: bytes=None, timeout: int=60) -> str:
    req = urllib.request.Request(url, data=data, method=method)
    if headers:
        for k,v in headers.items():
            req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8")

# --------- OpenAI 감정분석 ---------
def analyze_with_openai(text: str) -> Dict[str, Any]:
    api_key = os.environ["OPENAI_API_KEY"]
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    system = (
        "You are a careful, warm Korean-language sentiment analysis API. "
        "Output ONLY JSON per user schema. No extra text."
    )
    user = build_prompt(text)

    body = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        "temperature": 0.3,
        "top_p": 0.9
    }, ensure_ascii=False).encode("utf-8")

    res = http_request(
        url="https://api.openai.com/v1/chat/completions",
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        data=body,
        timeout=120
    )

    try:
        obj = json.loads(res)
        content = obj["choices"][0]["message"]["content"]
    except Exception:
        content = res

    js = extract_json(content)
    if not js:
        raise RuntimeError("Failed to parse JSON from model output")

    # 보정/검증
    label = str(js.get("label", "NEUTRAL")).upper()
    if label not in {"POSITIVE","NEGATIVE","NEUTRAL","MIXED"}:
        label = "NEUTRAL"
    def clamp01(x, default=0.5):
        try:
            v = float(x)
        except Exception:
            return default
        return max(0.0, min(1.0, v))

    score = clamp01(js.get("score", 0.5))
    summary = str(js.get("summary", "")).strip()
    empathy = str(js.get("empathy", "")).strip()

    # 추천 필드 기본값 정리
    rec = js.get("recommendations") or {}
    def as_list(x):
        return [str(i) for i in x] if isinstance(x, list) else []
    recommendations = {
        "actions": as_list(rec.get("actions")),
        "songs": as_list(rec.get("songs")),
        "foods": as_list(rec.get("foods")),
        "activities": as_list(rec.get("activities")),
        "journaling_prompts": as_list(rec.get("journaling_prompts")),
    }

    # safety 필드 기본값 정리
    safety = js.get("safety") or {}
    crisis = bool(safety.get("crisis", False))
    note = safety.get("note", None)
    if note is not None:
        note = str(note).strip() or None

    return {
        "provider": "openai",
        "label": label,
        "score": score,
        "summary": summary,
        "empathy": empathy,
        "recommendations": recommendations,
        "safety": {"crisis": crisis, "note": note},
        "raw": content if content and content != js else None
    }

# --------- 엔트리포인트 ---------
def main():
    try:
        payload = read_json_from_stdin_or_file()
        post_id = payload.get("post_id")
        text = (payload.get("content") or "").strip()
        if not text:
            raise ValueError("`content`(일기 본문)이 비어 있습니다.")

        result = analyze_with_openai(text)

        out = {
            "post_id": post_id,
            "status": "DONE",
            **result
        }
        print(json.dumps(out, ensure_ascii=False))
    except Exception as e:
        out = {
            "post_id": None,
            "status": "ERROR",
            "provider": "openai",
            "label": None,
            "score": None,
            "summary": None,
            "empathy": None,
            "recommendations": {
                "actions": [], "songs": [], "foods": [], "activities": [], "journaling_prompts": []
            },
            "safety": {"crisis": False, "note": None},
            "raw": str(e)
        }
        print(json.dumps(out, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()