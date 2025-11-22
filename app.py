import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from bson import ObjectId
from datetime import datetime, timedelta
import bcrypt
import jwt

SECRET = "supersecretkey123"

app = Flask(__name__)

# FIXED CORS
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

from matcher import (
    compute_matches_from_text,
    allowed_file,
    extract_text,
    UPLOAD_DIR,
)
from db import db

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_DIR
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024

# ---------------------------------------
# AUTH ROUTES
# ---------------------------------------
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed,
        "role": role
    })

    return jsonify({"message": "User created"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 400

    if not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 400

    token = jwt.encode({
        "id": str(user["_id"]),
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(days=1)
    }, SECRET, algorithm="HS256")

    return jsonify({
        "token": token,
        "role": user["role"]
    }), 200

# ---------------------------------------
# HEALTH CHECK
# ---------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

# ---------------------------------------
# HR MATCHING (JSON + FILES)
# ---------------------------------------
@app.route("/api/match", methods=["POST"])
def match_from_text():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    jd_text = (data.get("job_description") or "").strip()
    cvs = data.get("cvs") or []

    if not jd_text:
        return jsonify({"error": "job_description is required"}), 400

    if not cvs:
        return jsonify({"error": "At least one CV is required"}), 400

    try:
        results = compute_matches_from_text(jd_text, cvs)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/match_files", methods=["POST"])
def match_from_files():
    jd_text = (request.form.get("job_description") or "").strip()
    if not jd_text:
        return jsonify({"error": "job_description is required"}), 400

    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    cvs = []
    for f in files:
        if not allowed_file(f.filename):
            continue

        filename = secure_filename(f.filename)
        path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        f.save(path)

        text = extract_text(path)
        if text:
            cvs.append({"name": filename, "text": text})

    if not cvs:
        return jsonify({"error": "Could not extract any CV text"}), 400

    results = compute_matches_from_text(jd_text, cvs)
    return jsonify({"results": results}), 200

# ---------------------------------------
# JOB CREATION / LISTING
# ---------------------------------------
@app.route("/api/jobs/create", methods=["POST"])
def create_job():
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")

    if not title or not description:
        return jsonify({"error": "title and description required"}), 400

    job = {"title": title, "description": description}
    job["_id"] = str(db.jobs.insert_one(job).inserted_id)

    return jsonify({"message": "Job created", "job": job}), 201


@app.route("/api/jobs/list", methods=["GET"])
def list_jobs():
    jobs = list(db.jobs.find({}, {"title": 1, "description": 1}))
    for j in jobs:
        j["_id"] = str(j["_id"])
    return jsonify(jobs), 200


@app.route("/api/job/<job_id>", methods=["GET"])
def get_job(job_id):
    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            return jsonify({"error": "Job not found"}), 404

        job["_id"] = str(job["_id"])
        return jsonify(job), 200
    except:
        return jsonify({"error": "Invalid job id"}), 400

# ---------------------------------------
# APPLICANT: MATCH SINGLE CV (CHECK FIT)
# ---------------------------------------
@app.route("/api/match_single", methods=["POST"])
def match_single():
    job_id = request.form.get("job_id")
    file = request.files.get("cv")

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400
    if not file:
        return jsonify({"error": "CV file is required"}), 400

    # Get job description
    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
    except:
        return jsonify({"error": "Invalid job_id"}), 400

    if not job:
        return jsonify({"error": "Job not found"}), 404

    # Save CV file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Extract CV text
    text = extract_text(filepath)
    if not text:
        return jsonify({"error": "Could not extract text"}), 400

    cvs = [{"name": filename, "text": text}]
    results = compute_matches_from_text(job["description"], cvs)

    return jsonify({"match_result": results[0]}), 200

# ---------------------------------------
# APPLICANT: SUBMIT APPLICATION
# ---------------------------------------
@app.route("/api/applications/submit", methods=["POST"])
def submit_application():
    job_id = request.form.get("job_id")
    file = request.files.get("cv")

    if not job_id or not file:
        return jsonify({"error": "job_id and cv required"}), 400

    job = db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        return jsonify({"error": "Invalid job"}), 404

    filename = secure_filename(file.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    text = extract_text(path)

    db.applications.insert_one({
        "job_id": job_id,
        "filename": filename,
        "filepath": path,
        "cv_text": text,
        "submitted_at": datetime.utcnow()
    })

    return jsonify({"message": "Application submitted"}), 201

# ---------------------------------------
# HR: VIEW ALL APPLICANTS
# ---------------------------------------
@app.route("/api/applications/job/<job_id>", methods=["GET"])
def get_applicants_for_job(job_id):
    apps = list(db.applications.find({"job_id": job_id}, {"cv_text": 0}))
    for a in apps:
        a["_id"] = str(a["_id"])
    return jsonify({"applicants": apps}), 200

# ---------------------------------------
# HR: MATCH ALL APPLICANTS
# ---------------------------------------
@app.route("/api/applications/match/<job_id>", methods=["GET"])
def match_applicants(job_id):
    job = db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        return jsonify({"error": "Job not found"}), 404

    apps = list(db.applications.find({"job_id": job_id}))
    cvs = [{
        "id": str(a["_id"]),
        "name": a["filename"],
        "text": a.get("cv_text", "")
    } for a in apps]

    results = compute_matches_from_text(job["description"], cvs)
    results = sorted(results, key=lambda x: x.get("score", 0), reverse=True)

    return jsonify({"results": results}), 200


# ---------------------------------------
# DOWNLOAD FILE
# ---------------------------------------
@app.route("/uploads/<path:filename>")
def download_file(filename):
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=True)

# ---------------------------------------
# RUN SERVER
# ---------------------------------------
if __name__ == "__main__":
    print("🔥 Backend running on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
