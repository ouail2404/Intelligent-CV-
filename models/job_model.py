from db import db
from bson.objectid import ObjectId

def create_job(title, description):
    job = {
        "title": title,
        "description": description
    }
    result = db.jobs.insert_one(job)
    job["_id"] = str(result.inserted_id)
    return job

def get_all_jobs():
    jobs = list(db.jobs.find())
    for j in jobs:
        j["_id"] = str(j["_id"])
    return jobs

def get_job(job_id):
    job = db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        return None
    job["_id"] = str(job["_id"])
    return job
