from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="SmartAgro API")

# --------------------------------
# CORS – السماح للواجهة تتصل بالباك إند
# --------------------------------
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------
# نماذج الـ Login
# --------------------------------
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    name: str
    token: str


# ندعم مسارين: القديم /api/login والجديد /auth/login
@app.post("/auth/login", response_model=LoginResponse)
@app.post("/api/login", response_model=LoginResponse)
def login(request: LoginRequest):
    # المستخدم التجريبي
    if request.email == "test@smart.com" and request.password == "1234":
        return LoginResponse(
            success=True,
            name="Smart User",
            token="fake-token-123",
        )
    raise HTTPException(status_code=401, detail="Invalid email or password")


# --------------------------------
# PLANTS
# --------------------------------
class PlantBase(BaseModel):
    nickname: str
    species: str
    moisture: float
    temp: float
    light: float


class Plant(PlantBase):
    id: int
    status: str
    emoji: str
    last_watered: str


class PlantCreate(PlantBase):
    pass


plants_db: List[Plant] = [
    Plant(
        id=1,
        nickname="Mint on Balcony",
        species="Mentha spicata",
        moisture=65,
        temp=24.5,
        light=850,
        status="healthy",
        emoji="🌿",
        last_watered="2 hours ago",
    ),
    Plant(
        id=2,
        nickname="Basil Indoor",
        species="Ocimum basilicum",
        moisture=35,
        temp=25.8,
        light=650,
        status="warning",
        emoji="🌱",
        last_watered="1 day ago",
    ),
    Plant(
        id=3,
        nickname="Tomato Garden",
        species="Solanum lycopersicum",
        moisture=69,
        temp=23.5,
        light=920,
        status="healthy",
        emoji="🍅",
        last_watered="3 hours ago",
    ),
]


@app.get("/api/plants", response_model=List[Plant])
def get_plants():
    return plants_db


@app.post("/api/plants", response_model=Plant)
def add_plant(plant: PlantCreate):
    new_id = (max([p.id for p in plants_db]) + 1) if plants_db else 1

    # منطق بسيط للحالة
    if 40 <= plant.moisture <= 80:
        status = "healthy"
    else:
        status = "warning"

    new_plant = Plant(
        id=new_id,
        nickname=plant.nickname,
        species=plant.species,
        moisture=plant.moisture,
        temp=plant.temp,
        light=plant.light,
        status=status,
        emoji="🌿",
        last_watered="just now",
    )
    plants_db.append(new_plant)
    return new_plant


# --------------------------------
# ALERTS
# --------------------------------
class Alert(BaseModel):
    id: int
    plant_nickname: str
    message: str
    severity: str  # e.g. "warning", "critical"
    created_at: str


class AlertCreate(BaseModel):
    plant_nickname: str
    message: str
    severity: str = "warning"


alerts_db: List[Alert] = []


@app.get("/api/alerts", response_model=List[Alert])
def get_alerts():
    return alerts_db


@app.post("/api/alerts", response_model=Alert)
def add_alert(alert: AlertCreate):
    new_id = (max([a.id for a in alerts_db]) + 1) if alerts_db else 1
    created = Alert(
        id=new_id,
        plant_nickname=alert.plant_nickname,
        message=alert.message,
        severity=alert.severity,
        created_at=datetime.utcnow().isoformat() + "Z",
    )
    alerts_db.append(created)
    return created


# --------------------------------
# DEVICES
# --------------------------------
class DeviceBase(BaseModel):
    name: str
    location: str
    status: str = "online"  # online / offline
    battery: int
    moisture: Optional[float] = None
    temp: Optional[float] = None
    light: Optional[float] = None


class Device(DeviceBase):
    id: int
    last_seen: str


class DeviceCreate(DeviceBase):
    pass


devices_db: List[Device] = [
    Device(
        id=1,
        name="Balcony Sensor",
        location="Balcony",
        status="online",
        battery=92,
        moisture=65,
        temp=24.5,
        light=820,
        last_seen="just now",
    ),
    Device(
        id=2,
        name="Garden Sensor",
        location="Backyard",
        status="offline",
        battery=40,
        moisture=None,
        temp=None,
        light=None,
        last_seen="3 hours ago",
    ),
]


@app.get("/api/devices", response_model=List[Device])
def get_devices():
    return devices_db


@app.post("/api/devices", response_model=Device)
def add_device(device: DeviceCreate):
    new_id = (max([d.id for d in devices_db]) + 1) if devices_db else 1
    created = Device(
        id=new_id,
        name=device.name,
        location=device.location,
        status=device.status,
        battery=device.battery,
        moisture=device.moisture,
        temp=device.temp,
        light=device.light,
        last_seen=datetime.utcnow().isoformat() + "Z",
    )
    devices_db.append(created)
    return created


# --------------------------------
# Root
# --------------------------------
@app.get("/")
def root():
    return {"message": "SmartAgro API is running 🚀"}