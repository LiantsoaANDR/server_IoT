import requests
import random
import time

URL = "http://127.0.0.1/data"
TOKEN = "ma_clef_secrete_123"

for i in range(2000):
    # Génère un nom unique à chaque requête
    device = f"esp_{i}"
    
    payload = {
        "device": device,
        "temperature": round(random.uniform(15, 35), 2),
        "humidity": round(random.uniform(20, 80), 2),
        "co2": round(random.uniform(400, 2000), 2),
        "token": TOKEN
    }
    resp = requests.post(URL, json=payload)
    print(f"[{device}] → {resp.status_code}")

