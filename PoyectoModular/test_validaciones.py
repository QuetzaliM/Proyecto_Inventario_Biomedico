from app.models import EquipoBiomedicoCreate
from pydantic import ValidationError

def probar_validaciones_pydantic():
    print("=== PRUEBA DE VALIDACIONES DE PYDANTIC ===\n")

    # Prueba 1: Datos válidos
    try:
        equipo_valido = EquipoBiomedicoCreate(
            nombre="Monitor Defibrilador",
            area_hospitalaria="Urgencias",
            horas_uso=320.5,
            dias_desde_ultimo_mantenimiento=10
        )
        print("✅ Validación exitosa para objeto correcto:", equipo_valido.nombre)
    except ValidationError as e:
        print("❌ Error inesperado:", e)

    # Prueba 2: Datos inválidos (horas negativas)
    try:
        equipo_invalido = EquipoBiomedicoCreate(
            nombre="Electrocardiógrafo",
            area_hospitalaria="Cardiología",
            horas_uso=-50.0,  # Inválido
            dias_desde_ultimo_mantenimiento=15
        )
        print("❌ Falló: Se esperaba una excepción de validación.")
    except ValidationError as e:
        print("\n✅ Pydantic capturó el error esperado (Horas uso < 0):")
        print(e.errors()[0]["msg"])

if __name__ == "__main__":
    probar_validaciones_pydantic()