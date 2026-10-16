import pytest
from datetime import date

def test_create_and_get_job_application(client):
    payload = {
        "company_name": "Stripe",
        "job_title": "Backend Software Engineer",
        "job_description": "We are seeking a Python and FastAPI engineer to design scalable financial infrastructure.",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_min": 120000,
        "salary_max": 160000,
        "status": "Applied",
        "job_url": "https://stripe.com/jobs/123",
        "notes": "Referred by university alumni"
    }
    # 1. Create
    resp = client.post("/api/applications", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] is not None
    assert data["company_name"] == "Stripe"
    assert data["salary_min"] == 120000
    app_id = data["id"]

    # 2. Get by ID
    get_resp = client.get(f"/api/applications/{app_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == app_id

def test_update_and_delete_job_application(client):
    create_payload = {
        "company_name": "Google",
        "job_title": "Software Engineer II",
        "job_description": "Build high-throughput distributed systems in C++ and Python.",
        "status": "Applied"
    }
    post_resp = client.post("/api/applications", json=create_payload)
    app_id = post_resp.json()["id"]

    # Patch status
    patch_resp = client.patch(f"/api/applications/{app_id}", json={"status": "Interview", "notes": "Technical screen scheduled"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "Interview"
    assert patch_resp.json()["notes"] == "Technical screen scheduled"

    # Delete
    del_resp = client.delete(f"/api/applications/{app_id}")
    assert del_resp.status_code == 204

    # Verify 404 after deletion
    get_again = client.get(f"/api/applications/{app_id}")
    assert get_again.status_code == 404

def test_invalid_status_rejected(client):
    payload = {
        "company_name": "Acme Corp",
        "job_title": "Engineer",
        "job_description": "General engineering duties",
        "status": "RandomInvalidStatus"
    }
    resp = client.post("/api/applications", json=payload)
    assert resp.status_code == 422
    assert "Invalid status" in resp.text

def test_invalid_salary_range(client):
    payload = {
        "company_name": "Acme Corp",
        "job_title": "Engineer",
        "job_description": "General engineering duties",
        "salary_min": 100000,
        "salary_max": 80000  # min > max
    }
    resp = client.post("/api/applications", json=payload)
    assert resp.status_code == 422


def test_partial_salary_updates_preserve_range_invariant(client):
    created = client.post("/api/applications", json={
        "company_name": "Acme Corp",
        "job_title": "Engineer",
        "job_description": "General engineering duties",
        "salary_min": 100000,
        "salary_max": 120000,
    })
    app_id = created.json()["id"]

    invalid_min = client.patch(f"/api/applications/{app_id}", json={"salary_min": 130000})
    assert invalid_min.status_code == 422

    invalid_max = client.patch(f"/api/applications/{app_id}", json={"salary_max": 90000})
    assert invalid_max.status_code == 422

    unchanged = client.get(f"/api/applications/{app_id}").json()
    assert unchanged["salary_min"] == 100000
    assert unchanged["salary_max"] == 120000

def test_invalid_job_url(client):
    payload = {
        "company_name": "Acme Corp",
        "job_title": "Engineer",
        "job_description": "General engineering duties",
        "job_url": "invalid-url-without-protocol"
    }
    resp = client.post("/api/applications", json=payload)
    assert resp.status_code == 422

def test_application_not_found(client):
    resp = client.get("/api/applications/99999")
    assert resp.status_code == 404
    del_resp = client.delete("/api/applications/99999")
    assert del_resp.status_code == 404

def test_search_and_filter_applications(client):
    client.post("/api/applications", json={
        "company_name": "Apple",
        "job_title": "iOS Engineer",
        "job_description": "Swift and iOS frameworks",
        "status": "Applied"
    })
    client.post("/api/applications", json={
        "company_name": "Amazon",
        "job_title": "Cloud Architect",
        "job_description": "AWS and distributed systems",
        "status": "Offer"
    })

    # Search by Apple
    resp = client.get("/api/applications?search=Apple")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["company_name"] == "Apple"

    # Filter by Offer status
    resp_offer = client.get("/api/applications?status=Offer")
    assert resp_offer.status_code == 200
    assert resp_offer.json()["total"] == 1
    assert resp_offer.json()["items"][0]["company_name"] == "Amazon"
