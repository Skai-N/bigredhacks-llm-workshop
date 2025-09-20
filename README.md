## bigredhacks-llm-workshop

Demo for BigRed//Hacks' 2025 LLM Workshop

## To Run

1. ```pip install -r python-server/requirements.txt```
2. ```python python-server/server.py```
3. ```npm run dev```

## Important files

```app/api/chat```: handles requests from frontend and forwards to Python server

```python-server```: contains ```server.py``` Flask server, which should be run at startup to load the Hugging Face model

```python-server/requirements.txt```: contains required pip packages to run ```server.py```