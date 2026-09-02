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

import { getNotasDeEvaluacion, guardarNota } from "../services/notas";

const formularioInicial = {
  apellido: "",
  nombre: "",
  year_of_residency: "",
  nota: "",
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

  // ============================================================
  // CARGAR EVALUACIÓN Y NOTAS
  // ============================================================

  const cargarDatos = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
  };

  // ============================================================
  // GUARDAR NOTA
  // ============================================================

  const guardar = async () => {
    if (!formulario.apellido.trim()) {
      setError("Debes ingresar el apellido.");
      return;
    }

    if (!formulario.nombre.trim()) {
      setError("Debes ingresar el nombre.");
      return;
    }

    if (!["1", "2", "3"].includes(String(formulario.year_of_residency))) {
      setError("Debes seleccionar el año de residencia.");
      return;
    }

    if (
      formulario.nota === "" ||
      formulario.nota === null ||
      formulario.nota === undefined
    ) {
      setError("Debes ingresar una nota.");
      return;
    }

    const notaNormalizada = String(formulario.nota).replace(",", ".");

    const notaNumerica = Number(notaNormalizada);

    if (Number.isNaN(notaNumerica)) {
      setError("La nota debe ser un número.");
      return;
    }

    if (notaNumerica < 0 || notaNumerica > 10) {
      setError("La nota debe estar entre 0 y 10.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await guardarNota({
        evaluacion_id: Number(evaluacionId),

        apellido: formulario.apellido.trim(),

        nombre: formulario.nombre.trim(),

        year_of_residency: Number(formulario.year_of_residency),

        nota: notaNumerica,
      });

      setNotas((prev) => {
        const existe = prev.some((item) => item.id === data.id);

        if (existe) {
          return prev.map((item) => (item.id === data.id ? data : item));
        }

        return [...prev, data];
      });

      setSuccess(
        notaEditando
          ? "Nota modificada correctamente."
          : "Nota cargada correctamente.",
      );

      limpiarFormulario();
    } catch (error) {
      console.error("Error guardando nota:", error);

      setError(error.message || "No se pudo guardar la nota.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDITAR NOTA
  // ============================================================

  const editarNota = (nota) => {
    setNotaEditando(nota);

    setFormulario({
      apellido: nota.apellido || "",

      nombre: nota.nombre || "",

      year_of_residency: nota.year_of_residency || "",

      nota: String(nota.nota ?? ""),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // VOLVER
  // ============================================================

  const volver = () => {
    navigate("/evaluaciones");
  };

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
              {evaluacion?.clases?.nombre_clase || "-"} ·{" "}
              {evaluacion?.clases?.anio_residencia
                ? `${evaluacion.clases.anio_residencia}° año`
                : "-"}{" "}
              · {formatearFecha(evaluacion?.fecha)}
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
            {notaEditando ? "Modificar nota" : "Cargar nota"}
          </Typography>

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr 1fr 1fr",
              },

              gap: 2,
            }}
          >
            {/* APELLIDO */}

            <TextField
              label="Apellido"
              name="apellido"
              value={formulario.apellido}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            />

            {/* NOMBRE */}

            <TextField
              label="Nombre"
              name="nombre"
              value={formulario.nombre}
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

            {/* NOTA */}

            <TextField
              label="Nota"
              name="nota"
              value={formulario.nota}
              onChange={(event) => {
                const value = event.target.value
                  .replace(",", ".")
                  .replace(/[^0-9.]/g, "");

                setFormulario((prev) => ({
                  ...prev,
                  nota: value,
                }));
              }}
              placeholder="0 - 10"
              fullWidth
              disabled={saving}
              inputProps={{
                inputMode: "decimal",
                min: 0,
                max: 10,
              }}
            />
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
                : notaEditando
                  ? "Modificar nota"
                  : "Guardar nota"}
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
                  Apellido
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Nombre
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
              {/* SIN NOTAS */}

              {notas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={esAdmin ? 5 : 4} align="center">
                    <Typography
                      color="text.secondary"
                      sx={{
                        py: 4,
                      }}
                    >
                      Todavía no hay notas cargadas para esta evaluación.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {/* NOTAS */}

              {notas.map((nota) => (
                <TableRow key={nota.id} hover>
                  <TableCell>{nota.apellido}</TableCell>

                  <TableCell>{nota.nombre}</TableCell>

                  <TableCell>{nota.year_of_residency}° año</TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "primary.dark",
                      }}
                    >
                      {Number(nota.nota).toFixed(2)}
                    </Typography>
                  </TableCell>

                  {/* EDITAR */}

                  {esAdmin && (
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => editarNota(nota)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
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
