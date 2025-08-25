import json
from flask import Flask, request, jsonify, send_from_directory, Response
from datetime import datetime
from pymongo import MongoClient

app = Flask(__name__, static_folder="../frontend", template_folder="../frontend")

# ------------------ CONFIGURATION ------------------
SECRET_TOKEN = "ma_clef_secrete_123" 

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client.iot_db
collection = db.device_data

# ------------------ API ------------------
@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()

    if not isinstance(data, dict) or "device" not in data:
        return jsonify({"error": "Invalid data, must include 'device'"}), 400

    # Vérification du token
    if data.get("token") != SECRET_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401

    # Supprimer le token avant sauvegarde
    data.pop("token", None)
    data['timestamp'] = datetime.now().isoformat()

    # Enregistrement dans MongoDB
    collection.insert_one(data)

    # Réponse (sans ObjectId)
    return jsonify({
        "status": "success",
        "device": data["device"],
        "data": {k: v for k, v in data.items() if k != "_id"}  # supprime _id si présent
    }), 200


@app.route('/list', methods=['GET'])
def list_files():
    devices = collection.distinct("device")
    return jsonify(devices)


@app.route('/download/<device>', methods=['GET'])
def download_file(device):
    data = list(collection.find({"device": device}, {"_id": 0}))
    if data:
        response = Response(
            json.dumps(data, indent=2),
            mimetype='application/json'
        )
        response.headers["Content-Disposition"] = f"attachment; filename={device}.json"
        return response
    return jsonify({"error": "Device not found"}), 404


@app.route('/delete/<device>', methods=['DELETE'])
def delete_file(device):
    result = collection.delete_many({"device": device})
    if result.deleted_count > 0:
        return jsonify({"status": "deleted", "device": device}), 200
    return jsonify({"error": "Device not found"}), 404


# ------------------ FRONTEND ------------------
@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")
