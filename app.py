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

# CORS
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



# AUTH ROUTES

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
    if not user or not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 400

    token = jwt.encode({
        "id": str(user["_id"]),
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(days=1)
    }, SECRET, algorithm="HS256")

    return jsonify({
        "token": token,
        "role": user["role"],
        "name": user["name"],
        "email": user["email"],
        "user_id": str(user["_id"])
    }), 200



# HEALTH

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# MATCH (HR + Applicant)

@app.route("/api/match", methods=["POST"])
@app.route("/api/match", methods=["POST"])
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

    results = compute_matches_from_text(jd_text, cvs)

    # inject applicant details + skill info
    for i, cv in enumerate(cvs):
        results[i]["applicant_name"] = cv.get("applicant_name", "")
        results[i]["applicant_email"] = cv.get("applicant_email", "")
        
        # ensure skill arrays exist, even if empty
        results[i]["matched_skills"] = results[i].get("matched_skills", [])
        results[i]["missing_must"] = results[i].get("missing_must", [])
        results[i]["missing_nice"] = results[i].get("missing_nice", [])
        results[i]["suggestions"] = results[i].get("suggestions", [])

    return jsonify({"results": results}), 200


    # Attach metadata
    for i, cv in enumerate(cvs):
        results[i]["applicant_name"] = cv.get("applicant_name", "")
        results[i]["applicant_email"] = cv.get("applicant_email", "")
        results[i]["matched_skills"] = cv.get("matched_skills", [])
        results[i]["missing_must_have"] = cv.get("missing_must_have", [])
        results[i]["missing_nice_have"] = cv.get("missing_nice_have", [])

    return jsonify({"results": results}), 200



# MATCH SINGLE (Applicant "Check Fit")

@app.route("/api/match_single", methods=["POST"])
def match_single():
    job_id = request.form.get("job_id")
    file = request.files.get("cv")

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400
    if not file:
        return jsonify({"error": "CV file is required"}), 400

    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
    except:
        return jsonify({"error": "Invalid job_id"}), 400

    if not job:
        return jsonify({"error": "Job not found"}), 404

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    text = extract_text(filepath)
    if not text:
        return jsonify({"error": "Could not extract text"}), 400

    cvs = [{"name": filename, "text": text}]
    results = compute_matches_from_text(job["description"], cvs)

    return jsonify({"match_result": results[0]}), 200



# JOBS

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
    


@app.route("/api/jobs/update/<job_id>", methods=["PUT"])
def update_job(job_id):
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")

    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            return jsonify({"error": "Job not found"}), 404
    except:
        return jsonify({"error": "Invalid job ID"}), 400

    update_data = {}
    if title:
        update_data["title"] = title
    if description:
        update_data["description"] = description

    db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": update_data})

    return jsonify({"message": "Job updated"}), 200

@app.route("/api/jobs/delete/<job_id>", methods=["DELETE"])
def delete_job(job_id):
    try:
        result = db.jobs.delete_one({"_id": ObjectId(job_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Job not found"}), 404

        
        db.applications.delete_many({"job_id": job_id})

        return jsonify({"message": "Job deleted"}), 200

    except:
        return jsonify({"error": "Invalid job ID"}), 400



# APPLY

@app.route("/api/applications/submit", methods=["POST"])
def submit_application():
    job_id = request.form.get("job_id")
    file = request.files.get("cv")

    applicant_name = request.form.get("applicant_name")
    applicant_email = request.form.get("applicant_email")
    applicant_id = request.form.get("applicant_id")

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
        "submitted_at": datetime.utcnow(),
        "applicant_name": applicant_name,
        "applicant_email": applicant_email,
        "applicant_id": applicant_id
    })

    return jsonify({"message": "Application submitted"}), 201



# GET APPLICANTS

@app.route("/api/applications/job/<job_id>", methods=["GET"])
def get_applicants_for_job(job_id):
    apps = list(db.applications.find({"job_id": job_id}))
    for a in apps:
        a["_id"] = str(a["_id"])
    return jsonify({"applicants": apps}), 200



# RECENT APPLICANTS

@app.route("/api/applications/recent", methods=["GET"])
def recent_applications():
    recent = list(db.applications.find().sort("submitted_at", -1).limit(10))

    response = []
    for app_doc in recent:
        job = db.jobs.find_one({"_id": ObjectId(app_doc["job_id"])})

        match_score = None
        try:
            cvs = [{"name": app_doc["filename"], "text": app_doc.get("cv_text", "")}]
            results = compute_matches_from_text(job["description"], cvs)
            match_score = results[0].get("score")
        except:
            pass

        response.append({
            "_id": str(app_doc["_id"]),
            "applicant_name": app_doc.get("applicant_name", ""),
            "applicant_email": app_doc.get("applicant_email", ""),
            "submitted_at": app_doc.get("submitted_at"),
            "job_title": job.get("title", "Unknown Job") if job else "Unknown Job",
            "match_score": match_score
        })

    return jsonify({"recent": response}), 200



# DOWNLOAD FILE

@app.route("/uploads/<path:filename>")
def download_file(filename):
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=True)



# RUN SERVER

if __name__ == "__main__":
    print("🔥 Backend running on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
