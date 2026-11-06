import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";

import { useAuth } from "../contexts/AuthContext";

import { getEvaluaciones } from "../services/evaluaciones";

import {
  getNotasDeEvaluacion,
  guardarNota,
  eliminarNota,
} from "../services/notas";

const formularioInicial = {
  apellido: "",
  //nombre: "",
  year_of_residency: "",
  //nota: "",
};

export default function NotasEvaluacion() {
  const navigate = useNavigate();

  const { evaluacionId } = useParams();

  const { role } = useAuth();

  const esAdmin = role === "admin";

  const [evaluacion, setEvaluacion] = useState(null);

  const [notas, setNotas] = useState([]);

  const [formulario, setFormulario] = useState(formularioInicial);

  const [notaEditando, setNotaEditando] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  //add
  const [notasFormulario, setNotasFormulario] = useState([]);

  const [notasOriginales, setNotasOriginales] = useState([]);

  const [residenteEditando, setResidenteEditando] = useState(null);

  // ============================================================
  // CARGAR EVALUACIÓN Y NOTAS
  // ============================================================

  const cargarDatos = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) {
        setLoading(true);
      }

      setError("");

      const evaluaciones = await getEvaluaciones();

      const evaluacionEncontrada = evaluaciones.find(
        (item) => String(item.id) === String(evaluacionId),
      );

      if (!evaluacionEncontrada) {
        setError("No se encontró la evaluación.");
        return;
      }

      setEvaluacion(evaluacionEncontrada);

      const notasData = await getNotasDeEvaluacion(evaluacionId);

      setNotas(notasData || []);
    } catch (error) {
      console.error("Error cargando evaluación y notas:", error);

      setError(error.message || "No se pudieron cargar las notas.");
    } finally {
      if (mostrarLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [evaluacionId]);

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "-";
    }

    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ============================================================
  // CAMBIAR FORMULARIO
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // LIMPIAR FORMULARIO
  // ============================================================

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);

    setNotaEditando(null);

    setResidenteEditando(null);

    setNotasFormulario([]);

    setNotasOriginales([]);
  };

  const iniciarNuevaCarga = () => {
    setFormulario(formularioInicial);

    setNotasFormulario([
      {
        id: null,
        nota: "",
      },
    ]);

    setNotasOriginales([]);

    setNotaEditando(null);

    setResidenteEditando(null);
  };

  // ============================================================
  // GUARDAR NOTA
  // ============================================================

  const guardar = async () => {
    if (!formulario.apellido.trim()) {
      setError("Debes ingresar el apellido.");
      return;
    }

    if (!["1", "2", "3"].includes(String(formulario.year_of_residency))) {
      setError("Debes seleccionar el año de residencia.");
      return;
    }

    if (notasFormulario.length === 0) {
      setError("Debes ingresar al menos una nota.");
      return;
    }

    const notasNormalizadas = notasFormulario.map((item) => ({
      ...item,
      nota: Number(String(item.nota).replace(",", ".")),
    }));

    const notasInvalidas = notasNormalizadas.some(
      (item) =>
        item.nota === "" ||
        !Number.isFinite(item.nota) ||
        item.nota < 0 ||
        item.nota > 10,
    );

    if (notasInvalidas) {
      setError("Todas las notas deben ser números entre 0 y 10.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Eliminar las notas que fueron quitadas del formulario

      const idsActuales = notasFormulario
        .filter((item) => item.id)
        .map((item) => item.id);

      const idsOriginales = notasOriginales
        .filter((item) => item.id)
        .map((item) => item.id);

      const idsEliminar = idsOriginales.filter(
        (id) => !idsActuales.includes(id),
      );

      for (const id of idsEliminar) {
        await eliminarNota(id);
      }

      // Insertar o actualizar las notas

      for (const item of notasNormalizadas) {
        await guardarNota({
          ...(item.id ? { id: item.id } : {}),

          evaluacion_id: Number(evaluacionId),

          apellido: formulario.apellido.trim(),

          year_of_residency: Number(formulario.year_of_residency),

          nota: item.nota,
        });
      }

      setSuccess(
        residenteEditando
          ? "Notas del residente actualizadas correctamente."
          : "Notas cargadas correctamente.",
      );

      limpiarFormulario();

      const notasData = await getNotasDeEvaluacion(evaluacionId);

      setNotas(notasData || []);
    } catch (error) {
      console.error("Error guardando notas:", error);

      setError(error.message || "No se pudieron guardar las notas.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDITAR NOTA
  // ============================================================

  const editarNota = (grupo) => {
    setResidenteEditando(grupo);

    setNotaEditando(grupo);

    setFormulario({
      apellido: grupo.apellido,
      year_of_residency: String(grupo.year_of_residency),
    });

    const notasArray = grupo.notas.map((nota) => ({
      id: nota.id,
      nota: String(nota.nota),
    }));

    setNotasFormulario(notasArray);

    setNotasOriginales(notasArray);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // AGREGAR, QUITAR Y MODIFICAR NOTAS
  // ============================================================
  const agregarNota = () => {
    setNotasFormulario((prev) => [
      ...prev,
      {
        id: null,
        nota: "",
      },
    ]);
  };

  const quitarNota = (index) => {
    setNotasFormulario((prev) => prev.filter((_, i) => i !== index));
  };

  const cambiarNota = (index, value) => {
    setNotasFormulario((prev) =>
      prev.map((item, i) => (i === index ? { ...item, nota: value } : item)),
    );
  };

  // ============================================================
  // VOLVER
  // ============================================================

  const volver = () => {
    navigate("/evaluaciones");
  };

  // ============================================================
  // AGRUPAR NOTAS POR RESIDENTE
  // ============================================================
  const gruposResidentes = Object.values(
    notas.reduce((grupos, nota) => {
      const clave = `${nota.apellido.trim().toLowerCase()}-${nota.year_of_residency}`;

      if (!grupos[clave]) {
        grupos[clave] = {
          apellido: nota.apellido,
          year_of_residency: nota.year_of_residency,
          notas: [],
        };
      }

      grupos[clave].notas.push(nota);

      return grupos;
    }, {}),
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box>
      {/* ======================================================
          CABECERA
      ======================================================= */}

      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={volver}
          sx={{
            mb: 2,
          }}
        >
          Volver a evaluaciones
        </Button>

        {loading ? (
          <Box>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "primary.dark",
              }}
            >
              {evaluacion?.nombre || "Evaluación"}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {formatearFecha(evaluacion?.fecha)}
            </Typography>
          </>
        )}
      </Box>

      {/* ======================================================
          FORMULARIO ADMIN
      ======================================================= */}

      {esAdmin && !loading && (
        <Paper
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },

            mb: 3,

            borderRadius: 0,

            border: "1px solid",

            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            {residenteEditando
              ? "Modificar notas del residente"
              : "Cargar notas"}
            {/* {notaEditando ? "Modificar nota" : "Cargar nota"} */}
          </Typography>

          {residenteEditando && (
            <Button
              variant="outlined"
              onClick={iniciarNuevaCarga}
              sx={{ mb: 2 }}
            >
              Cargar otro residente
            </Button>
          )}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },

              gap: 2,
            }}
          >
            {/* APELLIDO */}
            <TextField
              label="Residente"
              name="apellido"
              value={formulario.apellido}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            />

            {/* AÑO */}

            <TextField
              select
              label="Año de residencia"
              name="year_of_residency"
              value={formulario.year_of_residency}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            >
              <MenuItem value={1}>1° año</MenuItem>

              <MenuItem value={2}>2° año</MenuItem>

              <MenuItem value={3}>3° año</MenuItem>
            </TextField>

            {/* ARRAY DE NOTAS */}

            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Calificaciones
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {notasFormulario.map((item, index) => (
                  <Box
                    key={item.id ?? `nueva-${index}`}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      label={`Nota ${index + 1}`}
                      value={item.nota}
                      onChange={(event) => {
                        const value = event.target.value
                          .replace(",", ".")
                          .replace(/[^0-9.]/g, "");

                        cambiarNota(index, value);
                      }}
                      fullWidth
                      disabled={saving}
                      placeholder="0 - 10"
                      inputProps={{
                        inputMode: "decimal",
                      }}
                    />

                    <Button
                      color="error"
                      onClick={() => quitarNota(index)}
                      disabled={saving || notasFormulario.length === 1}
                    >
                      Quitar
                    </Button>
                  </Box>
                ))}
              </Box>

              <Button
                variant="outlined"
                onClick={agregarNota}
                disabled={saving}
                sx={{ mt: 2 }}
              >
                + Agregar otra nota
              </Button>
            </Box>
          </Box>

          {/* BOTONES */}

          <Box
            sx={{
              mt: 2,

              display: "flex",

              justifyContent: {
                xs: "stretch",
                sm: "flex-end",
              },

              gap: 1,

              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >
            {notaEditando && (
              <Button
                variant="outlined"
                onClick={limpiarFormulario}
                disabled={saving}
              >
                Cancelar
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              onClick={guardar}
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : residenteEditando
                  ? "Actualizar notas"
                  : "Guardar notas"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* ======================================================
          TABLA DE NOTAS
      ======================================================= */}

      {!loading && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 0,

            border: "1px solid",

            borderColor: "divider",

            overflowX: "auto",
          }}
        >
          <Table
            sx={{
              minWidth: esAdmin ? 650 : 550,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Residente
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Año
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Nota
                </TableCell>

                {esAdmin && (
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Acción
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {gruposResidentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      Todavía no hay notas cargadas para esta evaluación.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {gruposResidentes.map((grupo) => {
                const promedio =
                  grupo.notas.reduce(
                    (total, item) => total + Number(item.nota),
                    0,
                  ) / grupo.notas.length;

                return (
                  <TableRow
                    key={`${grupo.apellido}-${grupo.year_of_residency}`}
                    hover
                  >
                    <TableCell>{grupo.apellido}</TableCell>

                    <TableCell>{grupo.year_of_residency}° año</TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {grupo.notas.map((item) => (
                          <Typography
                            key={item.id}
                            component="span"
                            sx={{
                              bgcolor: "action.hover",
                              borderRadius: 1,
                              px: 1,
                              py: 0.5,
                              fontWeight: 600,
                            }}
                          >
                            {Number(item.nota).toFixed(2)}
                          </Typography>
                        ))}
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Promedio: {promedio.toFixed(2)}
                      </Typography>
                    </TableCell>

                    {esAdmin && (
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => editarNota(grupo)}
                        >
                          Editar notas
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
            {/* EDITAR */}
          </Table>
        </TableContainer>
      )}

      {/* ======================================================
          MENSAJE ERROR
      ======================================================= */}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      {/* ======================================================
          MENSAJE ÉXITO
      ======================================================= */}

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
