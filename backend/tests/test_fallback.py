import httpx
import json

base_url = "http://localhost:8000"

def test_health():
    print("--- 1. Testing Health Endpoint ---")
    r = httpx.get(f"{base_url}/health")
    print("Status:", r.status_code, r.json())
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["ai"] == "resilient_fallback"

def test_validation_fallback():
    print("\n--- 2. Testing 5-Agent Validation Pipeline Fallback (Zero API Key) ---")
    payload = {
        "title": "AeroCharge AI",
        "tagline": "Dynamic wireless EV charging embedded in municipal highway asphalt",
        "description": "Smart magnetic resonance pads recharge commercial delivery vans while in motion, eliminating charging depot downtime.",
        "targetMarket": "Commercial Fleet Operators & Logistics"
    }
    r = httpx.post(f"{base_url}/api/ideas/validate", json=payload, timeout=30.0)
    print("Status:", r.status_code)
    assert r.status_code == 200
    idea = r.json()
    print("Synthesized Idea ID:", idea.get("id"))
    print("Venture Title:", idea.get("title"))
    print("Composite Score:", idea.get("score"))
    print("Signal Tier:", idea.get("signal"))
    print("Agents Run Count:", len(idea.get("agents", [])))
    for ag in idea.get("agents", []):
        name = ag.get("name")
        score = ag.get("score")
        status = ag.get("status")
        verdict = ag.get("verdict")
        print(f"  • {name}: {score}/100 [{status}] - {verdict}")
    return idea.get("id")

def test_chat_fallback(idea_id: str):
    print("\n--- 3. Testing Context-Aware Chatbot Fallback ---")
    chat_payload = {
        "message": "What is the primary churn risk identified by the Skeptic agent?",
        "context": {
            "pageKey": "idea_validation",
            "title": "AeroCharge AI",
            "summary": "Validating dynamic wireless EV charging infrastructure"
        },
        "history": []
    }
    r = httpx.post(f"{base_url}/api/chat", json=chat_payload, timeout=10.0)
    print("Status:", r.status_code)
    assert r.status_code == 200
    chat_res = r.json()
    print("Chat Assistant Reply:", chat_res.get("content", "")[:120] + "...")
    print("Quick Actions:", chat_res.get("quickActions", []))

def test_polling_status(idea_id: str):
    print("\n--- 4. Testing Polling Validation Status ---")
    r = httpx.get(f"{base_url}/api/ideas/{idea_id}/validation")
    print("Status:", r.status_code, "Run Status:", r.json().get("status"), "Overall Score:", r.json().get("overallScore"))
    assert r.status_code == 200

if __name__ == "__main__":
    test_health()
    idea_id = test_validation_fallback()
    test_chat_fallback(idea_id)
    test_polling_status(idea_id)
    print("\n🎉 ALL DEMO FALLBACK TESTS COMPLETED SUCCESSFULLY WITH ZERO ERRORS!")
