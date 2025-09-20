from fastapi import FastAPI
from pydantic import BaseModel
import gradio as gr

# ---------- Core scoring logic ----------
def compute_score(skills:int, pace:int, finance:int) -> int:
    s = max(1, min(5, skills)) / 5
    p = max(0, min(100, pace)) / 100
    f = max(0, min(100, finance)) / 100
    return round(300 + 600*(0.40*s + 0.35*p + 0.25*f))

def grade_for(score:int) -> str:
    return "Excellent" if score>760 else "Good" if score>680 else "Fair" if score>580 else "Developing"

def drivers_for(skills:int, pace:int, finance:int):
    drivers = []
    if skills >= 4: drivers.append("+ Certifications/Skills")
    if pace >= 60: drivers.append("+ Learning Pace")
    if finance < 50: drivers.append("− Financial Stress")
    else: drivers.append("+ Financial Stability")
    return drivers

# ---------- FastAPI app with JSON endpoint ----------
api = FastAPI(title="MeMetrics DVI API")

class In(BaseModel):
    skills:int
    pace:int
    finance:int

@api.post("/predict")
def predict(inp: In):
    score = compute_score(inp.skills, inp.pace, inp.finance)
    return {
        "score": score,
        "grade": grade_for(score),
        "drivers": drivers_for(inp.skills, inp.pace, inp.finance)
    }

# ---------- Gradio demo UI (mounted under /) ----------
def ui_predict(skills:int, pace:int, finance:int):
    r = predict(In(skills=skills, pace=pace, finance=finance))
    return r["score"], r["grade"], ", ".join(r["drivers"])

with gr.Blocks(title="MeMetrics — DVI Demo") as demo:
    gr.Markdown("# MeMetrics — DVI Demo\nTry different inputs and see the score.")
    with gr.Row():
        skills = gr.Slider(1,5,step=1,value=4,label="Skills level (1–5)")
        pace = gr.Slider(0,100,step=5,value=70,label="Learning pace (0–100)")
        finance = gr.Slider(0,100,step=5,value=80,label="Finance (optional) (0–100)")
    btn = gr.Button("Compute")
    score = gr.Number(label="Score", interactive=False)
    grade = gr.Textbox(label="Grade", interactive=False)
    drivers = gr.Textbox(label="Top drivers", interactive=False)
    btn.click(ui_predict, [skills, pace, finance], [score, grade, drivers])

# IMPORTANT: mount Gradio UI at "/" so the Space shows the demo, while JSON API is at "/predict"
app = gr.mount_gradio_app(api, demo, path="/")
