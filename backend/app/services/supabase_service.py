import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import settings

class SupabaseService:
    """
    Direct REST client for Supabase PostgreSQL tables:
    user_profiles, saved_locations, weather_alerts, crowd_reports, community_leaderboard.
    Uses SERVICE_ROLE_KEY for reliable server-side persistence while respecting user_id scoping.
    """

    @classmethod
    def _get_headers(cls) -> Dict[str, str]:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    @classmethod
    def _base_url(cls) -> str:
        return f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1"

    # --- User Profiles ---
    @classmethod
    async def get_user_profile(cls, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return None
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{cls._base_url()}/user_profiles?clerk_user_id=eq.{clerk_user_id}&select=*",
                    headers=cls._get_headers()
                )
                if res.status_code == 200:
                    data = res.json()
                    return data[0] if data else None
        except Exception as e:
            print(f"Supabase get_user_profile error: {e}")
        return None

    @classmethod
    async def upsert_user_profile(cls, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return None
        try:
            headers = cls._get_headers()
            headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{cls._base_url()}/user_profiles",
                    headers=headers,
                    json=profile_data
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    return data[0] if data else profile_data
        except Exception as e:
            print(f"Supabase upsert_user_profile error: {e}")
        return None

    # --- Saved Locations ---
    @classmethod
    async def get_saved_locations(cls, clerk_user_id: str) -> List[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return []
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{cls._base_url()}/saved_locations?clerk_user_id=eq.{clerk_user_id}&select=*",
                    headers=cls._get_headers()
                )
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"Supabase get_saved_locations error: {e}")
        return []

    @classmethod
    async def add_saved_location(cls, location_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return None
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{cls._base_url()}/saved_locations",
                    headers=cls._get_headers(),
                    json=location_data
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    return data[0] if data else location_data
        except Exception as e:
            print(f"Supabase add_saved_location error: {e}")
        return None

    # --- Weather Alerts ---
    @classmethod
    async def insert_alert(cls, alert_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return None
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{cls._base_url()}/weather_alerts",
                    headers=cls._get_headers(),
                    json=alert_data
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    return data[0] if data else alert_data
        except Exception as e:
            print(f"Supabase insert_alert error: {e}")
        return None

    # --- Crowd Reports ---
    @classmethod
    async def get_crowd_reports(cls) -> List[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return []
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{cls._base_url()}/crowd_reports?select=*&order=created_at.desc&limit=50",
                    headers=cls._get_headers()
                )
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"Supabase get_crowd_reports error: {e}")
        return []

    @classmethod
    async def insert_crowd_report(cls, report_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return None
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{cls._base_url()}/crowd_reports",
                    headers=cls._get_headers(),
                    json=report_data
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    return data[0] if data else report_data
        except Exception as e:
            print(f"Supabase insert_crowd_report error: {e}")
        return None

    # --- Leaderboard ---
    @classmethod
    async def get_leaderboard(cls) -> List[Dict[str, Any]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return []
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{cls._base_url()}/community_leaderboard?select=*&order=trust_score.desc&limit=20",
                    headers=cls._get_headers()
                )
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"Supabase get_leaderboard error: {e}")
        return []

    @classmethod
    async def seed_initial_data_if_empty(cls):
        """Seeds sample reports and leaderboard if Supabase is fresh"""
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return
        try:
            headers = cls._get_headers()
            async with httpx.AsyncClient(timeout=6.0) as client:
                # Check leaderboard
                check_lb = await client.get(f"{cls._base_url()}/community_leaderboard?select=id&limit=1", headers=headers)
                if check_lb.status_code == 200 and len(check_lb.json()) == 0:
                    # Seed leaderboard
                    initial_leaders = [
                        {"clerk_user_id": "rep_patil_01", "reporter_name": "Ramesh Patil", "trust_score": 185, "reports_submitted": 24, "reports_verified": 22, "badge": "Trusted Meteorologist"},
                        {"clerk_user_id": "rep_deshmukh_02", "reporter_name": "Dr. Vikas Deshmukh", "trust_score": 160, "reports_submitted": 19, "reports_verified": 18, "badge": "Disaster Sentinel"},
                        {"clerk_user_id": "rep_mehta_03", "reporter_name": "Capt. Arjun Mehta", "trust_score": 140, "reports_submitted": 12, "reports_verified": 12, "badge": "Village Scout"}
                    ]
                    await client.post(f"{cls._base_url()}/community_leaderboard", headers=headers, json=initial_leaders)

                # Check crowd reports
                check_cr = await client.get(f"{cls._base_url()}/crowd_reports?select=id&limit=1", headers=headers)
                if check_cr.status_code == 200 and len(check_cr.json()) == 0:
                    initial_reports = [
                        {
                            "clerk_user_id": "rep_patil_01",
                            "latitude": 18.5180,
                            "longitude": 73.8550,
                            "location_name": "Haveli Tehsil, Sector 4",
                            "observed_condition": "rainy",
                            "intensity": "heavy",
                            "image_url": "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600",
                            "vision_predicted_label": "rainy (nimbostratus)",
                            "vision_confidence": 0.94,
                            "is_verified": True,
                            "cluster_id": 0,
                            "upvotes": 14
                        },
                        {
                            "clerk_user_id": "rep_deshmukh_02",
                            "latitude": 18.5089,
                            "longitude": 73.9260,
                            "location_name": "Hadapsar Agricultural Research Station",
                            "observed_condition": "rainy",
                            "intensity": "moderate",
                            "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600",
                            "vision_predicted_label": "rainy",
                            "vision_confidence": 0.91,
                            "is_verified": True,
                            "cluster_id": 0,
                            "upvotes": 9
                        }
                    ]
                    await client.post(f"{cls._base_url()}/crowd_reports", headers=headers, json=initial_reports)
        except Exception as e:
            print(f"Supabase seeding error: {e}")
