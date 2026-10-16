from datetime import date, timedelta

def test_dashboard_empty_state(client):
    resp = client.get("/api/dashboard/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_applications"] == 0
    assert data["upcoming_followups_count"] == 0
    assert data["total_analyses"] == 0
    assert data["average_similarity_score"] is None
    assert data["average_skill_coverage_score"] is None
    assert len(data["recent_applications"]) == 0

    dist_resp = client.get("/api/dashboard/status-distribution")
    assert dist_resp.status_code == 200
    assert dist_resp.json() == []

def test_dashboard_populated_state(client):
    today = date.today()
    future_date = (today + timedelta(days=5)).isoformat()
    past_date = (today - timedelta(days=5)).isoformat()

    # Create 3 applications
    client.post("/api/applications", json={
        "company_name": "Meta",
        "job_title": "Production Engineer",
        "job_description": "Linux and Python infrastructure",
        "status": "Applied",
        "follow_up_date": future_date
    })
    client.post("/api/applications", json={
        "company_name": "Netflix",
        "job_title": "Backend Architect",
        "job_description": "Microservices and Java",
        "status": "Interview",
        "follow_up_date": past_date
    })
    client.post("/api/applications", json={
        "company_name": "Microsoft",
        "job_title": "Azure Cloud Engineer",
        "job_description": "Cloud infrastructure",
        "status": "Applied"
    })

    # Summary
    summary_resp = client.get("/api/dashboard/summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_applications"] == 3
    assert summary["applications_by_status"]["Applied"] == 2
    assert summary["applications_by_status"]["Interview"] == 1
    assert summary["upcoming_followups_count"] == 1

    # Distribution
    dist_resp = client.get("/api/dashboard/status-distribution")
    assert dist_resp.status_code == 200
    distribution = dist_resp.json()
    assert len(distribution) == 2
    for item in distribution:
        if item["status"] == "Applied":
            assert item["count"] == 2
            assert round(item["percentage"]) == 67
        elif item["status"] == "Interview":
            assert item["count"] == 1
            assert round(item["percentage"]) == 33

    # Upcoming followups
    followup_resp = client.get("/api/dashboard/upcoming-followups")
    assert followup_resp.status_code == 200
    followups = followup_resp.json()
    assert len(followups) == 1
    assert followups[0]["company_name"] == "Meta"
    assert followups[0]["days_until"] == 5
