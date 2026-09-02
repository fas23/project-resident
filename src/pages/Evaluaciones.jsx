import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";

import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";

import { getClases } from "../services/clases";

import {
  getEvaluaciones,
  createEvaluacion,
  deleteEvaluacion,
} from "../services/evaluaciones";

const formularioInicial = {
  clase_id: "",
  nombre: "",
  fecha: "",
};

export default function Evaluaciones() {
  const navigate = useNavigate();

  const { role } = useAuth();

  const esAdmin = role === "admin";

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [clases, setClases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog crear

  const [openDialog, setOpenDialog] = useState(false);

  const [formulario, setFormulario] = useState(formularioInicial);

  // Dialog eliminar

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [evaluacionAEliminar, setEvaluacionAEliminar] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [evaluacionesData, clasesData] = await Promise.all([
        getEvaluaciones(),
        getClases(),
      ]);

      setEvaluaciones(evaluacionesData || []);
      setClases(clasesData || []);
    } catch (error) {
      console.error("Error cargando evaluaciones:", error);

      setError("No se pudieron cargar las evaluaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirCrear = () => {
    setFormulario(formularioInicial);
    setOpenDialog(true);
  };

  const cerrarDialog = () => {
    if (saving) {
      return;
    }

    setOpenDialog(false);
    setFormulario(formularioInicial);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarEvaluacion = async () => {
    if (!formulario.clase_id) {
      setError("Debes seleccionar una clase.");
      return;
    }

    if (!formulario.nombre.trim()) {
      setError("Debes ingresar el nombre de la evaluación.");
      return;
    }

    if (!formulario.fecha) {
      setError("Debes seleccionar una fecha.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createEvaluacion({
        clase_id: Number(formulario.clase_id),
        nombre: formulario.nombre.trim(),
        fecha: formulario.fecha,
      });

      setSuccess("Evaluación creada correctamente.");

      cerrarDialog();

      await cargarDatos();
    } catch (error) {
      console.error("Error creando evaluación:", error);

      setError(error.message || "No se pudo crear la evaluación.");
    } finally {
      setSaving(false);
    }
  };

  const abrirConfirmacionEliminar = (evaluacion) => {
    setEvaluacionAEliminar(evaluacion);
    setOpenDeleteDialog(true);
  };

  const cerrarConfirmacionEliminar = () => {
    if (deleting) {
      return;
    }

    setOpenDeleteDialog(false);
    setEvaluacionAEliminar(null);
  };

  const confirmarEliminar = async () => {
    if (!evaluacionAEliminar) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteEvaluacion(evaluacionAEliminar.id);

      setSuccess("Evaluación eliminada correctamente.");

      cerrarConfirmacionEliminar();

      await cargarDatos();
    } catch (error) {
      console.error("Error eliminando evaluación:", error);

      setError(error.message || "No se pudo eliminar la evaluación.");
    } finally {
      setDeleting(false);
    }
  };

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

  const obtenerClase = (evaluacion) => {
    if (evaluacion.clases) {
      return evaluacion.clases;
    }

    return clases.find((clase) => clase.id === evaluacion.clase_id);
  };

  const irACargarNotas = (evaluacion) => {
    navigate(`/evaluaciones/${evaluacion.id}/notas`);
  };

  return (
    <Box>
      {/* CABECERA */}

      <Box
        sx={{
          mb: 3,

          display: "flex",

          justifyContent: "space-between",

          alignItems: {
            xs: "stretch",
            sm: "center",
          },

          flexDirection: {
            xs: "column",
            sm: "row",
          },

          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "primary.dark",
            }}
          >
            Evaluaciones
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de evaluaciones y calificaciones
          </Typography>
        </Box>

        {hasPermission(role, "evaluaciones", "crear") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirCrear}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            Nueva evaluación
          </Button>
        )}
      </Box>

      {/* TABLA */}

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
            minWidth: esAdmin ? 800 : 650,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>

              <TableCell>Evaluación</TableCell>

              <TableCell>Clase</TableCell>

              <TableCell>Año</TableCell>

              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading && evaluaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography
                    color="text.secondary"
                    sx={{
                      py: 4,
                    }}
                  >
                    No hay evaluaciones registradas.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              evaluaciones.map((evaluacion) => {
                const clase = obtenerClase(evaluacion);

                return (
                  <TableRow key={evaluacion.id} hover>
                    <TableCell>{formatearFecha(evaluacion.fecha)}</TableCell>

                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 500,
                        }}
                      >
                        {evaluacion.nombre}
                      </Typography>
                    </TableCell>

                    <TableCell>{clase?.nombre_clase || "-"}</TableCell>

                    <TableCell>
                      {clase?.anio_residencia
                        ? `${clase.anio_residencia}° año`
                        : "-"}
                    </TableCell>

                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        {/* ================================
                    NOTAS
                ================================= */}

                        {hasPermission(role, "evaluaciones", "leer") && (
                          <Tooltip
                            title={esAdmin ? "Cargar notas" : "Ver notas"}
                          >
                            <IconButton
                              color="primary"
                              onClick={() => irACargarNotas(evaluacion)}
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* ================================
                    ELIMINAR
                ================================= */}

                        {hasPermission(role, "evaluaciones", "eliminar") && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              color="error"
                              onClick={() =>
                                abrirConfirmacionEliminar(evaluacion)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOG CREAR */}

      <Dialog open={openDialog} onClose={cerrarDialog} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Nueva evaluación
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              pt: 1,

              display: "flex",

              flexDirection: "column",

              gap: 2,
            }}
          >
            <TextField
              select
              label="Clase"
              name="clase_id"
              value={formulario.clase_id}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            >
              {clases.map((clase) => (
                <MenuItem key={clase.id} value={clase.id}>
                  {clase.nombre_clase} · {clase.anio_residencia}° año ·{" "}
                  {formatearFecha(clase.fecha)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nombre de la evaluación"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              fullWidth
              disabled={saving}
              placeholder="Ej. Parcial 1"
            />

            <TextField
              label="Fecha"
              name="fecha"
              type="date"
              value={formulario.fecha}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              disabled={saving}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button onClick={cerrarDialog} disabled={saving}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarEvaluacion}
            disabled={saving}
          >
            {saving ? (
              <>
                <CircularProgress
                  size={20}
                  color="inherit"
                  sx={{
                    mr: 1,
                  }}
                />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG ELIMINAR */}

      <Dialog
        open={openDeleteDialog}
        onClose={cerrarConfirmacionEliminar}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Confirmar eliminación
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar esta evaluación?
          </DialogContentText>

          {evaluacionAEliminar && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#FBE6C2",
                borderLeft: "4px solid",
                borderColor: "primary.main",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {evaluacionAEliminar.nombre}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {formatearFecha(evaluacionAEliminar.fecha)}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button onClick={cerrarConfirmacionEliminar} disabled={deleting}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmarEliminar}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <CircularProgress
                  size={20}
                  color="inherit"
                  sx={{
                    mr: 1,
                  }}
                />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MENSAJES */}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
