def test_evaluation_summary_endpoint(client):
    resp = client.get("/api/evaluation/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "completed"
    assert data["dataset_size"] == 10
    assert data["precision"] > 0
    assert data["recall"] > 0
    assert data["f1_score"] > 0
    assert len(data["comparisons"]) == 3
    assert len(data["limitations"]) > 0

def test_evaluation_run_endpoint(client):
    resp = client.post("/api/evaluation/run")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "completed"
    assert data["executed_at"] is not None
