import math


def simular_analisis_frecuencial_biomedico(horas_uso: float, dias_mantenimiento: int) -> dict:
    """Simulación CPU-bound: DFT sobre una señal sintética de vibración."""
    n = 1024
    desgaste = min(1.0, (horas_uso / 5000) + (dias_mantenimiento / 365))
    señal = [
        math.sin(2 * math.pi * 50 * t / n) + desgaste * math.sin(2 * math.pi * 120 * t / n)
        for t in range(n)
    ]

    magnitudes = []
    for k in range(0, 200):
        re = sum(señal[t] * math.cos(2 * math.pi * k * t / n) for t in range(n))
        im = -sum(señal[t] * math.sin(2 * math.pi * k * t / n) for t in range(n))
        magnitudes.append(math.sqrt(re * re + im * im))

    frecuencia_dominante = magnitudes.index(max(magnitudes))
    if desgaste < 0.3:
        estado = "Óptimo"
    elif desgaste < 0.7:
        estado = "Requiere mantenimiento preventivo"
    else:
        estado = "Crítico: mantenimiento urgente"

    return {
        "indice_desgaste": round(desgaste, 3),
        "frecuencia_dominante": frecuencia_dominante,
        "estado": estado,
    }