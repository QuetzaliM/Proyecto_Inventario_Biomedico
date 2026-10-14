import asyncio
import time
import httpx

BASE_URL = "http://127.0.0.1:8000/api/equipos"

async def solicitar_ping(client):
    inicio = time.time()
    res = await client.get(BASE_URL)
    duracion = round((time.time() - inicio) * 1000, 2)
    print(f"⚡ [PING INSTANTÁNEO] Status: {res.status_code} | Tiempo: {duracion} ms")

async def solicitar_analisis_heavy(client, equipo_id):
    print("⏳ [TAREA CPU-BOUND] Iniciando análisis frecuencial de sensores...")
    inicio = time.time()
    res = await client.get(f"{BASE_URL}/{equipo_id}/analisis-sensores")
    duracion = round(time.time() - inicio, 2)
    print(f"✅ [TAREA CPU-BOUND COMPLETADA] Status: {res.status_code} | Tiempo: {duracion} seg")

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Obtener un ID válido de la base de datos
        res = await client.get(BASE_URL)
        equipos = res.json()
        if not equipos:
            print("❌ Registra al menos un equipo en la base de datos antes de probar concurrencia.")
            return
        
        equipo_id = equipos[0]["_id"] if "_id" in equipos[0] else equipos[0]["id"]

        print("=== PRUEBA DE CONCURRENCIA ASÍNCRONA (NON-BLOCKING) ===\n")
        
        # Lanzar la tarea pesada y peticiones ligeras concurrentemente
        await asyncio.gather(
            solicitar_analisis_heavy(client, equipo_id),
            solicitar_ping(client),
            solicitar_ping(client),
            solicitar_ping(client)
        )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print("❌ Error de conexión:", e)