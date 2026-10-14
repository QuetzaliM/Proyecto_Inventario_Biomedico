import asyncio
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from bson import ObjectId

from app.database import lifespan, get_database
from app.models import EquipoBiomedicoCreate, EquipoBiomedicoUpdate, EquipoBiomedicoResponse
from app.utils import simular_analisis_frecuencial_biomedico

app = FastAPI(
    title="Sistema de Gestión de Inventario Biomédico y Mantenimiento",
    description="API REST para el control de equipamiento hospitalario con diagnóstico predictivo y concurrencia no bloqueante.",
    version="1.0.0",
    lifespan=lifespan
)

# Servir archivos estáticos (HTML, CSS, JS) desde la carpeta app/static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/", include_in_schema=False)
async def read_root():
    return FileResponse("app/static/index.html")

# ---------------------------------------------------------
# ENDPOINTS CRUD (Colección 'equipos')
# ---------------------------------------------------------

@app.post("/api/equipos", response_model=EquipoBiomedicoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_equipo(equipo: EquipoBiomedicoCreate):
    db = get_database()
    doc = equipo.model_dump()
    result = await db.equipos.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc

@app.get("/api/equipos", response_model=List[EquipoBiomedicoResponse], status_code=status.HTTP_200_OK)
async def listar_equipos():
    db = get_database()
    equipos = await db.equipos.find().to_list(length=100)
    return equipos

@app.get("/api/equipos/{equipo_id}", response_model=EquipoBiomedicoResponse, status_code=status.HTTP_200_OK)
async def obtener_equipo(equipo_id: str):
    if not ObjectId.is_valid(equipo_id):
        raise HTTPException(status_code=400, detail="ID de equipo inválido.")
    db = get_database()
    equipo = await db.equipos.find_one({"_id": ObjectId(equipo_id)})
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado.")
    return equipo

@app.put("/api/equipos/{equipo_id}", response_model=EquipoBiomedicoResponse, status_code=status.HTTP_200_OK)
async def actualizar_equipo(equipo_id: str, equipo_update: EquipoBiomedicoUpdate):
    if not ObjectId.is_valid(equipo_id):
        raise HTTPException(status_code=400, detail="ID de equipo inválido.")
    datos = {k: v for k, v in equipo_update.model_dump().items() if v is not None}
    if not datos:
        raise HTTPException(status_code=400, detail="Sin datos para actualizar.")

    db = get_database()
    result = await db.equipos.find_one_and_update(
        {"_id": ObjectId(equipo_id)},
        {"$set": datos},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Equipo no encontrado.")
    return result

@app.delete("/api/equipos/{equipo_id}", status_code=status.HTTP_200_OK)
async def eliminar_equipo(equipo_id: str):
    if not ObjectId.is_valid(equipo_id):
        raise HTTPException(status_code=400, detail="ID de equipo inválido.")
    db = get_database()
    result = await db.equipos.delete_one({"_id": ObjectId(equipo_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipo no encontrado.")
    return {"mensaje": "Equipo dado de baja correctamente del inventario", "id": equipo_id}

# ---------------------------------------------------------
# ENDPOINTS MULTICOLECCIÓN (Áreas y Mantenimientos)
# ---------------------------------------------------------

@app.get("/api/areas", status_code=status.HTTP_200_OK)
async def listar_areas():
    db = get_database()
    areas = await db.areas.find({}, {"_id": 0}).to_list(length=100)
    return areas

@app.get("/api/mantenimientos", status_code=status.HTTP_200_OK)
async def listar_mantenimientos():
    db = get_database()
    mantenimientos = await db.mantenimientos.find({}, {"_id": 0}).to_list(length=100)
    return mantenimientos

# ---------------------------------------------------------
# ENDPOINT CPU-BOUND NON-BLOCKING (concurrencia con to_thread)
# ---------------------------------------------------------

@app.get("/api/equipos/{equipo_id}/analisis-sensores", status_code=status.HTTP_200_OK)
async def analizar_estado_sensores(equipo_id: str):
    if not ObjectId.is_valid(equipo_id):
        raise HTTPException(status_code=400, detail="ID de equipo inválido.")
    db = get_database()
    equipo = await db.equipos.find_one({"_id": ObjectId(equipo_id)})
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado.")

    resultado = await asyncio.to_thread(
        simular_analisis_frecuencial_biomedico, 
        equipo["horas_uso"], 
        equipo["dias_desde_ultimo_mantenimiento"]
    )
    
    return {
        "equipo_id": equipo_id,
        "nombre_equipo": equipo["nombre"],
        "area": equipo["area_hospitalaria"],
        "diagnostico_predictivo": resultado
    }