from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# MODEL_ID = "ibm-granite/granite-docling-258M"
MODEL_ID = "meta-llama/Llama-3.2-1B-Instruct"
# MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v0.6"

def pick_device():
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"

device = pick_device()
dtype = torch.float16 if device in ("cuda", "mps") else torch.float32
print(f"Loading {MODEL_ID} on {device} ({dtype})")

# Load model at startup
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

generator = pipeline("text-generation", model=MODEL_ID)

# Define endpoints
app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_ID, "device": device})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "Missing 'prompt'"}), 400
    
    messages = [
        {"role": "system", "content": "You are a fun storyteller. Your job is to continue on the story by writing the next sentence. Always add new information that was not previously stated and do not repeat the sentence you were given."},
        {"role": "user", "content": data.get("prompt", "").strip()}
    ]

    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

    try:
        with torch.inference_mode():
            out = generator(
                prompt,
                max_new_tokens=50,
                temperature=1.5,
                eos_token_id=tokenizer.eos_token_id,
                pad_token_id=tokenizer.eos_token_id,
            )

        full_text = out[0]["generated_text"]
        completion_only = full_text[len(prompt):].strip() if full_text.startswith(prompt) else full_text
        return jsonify({"text": full_text, "completion": completion_only})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)
