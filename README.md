# Sistema de Gestión de Inventario Biomédico y Diagnóstico Predictivo

Sistema web integral desarrollado con **FastAPI**, **MongoDB Atlas** y **JavaScript Vanilla**, diseñado para el control de equipamiento médico hospitalario y la simulación de análisis frecuencial de sensores ejecutado de forma no bloqueante mediante `asyncio.to_thread()`.

## 🚀 Tecnologías Utilizadas
- **Backend**: Python 3.10+, FastAPI, Pydantic, Motor (Async MongoDB Driver).
- **Base de Datos**: MongoDB Atlas (Cloud NoSQL).
- **Frontend**: HTML5, CSS3, JavaScript Vanilla (Fetch API).
- **Servidor**: Uvicorn.

## 🛠️ Estructura de la Base de Datos (MongoDB Atlas)
- **Base de Datos**: `FastAPI_Biomedica`
- **Colecciones**:
  - `equipos`: Registro de dispositivos médicos.
  - `areas`: Registro de áreas hospitalarias.
  - `mantenimientos`: Historial de servicios técnicos.

## 📌 Endpoints de la API REST

| Operación | Método y Ruta | Respuestas HTTP |
| :--- | :--- | :--- |
| Registrar equipo | `POST /api/equipos` | 201 Created, 400 Bad Request |
| Listar equipos | `GET /api/equipos` | 200 OK |
| Obtener un equipo | `GET /api/equipos/{id}` | 200 OK, 400 Bad Request, 404 Not Found |
| Actualizar equipo | `PUT /api/equipos/{id}` | 200 OK, 400 Bad Request, 404 Not Found |
| Eliminar equipo | `DELETE /api/equipos/{id}` | 200 OK, 400 Bad Request, 404 Not Found |
| Listar áreas | `GET /api/areas` | 200 OK |
| Listar mantenimientos | `GET /api/mantenimientos` | 200 OK |
| Analizar sensores (Non-blocking) | `GET /api/equipos/{id}/analisis-sensores` | 200 OK, 400 Bad Request, 404 Not Found |

## ⚙️ Instrucciones de Instalación y Ejecución

1. **Clonar el repositorio e iniciar el entorno virtual**:
   ```cmd
   python -m venv .venv
   .venv\Scripts\activate
