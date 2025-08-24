from flask import Flask, request, jsonify, send_file
from datetime import datetime
import os
import json

app = Flask(__name__)
SAVE_FILE = 'save.json'

def load_data():
    """
    Charger les données actuelles depuis le fichier save.json
    """
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, 'r') as f:
            return json.load(f)
    return []

def save_data(data):
    """
    Sauvegarder les données dans le fichier save.json
    """
    with open(SAVE_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/data', methods=['POST'])
def receive_data():
    """
    Reçoit les données JSON via POST, y ajoute un timestamp,
    les sauvegarde, et renvoie une réponse de succès.
    """
    data = request.get_json()
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data format, must be a JSON object"}), 400

    data['timestamp'] = datetime.now().isoformat()

    current_data = load_data()
    current_data.append(data)
    save_data(current_data)

    print(f"Data received: {data}")
    return jsonify({"status": "success", "data_received": data}), 200

@app.route('/download', methods=['GET'])
def download_file():
    """
    Permet de télécharger save.json via GET
    """
    if os.path.exists(SAVE_FILE):
        return send_file(SAVE_FILE, as_attachment=True)
    return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


