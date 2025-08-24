from flask import Flask, request, jsonify, send_file, send_from_directory
from datetime import datetime
import os
import json

app = Flask(__name__, static_folder="../frontend", template_folder="../frontend")

DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data")



def get_device_file(device):
    return os.path.join(DATA_FOLDER, f"{device}.json")

# ------------------ API ------------------
@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    if not isinstance(data, dict) or "device" not in data:
        return jsonify({"error": "Invalid data, must include 'device'"}), 400

    device = data["device"]
    data['timestamp'] = datetime.now().isoformat()

    file_path = get_device_file(device)
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            current_data = json.load(f)
    else:
        current_data = []

    current_data.append(data)

    with open(file_path, "w") as f:
        json.dump(current_data, f, indent=2)

    return jsonify({"status": "success", "device": device, "data": data}), 200

@app.route('/list', methods=['GET'])
def list_files():
    files = [f for f in os.listdir(DATA_FOLDER) if f.endswith(".json")]
    return jsonify(files)

@app.route('/download/<device>', methods=['GET'])
def download_file(device):
    file_path = get_device_file(device)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "File not found"}), 404

@app.route('/delete/<device>', methods=['DELETE'])
def delete_file(device):
    file_path = get_device_file(device)
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({"status": "deleted", "device": device}), 200
    return jsonify({"error": "File not found"}), 404

# ------------------ Frontend ------------------
@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
