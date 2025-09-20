# MeMetrics Space (FastAPI + Gradio)

- **JSON API:** POST `/predict` with body:
  ```json
  {"skills": 4, "pace": 70, "finance": 80}
  ```
  → Response:
  ```json
  {"score": 785, "grade": "Excellent", "drivers": ["+ Certifications/Skills","+ Learning Pace","+ Financial Stability"]}
  ```

- **UI Demo:** root path `/` shows a simple Gradio app.

## Deploy on Hugging Face
1. Create a new Space → **Type: Spaces • SDK: FastAPI** (or **Gradio**; both work).  
2. Upload these files: `app.py`, `requirements.txt`.  
3. Wait for the Space to build; you’ll get a public URL like `https://huggingface.co/spaces/<you>/<space-name>`.

## Connect to your website
- In your site `config.js`, set:
  ```js
  window.MEMETRICS_SPACE_URL = "https://<you>-<space-name>.hf.space/predict";
  ```
- On the site, click **Call Space API** in the demo section.
