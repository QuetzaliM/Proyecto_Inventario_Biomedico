// ============================================
// INVENTARIO BIOMÉDICO & MANTENIMIENTO PREDICTIVO
// Funciones para interactuar con FastAPI & MongoDB Atlas
// ============================================

const formulario = document.getElementById("formulario-equipo");
const listaEquipos = document.getElementById("lista-equipos");
const mensaje = document.getElementById("mensaje");
const botonActualizar = document.getElementById("btn-actualizar");
const botonReporte = document.getElementById("btn-reporte");
const resultadoReporte = document.getElementById("resultado-reporte");

let equipoEnEdicion = null;


// ============================================
// MOSTRAR MENSAJES DE ESTADO
// ============================================

function mostrarMensaje(texto, tipo = "exito") {
    mensaje.textContent = texto;
    mensaje.style.color = tipo === "error" ? "#c74747" : "#21865b";
}


// ============================================
// CONSULTAR Y MOSTRAR EQUIPOS BIOMÉDICOS
// ============================================

async function cargarEquipos() {
    listaEquipos.replaceChildren();

    const filaCarga = document.createElement("tr");
    const celdaCarga = document.createElement("td");

    celdaCarga.colSpan = 6;
    celdaCarga.textContent = "Cargando inventario de equipos biomédicos...";

    filaCarga.appendChild(celdaCarga);
    listaEquipos.appendChild(filaCarga);

    try {
        const respuesta = await fetch("/api/equipos");

        if (!respuesta.ok) {
            throw new Error("No se pudo conectar con el servidor para consultar los equipos.");
        }

        const equipos = await respuesta.json();

        listaEquipos.replaceChildren();

        if (equipos.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 6;
            celda.textContent = "No hay equipos biomédicos registrados en la base de datos.";

            fila.appendChild(celda);
            listaEquipos.appendChild(fila);

            return;
        }

        equipos.forEach((equipo) => {
            const fila = document.createElement("tr");

            // Celdas del Modelo Biomédico
            agregarCelda(fila, equipo.nombre);
            agregarCelda(fila, equipo.area_hospitalaria);
            agregarCelda(fila, `${equipo.horas_uso} hrs`);
            agregarCelda(fila, `${equipo.dias_desde_ultimo_mantenimiento} días`);

            // Diagnóstico predictivo de estado basado en desgaste acumulado
            const celdaEstado = document.createElement("td");
            const etiquetaEstado = document.createElement("span");

            const indiceDesgaste = (equipo.horas_uso * 0.04) + (equipo.dias_desde_ultimo_mantenimiento * 0.8);
            const requiereMantenimiento = indiceDesgaste > 65.0;

            etiquetaEstado.textContent = requiereMantenimiento ? "Mantenimiento Requerido" : "Operativo";
            etiquetaEstado.classList.add("estado");

            if (requiereMantenimiento) {
                etiquetaEstado.classList.add("estado-mantenimiento");
                etiquetaEstado.style.backgroundColor = "#fee2e2";
                etiquetaEstado.style.color = "#991b1b";
                etiquetaEstado.style.padding = "4px 8px";
                etiquetaEstado.style.borderRadius = "4px";
            } else {
                etiquetaEstado.classList.add("estado-disponible");
                etiquetaEstado.style.backgroundColor = "#dcfce7";
                etiquetaEstado.style.color = "#166534";
                etiquetaEstado.style.padding = "4px 8px";
                etiquetaEstado.style.borderRadius = "4px";
            }

            celdaEstado.appendChild(etiquetaEstado);
            fila.appendChild(celdaEstado);

            // Botones de acciones
            const celdaAcciones = document.createElement("td");
            const contenedorAcciones = document.createElement("div");

            contenedorAcciones.classList.add("acciones");
            contenedorAcciones.style.display = "flex";
            contenedorAcciones.style.gap = "6px";

            // Botón de Análisis Frecuencial / Sensores (Concurrente CPU-bound)
            const botonAnalisis = document.createElement("button");
            botonAnalisis.type = "button";
            botonAnalisis.textContent = "Analizar Sensores";
            botonAnalisis.classList.add("btn-analisis");
            botonAnalisis.style.backgroundColor = "#d97706";
            botonAnalisis.style.color = "white";

            botonAnalisis.addEventListener("click", () => {
                ejecutarAnalisisSensores(equipo);
            });

            // Botón Editar
            const botonEditar = document.createElement("button");
            botonEditar.type = "button";
            botonEditar.textContent = "Editar";
            botonEditar.classList.add("btn-editar");

            botonEditar.addEventListener("click", () => {
                editarEquipo(equipo);
            });

            // Botón Eliminar
            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.textContent = "Eliminar";
            botonEliminar.classList.add("btn-eliminar");

            botonEliminar.addEventListener("click", () => {
                eliminarEquipo(equipo);
            });

            contenedorAcciones.appendChild(botonAnalisis);
            contenedorAcciones.appendChild(botonEditar);
            contenedorAcciones.appendChild(botonEliminar);

            celdaAcciones.appendChild(contenedorAcciones);
            fila.appendChild(celdaAcciones);

            listaEquipos.appendChild(fila);
        });

    } catch (error) {
        listaEquipos.replaceChildren();

        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 6;
        celda.textContent = error.message;

        fila.appendChild(celda);
        listaEquipos.appendChild(fila);
    }
}


// ============================================
// CREAR CELDAS DE LA TABLA
// ============================================

function agregarCelda(fila, contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido ?? "";
    fila.appendChild(celda);
}


// ============================================
// REGISTRAR O ACTUALIZAR EQUIPO
// ============================================

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = {
        nombre: formulario.nombre.value.trim(),
        area_hospitalaria: formulario.area_hospitalaria.value.trim(),
        horas_uso: parseFloat(formulario.horas_uso.value),
        dias_desde_ultimo_mantenimiento: parseInt(formulario.dias_desde_ultimo_mantenimiento.value)
    };

    const editando = equipoEnEdicion !== null;

    const url = editando
        ? `/api/equipos/${encodeURIComponent(equipoEnEdicion)}`
        : "/api/equipos";

    const metodo = editando ? "PUT" : "POST";

    const botonEnviar = formulario.querySelector(
        'button[type="submit"]'
    );

    botonEnviar.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            const detalle = resultado.detail;

            let textoError = "No se pudo guardar el equipo biomédico.";

            if (typeof detalle === "string") {
                textoError = detalle;
            } else if (Array.isArray(detalle)) {
                textoError = detalle
                    .map((error) => `${error.loc[error.loc.length - 1]}: ${error.msg}`)
                    .join(". ");
            }

            throw new Error(textoError);
        }

        mostrarMensaje(
            editando
                ? "¡Equipo biomédico actualizado correctamente!"
                : "¡Equipo biomédico registrado correctamente!"
        );

        formulario.reset();
        equipoEnEdicion = null;

        botonEnviar.textContent = "Registrar equipo";

        await cargarEquipos();

    } catch (error) {
        mostrarMensaje(error.message, "error");
    } finally {
        botonEnviar.disabled = false;
    }
});


// ============================================
// EDITAR EQUIPO
// ============================================

function editarEquipo(equipo) {
    equipoEnEdicion = equipo._id || equipo.id;

    formulario.nombre.value = equipo.nombre;
    formulario.area_hospitalaria.value = equipo.area_hospitalaria;
    formulario.horas_uso.value = equipo.horas_uso;
    formulario.dias_desde_ultimo_mantenimiento.value = equipo.dias_desde_ultimo_mantenimiento;

    const botonEnviar = formulario.querySelector(
        'button[type="submit"]'
    );

    botonEnviar.textContent = "Guardar cambios";

    mostrarMensaje(
        "Estás editando un equipo biomédico. Ajusta los parámetros y guarda los cambios.",
        "exito"
    );

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================
// ELIMINAR EQUIPO
// ============================================

async function eliminarEquipo(equipo) {
    const id = equipo._id || equipo.id;

    const confirmar = window.confirm(
        `¿Estás segura de que deseas dar de baja el equipo "${equipo.nombre}" del inventario?`
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            `/api/equipos/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        if (!respuesta.ok) {
            const resultado = await respuesta.json();

            throw new Error(
                resultado.detail || "No se pudo eliminar el equipo biomédico."
            );
        }

        mostrarMensaje("El equipo biomédico fue dado de baja correctamente.");

        if (equipoEnEdicion === id) {
            formulario.reset();
            equipoEnEdicion = null;

            formulario.querySelector(
                'button[type="submit"]'
            ).textContent = "Registrar equipo";
        }

        await cargarEquipos();

    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}


// ============================================
// DIAGNÓSTICO PREDICTIVO / TAREA CPU-BOUND
// ============================================

async function ejecutarAnalisisSensores(equipo) {
    const id = equipo._id || equipo.id;

    if (resultadoReporte) {
        resultadoReporte.style.display = "block";
        resultadoReporte.textContent = `Procesando análisis frecuencial y calibración de sensores para "${equipo.nombre}" en hilo secundario (to_thread)...`;
    }

    try {
        const respuesta = await fetch(`/api/equipos/${id}/analisis-sensores`);
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.detail || "No se pudo procesar el análisis de sensores.");
        }

        if (resultadoReporte) {
            const diag = resultado.diagnostico_predictivo;
            resultadoReporte.textContent =
                `DIAGNÓSTICO PREDICTIVO - ${resultado.nombre_equipo.toUpperCase()}\n` +
                `------------------------------------------------------------\n` +
                `Área Hospitalaria: ${resultado.area}\n` +
                `Horas analizadas: ${diag.horas_operacion_analizadas} hrs\n` +
                `Muestras procesadas: ${diag.muestras_procesadas.toLocaleString()} muestras\n` +
                `Índice de Desgaste del Sensor: ${diag.indice_desgaste_sensor_pct}%\n` +
                `Estado Predictivo: ${diag.estado_equipo}\n` +
                `Tiempo de ejecución en backend: ${diag.tiempo_procesamiento_segundos} seg`;
        }
    } catch (error) {
        if (resultadoReporte) {
            resultadoReporte.textContent = `Error en el análisis: ${error.message}`;
        }
    }
}


// ============================================
// REFRESCAR INVENTARIO
// ============================================

if (botonActualizar) {
    botonActualizar.addEventListener("click", () => {
        cargarEquipos();
    });
}


// ============================================
// GENERAR REPORTE RESUMEN DEL INVENTARIO
// ============================================

if (botonReporte) {
    botonReporte.addEventListener("click", async () => {
        botonReporte.disabled = true;
        botonReporte.textContent = "Generando resumen...";

        if (resultadoReporte) {
            resultadoReporte.style.display = "block";
            resultadoReporte.textContent = "Consultando base de datos MongoDB Atlas...";
        }

        try {
            const respuesta = await fetch("/api/equipos");
            const equipos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error("No se pudo obtener la información del inventario.");
            }

            const total = equipos.length;
            let requierenMantenimiento = 0;
            let operativos = 0;

            equipos.forEach(eq => {
                const desgaste = (eq.horas_uso * 0.04) + (eq.dias_desde_ultimo_mantenimiento * 0.8);
                if (desgaste > 65.0) {
                    requierenMantenimiento++;
                } else {
                    operativos++;
                }
            });

            if (resultadoReporte) {
                resultadoReporte.textContent =
                    "REPORTE GENERAL DEL INVENTARIO BIOMÉDICO\n" +
                    "------------------------------------------------------------\n" +
                    `Total de equipos registrados: ${total}\n` +
                    `Equipos en estado operativo: ${operativos}\n` +
                    `Equipos que requieren mantenimiento / calibración: ${requierenMantenimiento}`;
            }

        } catch (error) {
            if (resultadoReporte) {
                resultadoReporte.textContent = `Error al generar el reporte: ${error.message}`;
            }
        } finally {
            botonReporte.disabled = false;
            botonReporte.textContent = "Generar reporte";
        }
    });
}


// ============================================
// INICIAR APLICACIÓN
// ============================================

cargarEquipos();