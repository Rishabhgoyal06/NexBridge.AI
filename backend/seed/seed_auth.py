import httpx
from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from app.db import execute, fetch_one
import asyncio

client = httpx.Client()
headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

demo_users = [
    {
        "email": "aarav@nexbridge.ai",
        "password": "NexBridge2026!",
        "name": "Aarav Patel",
        "role": "founder",
        "headline": "Seed Founder • Building NutriFit AI"
    },
    {
        "email": "taras@hyperscale.io",
        "password": "NexBridge2026!",
        "name": "Taras Kowalski",
        "role": "talent",
        "headline": "Staff Distributed Systems Architect • Open to Roles"
    },
    {
        "email": "marcus@vance.io",
        "password": "NexBridge2026!",
        "name": "Marcus Vance",
        "role": "mentor",
        "headline": "Angel Investor & Product Advisor • Vance Advisory"
    }
]

def seed_auth():
    print("Seeding canonical verified users into Supabase Auth...")
    # Fetch existing users
    r = client.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers)
    existing_users = {x["email"]: x["id"] for x in r.json().get("users", [])}

    for u in demo_users:
        email = u["email"]
        password = u["password"]
        role = u["role"]
        name = u["name"]

        if email in existing_users:
            user_id = existing_users[email]
            r_up = client.put(
                f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                headers=headers,
                json={
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {"role": role, "name": name}
                }
            )
            print(f"  ✓ Updated verified user: {email} (status: {r_up.status_code})")
        else:
            r_cr = client.post(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers=headers,
                json={
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {"role": role, "name": name}
                }
            )
            print(f"  ✓ Created verified user: {email} (status: {r_cr.status_code})")

    # Verify logins with password grant
    for u in demo_users:
        email = u["email"]
        password = u["password"]
        r_login = client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={"apikey": SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json"},
            json={"email": email, "password": password}
        )
        if r_login.status_code == 200:
            token = r_login.json().get("access_token", "")
            print(f"  🎉 Login verified for {email}: Access token granted! (len: {len(token)})")
        else:
            print(f"  ❌ Login failed for {email}: {r_login.text}")

if __name__ == "__main__":
    seed_auth()
