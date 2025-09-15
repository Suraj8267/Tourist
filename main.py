# main.py (Complete with Geofencing)
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Tuple
import databases
import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, Float
from sqlalchemy.orm import declarative_base
import uuid
import qrcode
import io
import base64
import json
from datetime import datetime, timedelta
import uvicorn
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import logging
import sqlalchemy.dialects.postgresql
import secrets
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import func, extract, case
import math

# Configure logging to see WebSocket messages
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database configuration - Use PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/tourist_db")

# Create database connection
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# Define tourists table
tourists = sqlalchemy.Table(
    "tourists",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("tourist_id", sqlalchemy.String, unique=True),
    sqlalchemy.Column("blockchain_hash", sqlalchemy.String),
    sqlalchemy.Column("full_name", sqlalchemy.String),
    sqlalchemy.Column("nationality", sqlalchemy.String),
    sqlalchemy.Column("id_type", sqlalchemy.String),
    sqlalchemy.Column("id_number", sqlalchemy.String),
    sqlalchemy.Column("phone", sqlalchemy.String),
    sqlalchemy.Column("emergency_contact_name", sqlalchemy.String),
    sqlalchemy.Column("emergency_contact_phone", sqlalchemy.String),
    sqlalchemy.Column("destination", sqlalchemy.String),
    sqlalchemy.Column("checkin_date", sqlalchemy.String),
    sqlalchemy.Column("checkout_date", sqlalchemy.String),
    sqlalchemy.Column("accommodation", sqlalchemy.String),
    sqlalchemy.Column("itinerary", sqlalchemy.JSON),
    sqlalchemy.Column("documents", sqlalchemy.JSON),
    sqlalchemy.Column("qr_code_data", sqlalchemy.String),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.text("now()")),
    sqlalchemy.Column("valid_until", sqlalchemy.DateTime),
)

# New Table for Real-time Locations and Status
tourist_locations = sqlalchemy.Table(
    "tourist_locations",
    metadata,
    sqlalchemy.Column("tourist_id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("lat", sqlalchemy.Float),
    sqlalchemy.Column("lng", sqlalchemy.Float),
    sqlalchemy.Column("status", sqlalchemy.String, default="safe"),
    sqlalchemy.Column("last_updated", sqlalchemy.DateTime, default=datetime.utcnow)
)

# Create database tables
engine = create_engine(DATABASE_URL)
metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting to the database...")
    await database.connect()
    print("Database connection established.")
    yield
    print("Disconnecting from the database...")
    await database.disconnect()
    print("Database connection closed.")

app = FastAPI(title="Tourist Safety System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "*"  # Remove this in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Password hashing
def hash_password(password: str) -> str:
    """Simple password hashing (in production, use bcrypt or similar)"""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

# Pydantic models
class TouristResponse(BaseModel):
    tourist_id: str
    qr_code_data: str
    message: str

class ItineraryDay(BaseModel):
    date: str
    location: str
    activities: str
    accommodation: str

class TouristCreate(BaseModel):
    fullName: str
    nationality: str
    id_type: str
    id_number: str
    phone: str
    emergency_contact_name: str
    emergency_contact_phone: str
    destination: str
    checkin_date: str
    checkout_date: str
    accommodation: str
    itinerary: Optional[List[ItineraryDay]] = None

class LocationUpdate(BaseModel):
    tourist_id: str
    lat: float
    lng: float
    
class AlertMessage(BaseModel):
    tourist_id: str
    message: str
    alert_type: str
    
class AdminLogin(BaseModel): 
    authorityId: str
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str
    redirect: str
    message: str

class QRAuthRequest(BaseModel):
    tourist_id: str
    auth_hash: str
    timestamp: str

# Phase 2.2 Models
class DestinationRequest(BaseModel):
    tourist_id: str
    location: str
    date: str
    activities: Optional[str] = "Exploring the area"

class SafetyScoreRequest(BaseModel):
    location: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class ItineraryUpdate(BaseModel):
    tourist_id: str
    itinerary: List[ItineraryDay]

# Geofencing Models
class GeofenceZone(BaseModel):
    zone_id: str
    name: str
    center_lat: float
    center_lng: float
    radius_meters: int
    zone_type: str  # 'safe', 'warning', 'danger'
    description: str

class GeofenceCheck(BaseModel):
    tourist_id: str
    lat: float
    lng: float

# Utility Functions
def create_access_token(authority_id: str) -> str:
    """Create a simple access token (in production, use proper JWT)"""
    import hashlib
    import time
    token_data = f"{authority_id}{time.time()}"
    return hashlib.sha256(token_data.encode()).hexdigest()

def generate_blockchain_hash(data: Dict) -> str:
    import hashlib
    data_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(data_str.encode()).hexdigest()

def generate_unique_id() -> str:
    return f"TOURIST_{uuid.uuid4().hex[:8].upper()}"

def generate_qr_code_data(tourist_id: str, blockchain_hash: str) -> str:
    base_url = "http://localhost:3000/tourist-login"
    direct_url = f"{base_url}?tourist_id={tourist_id}&auth_hash={blockchain_hash}&timestamp={datetime.utcnow().isoformat()}"
    return direct_url

def create_qr_code_image(qr_data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def get_safety_category(score: int) -> str:
    """Convert numeric score to category"""
    if score >= 90:
        return "safe"
    elif score >= 70:
        return "warning"
    else:
        return "danger"

# Geofencing Utility Functions
def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points using Haversine formula (in meters)"""
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lng / 2) * math.sin(delta_lng / 2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance

def get_predefined_zones() -> List[dict]:
    """Get predefined safety zones"""
    return [
        # Delhi Safe Zones
        {
            "zone_id": "delhi_central",
            "name": "Central Delhi - Tourist Areas",
            "center_lat": 28.6139,
            "center_lng": 77.2090,
            "radius_meters": 2000,
            "zone_type": "safe",
            "description": "Main tourist areas including India Gate, Red Fort"
        },
        {
            "zone_id": "delhi_airport",
            "name": "Delhi Airport Area",
            "center_lat": 28.5562,
            "center_lng": 77.1000,
            "radius_meters": 1500,
            "zone_type": "safe",
            "description": "Airport and surrounding commercial areas"
        },
        
        # Mumbai Safe Zones
        {
            "zone_id": "mumbai_central",
            "name": "Mumbai Central Business District",
            "center_lat": 19.0760,
            "center_lng": 72.8777,
            "radius_meters": 2500,
            "zone_type": "safe",
            "description": "Main business and tourist areas"
        },
        
        # Goa Safe Zones
        {
            "zone_id": "goa_north_beaches",
            "name": "North Goa Beaches",
            "center_lat": 15.2993,
            "center_lng": 74.1240,
            "radius_meters": 3000,
            "zone_type": "safe",
            "description": "Popular beach areas with good infrastructure"
        },
        
        # Danger/Warning Zones
        {
            "zone_id": "delhi_danger_1",
            "name": "High Crime Area - East Delhi",
            "center_lat": 28.6500,
            "center_lng": 77.3000,
            "radius_meters": 1000,
            "zone_type": "danger",
            "description": "Area with higher crime rates, avoid especially at night"
        },
        {
            "zone_id": "mumbai_warning_1",
            "name": "Industrial Zone - Mumbai",
            "center_lat": 19.0500,
            "center_lng": 72.9000,
            "radius_meters": 800,
            "zone_type": "warning",
            "description": "Industrial area with heavy traffic and pollution"
        },
        
        # International Zones
        {
            "zone_id": "tokyo_safe_1",
            "name": "Tokyo Central Tourist Zone",
            "center_lat": 35.6762,
            "center_lng": 139.6503,
            "radius_meters": 2000,
            "zone_type": "safe",
            "description": "Central Tokyo tourist areas"
        }
    ]

def check_geofence_violations(lat: float, lng: float, zones: List[dict]) -> List[dict]:
    """Check if location violates any geofence zones"""
    violations = []
    
    for zone in zones:
        distance = calculate_distance(
            lat, lng, 
            zone["center_lat"], zone["center_lng"]
        )
        
        if distance <= zone["radius_meters"]:
            violations.append({
                "zone": zone,
                "distance_from_center": round(distance, 2),
                "violation_type": "inside_zone"
            })
    
    return violations

def get_safety_recommendations(violations: List[dict]) -> List[str]:
    """Generate safety recommendations based on zone violations"""
    recommendations = []
    
    danger_zones = [v for v in violations if v["zone"]["zone_type"] == "danger"]
    warning_zones = [v for v in violations if v["zone"]["zone_type"] == "warning"]
    
    if danger_zones:
        recommendations.extend([
            "⚠️ You are in a high-risk area. Consider leaving immediately.",
            "📞 Keep emergency contacts readily available.",
            "👥 Avoid traveling alone in this area.",
            "🚗 Use official transportation services only."
        ])
    elif warning_zones:
        recommendations.extend([
            "⚡ Exercise extra caution in this area.",
            "🌅 Avoid this area during late hours.",
            "💼 Keep valuables secure and out of sight.",
            "📱 Share your location with emergency contacts."
        ])
    else:
        recommendations.extend([
            "✅ You are in a safe area.",
            "📍 Continue following your planned itinerary.",
            "🛡️ Maintain general safety awareness."
        ])
    
    return recommendations

def get_coordinates_for_location(location_name: str) -> Tuple[float, float]:
    """Get coordinates for a location name"""
    location_coords = {
        'Delhi': (28.6139, 77.2090),
        'Mumbai': (19.0760, 72.8777),
        'Goa': (15.2993, 74.1240),
        'Rajasthan': (26.9124, 75.7873),
        'Kerala': (9.9312, 76.2673),
        'Kolkata': (22.5726, 88.3639),
        'Tokyo': (35.6762, 139.6503),
        'London': (51.5074, -0.1278),
        'Paris': (48.8566, 2.3522),
        'New York': (40.7128, -74.0060),
        'Bangkok': (13.7563, 100.5018),
        'baghi': (30.1204, 78.2706),
        'thdc-dam': (30.1464, 78.4322)
    }
    
    return location_coords.get(location_name.strip().title(), (28.6139, 77.2090))

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New police dashboard connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Police dashboard disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        disconnected_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                disconnected_connections.append(connection)
            except Exception as e:
                logger.error(f"Error broadcasting to WebSocket: {e}")
                disconnected_connections.append(connection)

        for connection in disconnected_connections:
            if connection in self.active_connections:
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Hardcoded admin credentials
ADMIN_CREDENTIALS = {
    "admin": {
        "password_hash": hash_password("1234"),
        "full_name": "System Administrator",
        "department": "Tourism Ministry"
    }
}

# API ENDPOINTS

@app.get("/")
async def root():
    return {"message": "Tourist Safety System API"}

@app.post("/login", response_model=AdminLoginResponse)
async def login_admin(credentials: AdminLogin):
    try:
        if credentials.authorityId not in ADMIN_CREDENTIALS:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        admin_user = ADMIN_CREDENTIALS[credentials.authorityId]
        
        if hash_password(credentials.password) != admin_user["password_hash"]:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = create_access_token(credentials.authorityId)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "redirect": "/dashboard",
            "message": "Login successful"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.post("/authenticate-qr/")
async def authenticate_qr(auth_data: QRAuthRequest):
    try:
        query = tourists.select().where(tourists.c.tourist_id == auth_data.tourist_id)
        tourist = await database.fetch_one(query)
        
        if not tourist:
            raise HTTPException(status_code=404, detail="Tourist not found")
        
        if tourist.blockchain_hash != auth_data.auth_hash:
            raise HTTPException(status_code=401, detail="Invalid authentication hash")
        
        try:
            qr_timestamp = datetime.fromisoformat(auth_data.timestamp.replace('Z', ''))
            if datetime.utcnow() - qr_timestamp > timedelta(days=30):
                raise HTTPException(status_code=401, detail="QR code expired")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid timestamp format")
        
        return {
            "tourist_id": tourist.tourist_id,
            "full_name": tourist.full_name,
            "nationality": tourist.nationality,
            "destination": tourist.destination,
            "checkin_date": tourist.checkin_date,
            "checkout_date": tourist.checkout_date,
            "accommodation": tourist.accommodation,
            "itinerary": tourist.itinerary,
            "emergency_contact_name": tourist.emergency_contact_name,
            "emergency_contact_phone": tourist.emergency_contact_phone,
            "valid_until": tourist.valid_until.isoformat() if tourist.valid_until else None,
            "qr_code_data": tourist.qr_code_data,
            "status": "authenticated",
            "created_at": tourist.created_at.isoformat() if tourist.created_at else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@app.post("/register-tourist/", response_model=TouristResponse)
async def register_tourist(
    background_tasks: BackgroundTasks,
    fullName: str = Form(...),
    nationality: str = Form(...),
    id_type: str = Form(...),
    id_number: str = Form(...),
    phone: str = Form(...),
    emergency_contact_name: str = Form(...),
    emergency_contact_phone: str = Form(...),
    destination: str = Form(...),
    checkin_date: str = Form(...),
    checkout_date: str = Form(...),
    accommodation: str = Form(...),
    documents: List[UploadFile] = File([])
):
    try:
        itinerary_data = []
        
        try:
            checkin = datetime.strptime(checkin_date, "%Y-%m-%d")
            checkout = datetime.strptime(checkout_date, "%Y-%m-%d")
            
            current_date = checkin
            while current_date <= checkout:
                itinerary_data.append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "location": destination,
                    "activities": "Exploring the area",
                    "accommodation": accommodation
                })
                current_date += timedelta(days=1)
        except ValueError:
            itinerary_data = [{
                "date": checkin_date,
                "location": destination,
                "activities": "Exploring the area",
                "accommodation": accommodation
            }]

        tourist_id = generate_unique_id()

        blockchain_data = {
            "tourist_id": tourist_id,
            "full_name": fullName,
            "id_type": id_type,
            "id_number": id_number,
            "timestamp": datetime.utcnow().isoformat()
        }

        blockchain_hash = generate_blockchain_hash(blockchain_data)

        documents_data = []
        for document in documents:
            document_content = await document.read()
            documents_data.append({
                "filename": document.filename,
                "content_type": document.content_type,
                "size": len(document_content),
                "content": base64.b64encode(document_content).decode('utf-8')
            })

        qr_data = generate_qr_code_data(tourist_id, blockchain_hash)
        qr_code_image = create_qr_code_image(qr_data)

        valid_until = datetime.utcnow() + timedelta(days=30)

        query = tourists.insert().values(
            tourist_id=tourist_id,
            blockchain_hash=blockchain_hash,
            full_name=fullName,
            nationality=nationality,
            id_type=id_type,
            id_number=id_number,
            phone=phone,
            emergency_contact_name=emergency_contact_name,
            emergency_contact_phone=emergency_contact_phone,
            destination=destination,
            checkin_date=checkin_date,
            checkout_date=checkout_date,
            accommodation=accommodation,
            itinerary=itinerary_data,
            documents=documents_data,
            qr_code_data=qr_code_image,
            valid_until=valid_until
        )

        await database.execute(query)

        return {
            "tourist_id": tourist_id,
            "qr_code_data": qr_code_image,
            "message": "Tourist registered successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.get("/tourist/{tourist_id}")
async def get_tourist(tourist_id: str):
    query = tourists.select().where(tourists.c.tourist_id == tourist_id)
    tourist = await database.fetch_one(query)

    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")

    return dict(tourist)

@app.get("/tourists/")
async def get_all_tourists():
    query = tourists.select()
    results = await database.fetch_all(query)
    return [dict(row) for row in results]

@app.websocket("/ws/police_dashboard")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        logger.info("Police dashboard WebSocket connected successfully")
        
        await websocket.send_text(json.dumps({
            "type": "connection_status",
            "status": "connected",
            "message": "Successfully connected to police dashboard",
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        while True:
            try:
                message = await websocket.receive_text()
                logger.info(f"Received WebSocket message: {message}")
                
                await websocket.send_text(json.dumps({
                    "type": "echo",
                    "message": f"Server received: {message}",
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
            except WebSocketDisconnect:
                logger.info("WebSocket client disconnected")
                break
            except Exception as e:
                logger.error(f"WebSocket error in message loop: {e}")
                break
                
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
    finally:
        try:
            manager.disconnect(websocket)
        except:
            pass

# GEOFENCING ENDPOINTS

@app.get("/geofence/zones/")
async def get_geofence_zones():
    """Get all predefined geofence zones"""
    try:
        zones = get_predefined_zones()
        return {
            "zones": zones,
            "total_zones": len(zones),
            "zone_types": {
                "safe": len([z for z in zones if z["zone_type"] == "safe"]),
                "warning": len([z for z in zones if z["zone_type"] == "warning"]),
                "danger": len([z for z in zones if z["zone_type"] == "danger"])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching zones: {str(e)}")

@app.post("/geofence/check/")
async def check_geofence(check_data: GeofenceCheck):
    """Check if tourist location violates any geofence zones"""
    try:
        zones = get_predefined_zones()
        violations = check_geofence_violations(
            check_data.lat, check_data.lng, zones
        )
        
        if not violations:
            status = "safe"
            alert_level = "none"
        else:
            danger_zones = [v for v in violations if v["zone"]["zone_type"] == "danger"]
            warning_zones = [v for v in violations if v["zone"]["zone_type"] == "warning"]
            
            if danger_zones:
                status = "danger"
                alert_level = "high"
            elif warning_zones:
                status = "warning"
                alert_level = "medium"
            else:
                status = "safe"
                alert_level = "low"
        
        # Update tourist status in database
        update_query = tourist_locations.update().where(
            tourist_locations.c.tourist_id == check_data.tourist_id
        ).values(status=status, last_updated=datetime.utcnow())
        
        await database.execute(update_query)
        
        # Send alert to police if dangerous
        if alert_level in ["high", "medium"]:
            alert_message = {
                "type": "geofence_alert",
                "tourist_id": check_data.tourist_id,
                "alert_level": alert_level,
                "status": status,
                "violations": violations,
                "location": {"lat": check_data.lat, "lng": check_data.lng},
                "timestamp": datetime.utcnow().isoformat(),
                "message": f"Tourist entered {status} zone: {violations[0]['zone']['name']}"
            }
            
            await manager.broadcast(json.dumps(alert_message))
        
        return {
            "tourist_id": check_data.tourist_id,
            "status": status,
            "alert_level": alert_level,
            "violations": violations,
            "safe_zones_nearby": [v for v in violations if v["zone"]["zone_type"] == "safe"],
            "recommendations": get_safety_recommendations(violations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geofence check failed: {str(e)}")

@app.post("/update-location/")
async def update_location(data: LocationUpdate):
    """Update location with automatic geofence checking"""
    try:
        # Perform geofence check
        geofence_check = GeofenceCheck(
            tourist_id=data.tourist_id,
            lat=data.lat,
            lng=data.lng
        )
        
        geofence_result = await check_geofence(geofence_check)
        status = geofence_result["status"]
        
        # Update location with geofence status
        on_conflict = sqlalchemy.dialects.postgresql.insert(tourist_locations).values(
            tourist_id=data.tourist_id,
            lat=data.lat,
            lng=data.lng,
            status=status,
            last_updated=datetime.utcnow()
        ).on_conflict_do_update(
            index_elements=['tourist_id'],
            set_=dict(
                lat=data.lat, 
                lng=data.lng, 
                status=status, 
                last_updated=datetime.utcnow()
            )
        )
        
        await database.execute(on_conflict)
        
        # Broadcast location update with geofence status
        update_message = {
            "type": "location_update",
            "tourist_id": data.tourist_id,
            "lat": data.lat,
            "lng": data.lng,
            "status": status,
            "geofence_violations": geofence_result.get("violations", []),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await manager.broadcast(json.dumps(update_message))
        
        return {
            "message": "Location updated successfully",
            "geofence_status": status,
            "violations": geofence_result.get("violations", []),
            "recommendations": geofence_result.get("recommendations", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location update failed: {str(e)}")

@app.post("/check-route-deviation/")
async def check_route_deviation(data: LocationUpdate):
    """Check if tourist is deviating from planned route"""
    try:
        query = tourists.select().where(tourists.c.tourist_id == data.tourist_id)
        tourist = await database.fetch_one(query)
        
        if not tourist:
            raise HTTPException(status_code=404, detail="Tourist not found")
        
        itinerary = tourist.itinerary or []
        if not itinerary:
            return {"message": "No itinerary to check against", "deviation": False}
        
        # Get today's planned location
        today = datetime.utcnow().date()
        today_plan = None
        
        for day in itinerary:
            try:
                day_date = datetime.strptime(day["date"], "%Y-%m-%d").date()
                if day_date == today:
                    today_plan = day
                    break
            except:
                continue
        
        if not today_plan:
            return {"message": "No plan for today", "deviation": False}
        
        planned_coords = get_coordinates_for_location(today_plan["location"])
        if not planned_coords:
            return {"message": "Cannot determine planned location coordinates", "deviation": False}
        
        # Calculate deviation distance
        deviation_distance = calculate_distance(
            data.lat, data.lng,
            planned_coords[0], planned_coords[1]
        )
        
        # Deviation threshold (5km)
        deviation_threshold = 5000  # meters
        is_deviating = deviation_distance > deviation_threshold
        
        if is_deviating:
            alert_message = {
                "type": "route_deviation",
                "tourist_id": data.tourist_id,
                "current_location": {"lat": data.lat, "lng": data.lng},
                "planned_location": {"lat": planned_coords[0], "lng": planned_coords[1]},
                "deviation_distance": round(deviation_distance, 2),
                "planned_destination": today_plan["location"],
                "timestamp": datetime.utcnow().isoformat(),
                "message": f"Tourist is {round(deviation_distance/1000, 1)}km away from planned destination: {today_plan['location']}"
            }
            
            await manager.broadcast(json.dumps(alert_message))
        
        return {
            "deviation": is_deviating,
            "deviation_distance": round(deviation_distance, 2),
            "planned_location": today_plan["location"],
            "threshold": deviation_threshold,
            "coordinates": {
                "current": {"lat": data.lat, "lng": data.lng},
                "planned": {"lat": planned_coords[0], "lng": planned_coords[1]}
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route deviation check failed: {str(e)}")

# SAFETY SCORING ENDPOINTS

@app.get("/safety-scores/{location}")
async def get_safety_score(location: str):
    """Get safety score for a specific location"""
    try:
        safety_data = {
            "Delhi": {"score": 75, "factors": ["Heavy traffic", "Air pollution", "Crowded areas"], "tips": ["Avoid isolated areas at night", "Use registered taxis"]},
            "Mumbai": {"score": 80, "factors": ["Monsoon flooding", "Dense population"], "tips": ["Be cautious during monsoon", "Keep valuables secure"]},
            "Baghi": {"score": 90, "factors": ["Tourist-friendly", "Good infrastructure"], "tips": ["Beach safety", "Licensed water sports only"]},
            "Rajasthan": {"score": 85, "factors": ["Desert climate", "Cultural sites"], "tips": ["Stay hydrated", "Respect local customs"]},
            "Kerala": {"score": 88, "factors": ["Natural disasters", "Monsoon season"], "tips": ["Check weather conditions", "Use reputable tour operators"]},
            "Thdc-Dam": {"score": 78, "factors": ["Traffic congestion", "Old infrastructure"], "tips": ["Use metro when possible", "Be aware of surroundings"]},
            "Tokyo": {"score": 95, "factors": ["Very safe", "Natural disasters possible"], "tips": ["Learn basic earthquake safety", "Respect local etiquette"]},
            "London": {"score": 92, "factors": ["Generally safe", "Weather changes"], "tips": ["Be aware in tourist areas", "Carry umbrella"]},
            "Paris": {"score": 88, "factors": ["Pickpocketing in tourist areas"], "tips": ["Secure belongings", "Avoid crowded metro during rush hour"]},
            "New York": {"score": 85, "factors": ["Busy traffic", "Varied neighborhoods"], "tips": ["Stay in well-lit areas", "Use official taxis"]},
            "Bangkok": {"score": 82, "factors": ["Traffic congestion", "Monsoon flooding"], "tips": ["Use BTS/MRT when possible", "Stay hydrated"]},
            "default": {"score": 90, "factors": ["Unknown area"], "tips": ["Research local conditions", "Stay vigilant"]}
        }
        
        location_key = location.strip().title()
        location_data = safety_data.get(location_key, safety_data["default"])
        
        return {
            "location": location,
            "safety_score": location_data["score"],
            "risk_factors": location_data["factors"],
            "safety_tips": location_data["tips"],
            "last_updated": datetime.utcnow().isoformat(),
            "category": get_safety_category(location_data["score"])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching safety score: {str(e)}")

@app.post("/add-destination/")
async def add_destination_to_itinerary(destination: DestinationRequest):
    """Add a new destination to tourist's itinerary"""
    try:
        query = tourists.select().where(tourists.c.tourist_id == destination.tourist_id)
        tourist = await database.fetch_one(query)
        
        if not tourist:
            raise HTTPException(status_code=404, detail="Tourist not found")
        
        current_itinerary = tourist.itinerary or []
        safety_response = await get_safety_score(destination.location)
        
        new_destination = {
            "date": destination.date,
            "location": destination.location,
            "activities": destination.activities,
            "accommodation": tourist.accommodation,
            "safety_score": safety_response["safety_score"],
            "safety_category": safety_response["category"],
            "added_by_user": True,
            "added_at": datetime.utcnow().isoformat()
        }
        
        current_itinerary.append(new_destination)
        current_itinerary.sort(key=lambda x: x["date"])
        
        update_query = tourists.update().where(
            tourists.c.tourist_id == destination.tourist_id
        ).values(itinerary=current_itinerary)
        
        await database.execute(update_query)
        
        return {
            "message": "Destination added successfully",
            "destination": new_destination,
            "total_destinations": len(current_itinerary),
            "safety_score": safety_response["safety_score"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding destination: {str(e)}")

@app.get("/route-optimization/{tourist_id}")
async def get_optimized_route(tourist_id: str):
    """Get route optimization suggestions based on safety scores"""
    try:
        query = tourists.select().where(tourists.c.tourist_id == tourist_id)
        tourist = await database.fetch_one(query)
        
        if not tourist:
            raise HTTPException(status_code=404, detail="Tourist not found")
        
        itinerary = tourist.itinerary or []
        
        if not itinerary:
            return {"message": "No itinerary found", "suggestions": []}
        
        suggestions = []
        
        for i, day in enumerate(itinerary):
            safety_score = day.get("safety_score", 80)
            
            if safety_score < 70:
                suggestions.append({
                    "day": i + 1,
                    "location": day.get("location"),
                    "current_score": safety_score,
                    "suggestion": "Consider alternative location or additional safety measures",
                    "type": "safety_warning"
                })
            elif safety_score < 85:
                suggestions.append({
                    "day": i + 1,
                    "location": day.get("location"),
                    "current_score": safety_score,
                    "suggestion": "Plan activities during daylight hours",
                    "type": "timing_suggestion"
                })
        
        total_locations = len(itinerary)
        avg_safety = sum(day.get("safety_score", 80) for day in itinerary) / total_locations if total_locations > 0 else 80
        
        return {
            "tourist_id": tourist_id,
            "total_destinations": total_locations,
            "average_safety_score": round(avg_safety, 1),
            "route_category": get_safety_category(avg_safety),
            "suggestions": suggestions,
            "optimized": len(suggestions) == 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error optimizing route: {str(e)}")

# ALERT ENDPOINTS

@app.post("/geofence-alert/")
async def geofence_alert(data: AlertMessage):
    update_query = tourist_locations.update().where(tourist_locations.c.tourist_id == data.tourist_id).values(status="warning")
    await database.execute(update_query)

    alert_message = {
        "type": "alert",
        "tourist_id": data.tourist_id,
        "message": data.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast(json.dumps(alert_message))
    return {"message": "Geo-fence alert received"}

@app.post("/sos-alert/")
async def sos_alert(data: AlertMessage):
    update_query = tourist_locations.update().where(tourist_locations.c.tourist_id == data.tourist_id).values(status="danger")
    await database.execute(update_query)

    alert_message = {
        "type": "alert",
        "tourist_id": data.tourist_id,
        "message": data.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast(json.dumps(alert_message))
    return {"message": "SOS alert received"}

# ANALYTICS ENDPOINTS

@app.get("/analytics/tourists-by-nationality")
async def get_tourists_by_nationality():
    try:
        query = sqlalchemy.select([
            tourists.c.nationality,
            func.count(tourists.c.id).label('count')
        ]).group_by(tourists.c.nationality)
        
        results = await database.fetch_all(query)
        return [{"nationality": row.nationality or "Unknown", "count": row.count} for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching nationality data: {str(e)}")

@app.get("/analytics/tourists-by-month")
async def get_tourists_by_month():
    try:
        query = sqlalchemy.select([
            extract('month', tourists.c.created_at).label('month'),
            func.count(tourists.c.id).label('count')
        ]).group_by('month').order_by('month')
        
        results = await database.fetch_all(query)
        
        month_names = {
            1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
            7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
        }
        
        monthly_data = []
        result_map = {row.month: row.count for row in results}
        for month_num in range(1, 13):
            monthly_data.append({
                "month": month_names.get(month_num, f"Month {month_num}"),
                "count": result_map.get(month_num, 0)
            })
        
        return monthly_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monthly data: {str(e)}")

@app.get("/analytics/destination-stats")
async def get_destination_stats():
    try:
        query = sqlalchemy.select([
            tourists.c.destination,
            func.count(tourists.c.id).label('count')
        ]).group_by(tourists.c.destination)
        
        results = await database.fetch_all(query)
        return [{"destination": row.destination or "Unknown", "count": row.count} for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching destination data: {str(e)}")

@app.get("/analytics/status-overview")
async def get_status_overview():
    try:
        subquery = sqlalchemy.select([
            tourists.c.tourist_id,
            func.coalesce(tourist_locations.c.status, 'unknown').label('status')
        ]).select_from(
            tourists.outerjoin(tourist_locations, tourists.c.tourist_id == tourist_locations.c.tourist_id)
        ).alias('status_subquery')
        
        query = sqlalchemy.select([
            subquery.c.status,
            func.count().label('count')
        ]).group_by(subquery.c.status)

        results = await database.fetch_all(query)

        all_statuses = ["safe", "warning", "danger", "unknown"]
        status_counts = {row.status: row.count for row in results}
        
        overview = [{"status": s, "count": status_counts.get(s, 0)} for s in all_statuses]
        
        return overview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching status overview: {str(e)}")

@app.get("/analytics/total-tourists")
async def get_total_tourists():
    try:
        query = sqlalchemy.select([func.count()]).select_from(tourists)
        count = await database.fetch_val(query)
        return {"total": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/recent-tourists")
async def get_recent_tourists(limit: int = 5):
    try:
        query = tourists.select().order_by(tourists.c.created_at.desc()).limit(limit)
        results = await database.fetch_all(query)
        return [dict(row) for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/daily-registrations")
async def get_daily_registrations(days: int = 30):
    try:
        query = sqlalchemy.select([
            func.date(tourists.c.created_at).label('date'),
            func.count(tourists.c.id).label('count')
        ]).where(
            tourists.c.created_at >= datetime.utcnow() - timedelta(days=days)
        ).group_by('date').order_by('date')
        
        results = await database.fetch_all(query)
        return [{"date": row.date.strftime('%Y-%m-%d'), "count": row.count} for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching daily registrations: {str(e)}")

@app.get("/analytics/alert-statistics")
async def get_alert_statistics():
    try:
        query = sqlalchemy.select([
            tourist_locations.c.status.label('alert_type'),
            func.count().label('count')
        ]).where(
            tourist_locations.c.status.in_(['warning', 'danger'])
        ).group_by('alert_type')
        
        results = await database.fetch_all(query)
        return [{"alert_type": row.alert_type, "count": row.count} for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/accommodation-stats")
async def get_accommodation_stats():
    try:
        query = sqlalchemy.select([
            tourists.c.accommodation,
            func.count(tourists.c.id).label('count')
        ]).group_by(tourists.c.accommodation).order_by(func.count(tourists.c.id).desc())
        
        results = await database.fetch_all(query)
        return [{"accommodation": row.accommodation or "Unknown", "count": row.count} for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/active-tourists")
async def get_active_tourists():
    try:
        now = datetime.utcnow()
        one_hour_ago = now - timedelta(hours=1)
        twenty_four_hours_ago = now - timedelta(hours=24)

        active_query = sqlalchemy.select([func.count()]).select_from(tourist_locations).where(
            tourist_locations.c.last_updated >= one_hour_ago
        )
        recent_query = sqlalchemy.select([func.count()]).select_from(tourist_locations).where(
            tourist_locations.c.last_updated >= twenty_four_hours_ago
        )
        
        active_count = await database.fetch_val(active_query)
        recently_active_count = await database.fetch_val(recent_query)
        
        return {"active_tourists": active_count, "recently_active": recently_active_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/police/locations/")
async def get_all_current_tourist_locations():
    try:
        # First get tourists with location data
        query = sqlalchemy.select([
            tourists.c.tourist_id,
            tourists.c.full_name,
            tourist_locations.c.lat,
            tourist_locations.c.lng,
            tourist_locations.c.status
        ]).select_from(
            tourists.join(tourist_locations, tourists.c.tourist_id == tourist_locations.c.tourist_id, isouter=True)
        )

        results = await database.fetch_all(query)
        
        # Filter out results with invalid coordinates and add mock coordinates if needed
        processed_results = []
        mock_coordinates = [
            (28.6139, 77.2090),  # Delhi
            (19.0760, 72.8777),  # Mumbai  
            (15.2993, 74.1240),  # Goa
            (30.1204, 78.2706),  # Baghi
            (30.1464, 78.4322),  # THDC Dam
        ]
        
        for i, row in enumerate(results):
            row_dict = dict(row)
            
            # If no coordinates exist, add mock coordinates
            if not row_dict.get('lat') or not row_dict.get('lng'):
                coord_index = i % len(mock_coordinates)
                row_dict['lat'] = mock_coordinates[coord_index][0] + (i * 0.001)  # Small offset
                row_dict['lng'] = mock_coordinates[coord_index][1] + (i * 0.001)
                row_dict['status'] = 'safe'  # Default status
                
            processed_results.append(row_dict)
        
        return processed_results
    except Exception as e:
        logger.error(f"Error fetching police locations: {e}")
        # Return mock data if database fails
        return [
            {
                "tourist_id": "MOCK_TOURIST_001",
                "full_name": "Demo Tourist 1",
                "lat": 28.6139,
                "lng": 77.2090,
                "status": "safe"
            },
            {
                "tourist_id": "MOCK_TOURIST_002", 
                "full_name": "Demo Tourist 2",
                "lat": 19.0760,
                "lng": 72.8777,
                "status": "warning"
            }
        ]


if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
