import requests
import random
import time

URL = "http://127.0.0.1/data"
TOKEN = "ma_clef_secrete_123"

devices = ["esp32_labo", "esp32_salon", "esp8266_cuisine", "esp32_outdoor", "esp32_garage", "esp8266_bureau", "ESM_1", "ESM_2", "ESM_3"]

for i in range(100):
    device = random.choice(devices)
    payload = {
        "device": device,
        "temperature": round(random.uniform(15, 35), 2),
        "humidity": round(random.uniform(20, 80), 2),
        "co2": round(random.uniform(400, 2000), 2),
        "token": TOKEN
    }
    resp = requests.post(URL, json=payload)
    print(f"[{device}] → {resp.status_code}")
    time.sleep(0.2)
