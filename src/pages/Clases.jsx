import { useEffect, useState } from "react";

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
  Select,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";

import {
  getClases,
  createClase,
  updateClase,
  deleteClase,
} from "../services/clases";

const formularioInicial = {
  fecha: "",
  nombre_clase: "",
  anio_residencia: "",
};

export default function Clases() {
  const { role } = useAuth();

  const esAdmin = role === "admin";

  const [clases, setClases] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // Dialog crear / editar

  const [openDialog, setOpenDialog] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);

  const [claseEditando, setClaseEditando] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);

  // Dialog eliminar

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [claseAEliminar, setClaseAEliminar] = useState(null);

  const cargarClases = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClases();

      setClases(data || []);
    } catch (error) {
      console.error("Error cargando clases:", error);

      setError("No se pudieron cargar las clases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClases();
  }, []);

  const abrirCrear = () => {
    setFormulario(formularioInicial);

    setClaseEditando(null);
    setModoEdicion(false);

    setOpenDialog(true);
  };

  const abrirEditar = (clase) => {
    setFormulario({
      fecha: clase.fecha || "",
      nombre_clase: clase.nombre_clase || "",
      anio_residencia: clase.anio_residencia || "",
    });

    setClaseEditando(clase);
    setModoEdicion(true);

    setOpenDialog(true);
  };

  const cerrarDialog = () => {
    if (saving) {
      return;
    }

    setOpenDialog(false);

    setFormulario(formularioInicial);

    setClaseEditando(null);
    setModoEdicion(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarClase = async () => {
    if (!formulario.fecha) {
      setError("Debes seleccionar una fecha.");
      return;
    }

    if (!formulario.nombre_clase.trim()) {
      setError("Debes ingresar el nombre de la clase.");
      return;
    }

    if (!["1", "2", "3"].includes(String(formulario.anio_residencia))) {
      setError("Debes seleccionar el año de residencia.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const datos = {
        fecha: formulario.fecha,

        nombre_clase: formulario.nombre_clase.trim(),

        anio_residencia: Number(formulario.anio_residencia),
      };

      if (modoEdicion) {
        await updateClase(claseEditando.id, datos);

        setSuccess("Clase modificada correctamente.");
      } else {
        await createClase(datos);

        setSuccess("Clase creada correctamente.");
      }

      cerrarDialog();

      await cargarClases();
    } catch (error) {
      console.error("Error guardando clase:", error);

      setError(error.message || "No se pudo guardar la clase.");
    } finally {
      setSaving(false);
    }
  };

  const abrirConfirmacionEliminar = (clase) => {
    setClaseAEliminar(clase);
    setOpenDeleteDialog(true);
  };

  const cerrarConfirmacionEliminar = () => {
    if (deleting) {
      return;
    }

    setOpenDeleteDialog(false);
    setClaseAEliminar(null);
  };

  const confirmarEliminar = async () => {
    if (!claseAEliminar) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteClase(claseAEliminar.id);

      setSuccess("Clase eliminada correctamente.");

      cerrarConfirmacionEliminar();

      await cargarClases();
    } catch (error) {
      console.error("Error eliminando clase:", error);

      setError(error.message || "No se pudo eliminar la clase.");
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
            Clases
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de clases de residencia
          </Typography>
        </Box>

        {hasPermission(role, "clases", "crear") && (
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
            Nueva clase
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
            minWidth: esAdmin ? 750 : 550,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>

              <TableCell>Clase</TableCell>

              <TableCell>Año de residencia</TableCell>

              {/* SOLO ADMIN */}

              {esAdmin && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={esAdmin ? 4 : 3} align="center">
                  <Box
                    sx={{
                      py: 4,
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading && clases.length === 0 && (
              <TableRow>
                <TableCell colSpan={esAdmin ? 4 : 3} align="center">
                  <Typography
                    color="text.secondary"
                    sx={{
                      py: 4,
                    }}
                  >
                    No hay clases registradas.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              clases.map((clase) => (
                <TableRow key={clase.id} hover>
                  <TableCell>{formatearFecha(clase.fecha)}</TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {clase.nombre_clase}
                    </Typography>
                  </TableCell>

                  <TableCell>{clase.anio_residencia}° año</TableCell>

                  {/*

                      ESTA COLUMNA
                      NO EXISTE PARA
                      RESIDENT

                    */}

                  {esAdmin && (
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",

                          justifyContent: "flex-end",

                          gap: 0.5,
                        }}
                      >
                        {hasPermission(role, "clases", "modificar") && (
                          <Tooltip title="Modificar">
                            <IconButton
                              color="primary"
                              onClick={() => abrirEditar(clase)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission(role, "clases", "eliminar") && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              color="error"
                              onClick={() => abrirConfirmacionEliminar(clase)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOG CREAR / EDITAR */}

      <Dialog open={openDialog} onClose={cerrarDialog} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          {modoEdicion ? "Modificar clase" : "Nueva clase"}
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

            <TextField
              label="Nombre de la clase"
              name="nombre_clase"
              value={formulario.nombre_clase}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            />

            <TextField
              select
              label="Año de residencia"
              name="anio_residencia"
              value={formulario.anio_residencia}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            >
              <MenuItem value={1}>1° año</MenuItem>

              <MenuItem value={2}>2° año</MenuItem>

              <MenuItem value={3}>3° año</MenuItem>
            </TextField>
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

          <Button variant="contained" onClick={guardarClase} disabled={saving}>
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

      {/* DIALOG CONFIRMAR ELIMINACIÓN */}

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
            ¿Seguro que deseas eliminar esta clase?
          </DialogContentText>

          {claseAEliminar && (
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
                {claseAEliminar.nombre_clase}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {formatearFecha(claseAEliminar.fecha)} ·{" "}
                {claseAEliminar.anio_residencia}° año
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
