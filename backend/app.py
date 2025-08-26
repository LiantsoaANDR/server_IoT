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

    if data.get("token") != SECRET_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401

    data.pop("token", None)
    data['timestamp'] = datetime.now().isoformat()
    collection.insert_one(data)

    return jsonify({
        "status": "success",
        "device": data["device"],
        "data": {k: v for k, v in data.items() if k != "_id"}
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

# ------------------ NOUVEL ENDPOINT ------------------
@app.route('/values', methods=['GET'])
def get_values():
    # Champs demandés
    fields_param = request.args.get("fields")
    if not fields_param:
        return jsonify({"error": "Missing fields parameter"}), 400

    fields = [f.strip() for f in fields_param.split(",")]

    # Toujours inclure device + timestamp
    projection = {"_id": 0, "device": 1, "timestamp": 1}
    for f in fields:
        projection[f] = 1

    # Filtre par device si demandé
    device = request.args.get("device")
    query = {}
    if device:
        query["device"] = device

    # Filtrer : au moins un des champs doit exister
    query["$or"] = [{f: {"$exists": True}} for f in fields]

    data = list(collection.find(query, projection))
    return jsonify(data), 200

# ------------------ FRONTEND ------------------
@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")
