import requests

BASE_URL = "http://127.0.0.1:8000/api/equipos"

def probar_crud_biomedico():
    print("=== INICIANDO PRUEBAS CRUD - INVENTARIO BIOMÉDICO ===\n")

    # 1. POST - Registrar un nuevo equipo biomédico
    nuevo_equipo = {
        "nombre": "Ventilador Mecánico Intensivo",
        "area_hospitalaria": "UCI Respiratoria",
        "horas_uso": 1450.0,
        "dias_desde_ultimo_mantenimiento": 40
    }
    res_post = requests.post(BASE_URL, json=nuevo_equipo)
    print(f"[POST] Status: {res_post.status_code}")
    equipo_creado = res_post.json()
    print("Equipo Creado:", equipo_creado)
    
    equipo_id = equipo_creado["id"] if "id" in equipo_creado else equipo_creado["_id"]

    # 2. GET - Listar todos los equipos biomédicos
    res_get = requests.get(BASE_URL)
    print(f"\n[GET ALL] Status: {res_get.status_code}")
    print(f"Total de equipos en inventario: {len(res_get.json())}")

    # 3. PUT - Actualizar horas de uso y mantenimiento
    actualizacion = {
        "horas_uso": 1500.5,
        "dias_desde_ultimo_mantenimiento": 0  # Se le realizó servicio
    }
    res_put = requests.put(f"{BASE_URL}/{equipo_id}", json=actualizacion)
    print(f"\n[PUT] Status: {res_put.status_code}")
    print("Equipo Actualizado:", res_put.json())

    # 4. DELETE - Eliminar el equipo de prueba
    res_delete = requests.delete(f"{BASE_URL}/{equipo_id}")
    print(f"\n[DELETE] Status: {res_delete.status_code}")
    print("Respuesta Eliminación:", res_delete.json())

if __name__ == "__main__":
    try:
        probar_crud_biomedico()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Asegúrate de que el servidor de FastAPI esté iniciado en http://127.0.0.1:8000")