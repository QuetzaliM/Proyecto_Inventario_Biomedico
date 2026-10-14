# Sistema de Gestión de Inventario Biomédico y Mantenimiento

API REST con FastAPI y MongoDB Atlas para controlar el equipamiento hospitalario. Incluye un CRUD de equipos, consulta de áreas y mantenimientos, y un diagnóstico predictivo que corre en un hilo aparte (`asyncio.to_thread`) para no bloquear el servidor.

## Tecnologías

- Python 3.12 o superior
- FastAPI y Uvicorn
- MongoDB Atlas con PyMongo (`AsyncMongoClient`)
- Pydantic
- HTML, CSS y JavaScript (carpeta `app/static`)

## Estructura

```
PoyectoModular/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── utils.py
│   └── static/
│       ├── index.html
│       ├── app.js
│       └── styles.css
├── .env.example
├── .gitignore
├── probar_crud.py
├── probar_concurrencia.py
├── requirements.txt
└── README.md
```

## Instalación

1. Clona el repositorio y entra a la carpeta:

   ```powershell
   git clone <URL_DEL_REPOSITORIO>
   cd PoyectoModular
   ```

2. Crea y activa el entorno virtual:

   ```powershell
   python -m venv .venv
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
   .venv\Scripts\Activate.ps1
   ```

3. Instala las dependencias:

   ```powershell
   pip install -r requirements.txt
   ```

## Configuración

1. Copia el archivo de ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Edita `.env` con tus datos de MongoDB Atlas:

   ```env
   MONGODB_URL=mongodb+srv://USUARIO:CONTRASENA@TU_CLUSTER.mongodb.net/?appName=Cluster0
   DATABASE_NAME=ProyectoModular
   ```

   - No pongas comillas ni espacios alrededor del signo `=`.
   - No incluyas los símbolos `<` y `>` en la contraseña.
   - Si la contraseña tiene caracteres especiales (`@`, `#`, `/`, `:`), codifícalos en la URL. Por ejemplo, `@` se escribe como `%40`.

3. En MongoDB Atlas, crea un usuario con permisos de lectura y escritura en *Database Access* y agrega tu IP actual en *Network Access → IP Access List*.

## Ejecución

Desde la raíz del proyecto, con el entorno virtual activado, ejecuta:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

Al iniciar correctamente, debe aparecer `Conectado a MongoDB`.

- Interfaz web: http://127.0.0.1:8000/
- Documentación interactiva: http://127.0.0.1:8000/docs

## Endpoints

- `POST /api/equipos`: registrar un equipo.
- `GET /api/equipos`: listar hasta 100 equipos.
- `GET /api/equipos/{id}`: obtener un equipo por su ID.
- `PUT /api/equipos/{id}`: actualizar un equipo.
- `DELETE /api/equipos/{id}`: eliminar un equipo.
- `GET /api/equipos/{id}/analisis-sensores`: obtener el diagnóstico predictivo.
- `GET /api/areas`: listar las áreas hospitalarias.
- `GET /api/mantenimientos`: listar los mantenimientos.

Ejemplo del cuerpo para registrar un equipo:

```json
{
  "nombre": "Ventilador Mecánico Intensivo",
  "area_hospitalaria": "UCI Respiratoria",
  "horas_uso": 1450.0,
  "dias_desde_ultimo_mantenimiento": 40
}
```

## Diagnóstico predictivo

`app/utils.py` calcula un índice de desgaste usando las horas de uso y los días desde el último mantenimiento. Después ejecuta una transformada discreta de Fourier sobre una señal de vibración simulada y devuelve el estado del equipo: *Óptimo*, *Requiere mantenimiento preventivo* o *Crítico*. La tarea se ejecuta con `asyncio.to_thread` para no bloquear las demás peticiones.

## Pruebas

Con el servidor en marcha, abre otra terminal y ejecuta:

```powershell
python probar_crud.py
python probar_concurrencia.py
```

## Solución de problemas

- `No module named 'app'`: ejecuta Uvicorn desde la raíz del proyecto, no desde la carpeta `app`.
- `cannot import name ...`: revisa que el archivo correspondiente dentro de `app` tenga el código y esté guardado.
- Error de conexión a `localhost:27017`: comprueba que `.env` tenga la variable `MONGODB_URL` configurada correctamente.
- `bad auth : authentication failed`: verifica el usuario y la contraseña de MongoDB en `.env`.
- Timeout al conectar: comprueba que tu IP esté permitida en la lista de acceso de red de Atlas.
- `ERR_CONNECTION_REFUSED`: el servidor no inició; revisa el error mostrado en la terminal.

## Autor

Abril Quetzali Mora Valdez, Programacion IV, CUGDL