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

  // =========================================================
  // DIALOG CREAR / EDITAR
  // =========================================================

  const [openDialog, setOpenDialog] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);

  const [claseEditando, setClaseEditando] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);

  // =========================================================
  // DIALOG ELIMINAR
  // =========================================================

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [claseAEliminar, setClaseAEliminar] = useState(null);

  // =========================================================
  // CARGAR CLASES
  // =========================================================

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

  // =========================================================
  // CREAR CLASE
  // =========================================================

  const abrirCrear = () => {
    setFormulario(formularioInicial);

    setClaseEditando(null);

    setModoEdicion(false);

    setOpenDialog(true);
  };

  // =========================================================
  // EDITAR CLASE
  // =========================================================

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

  // =========================================================
  // CAMBIOS DEL FORMULARIO
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // GUARDAR CLASE
  // =========================================================

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

  // =========================================================
  // ELIMINAR CLASE
  // =========================================================

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

  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

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

  // =========================================================
  // FORMATEAR DÍA
  // =========================================================

  const formatearDia = (fecha) => {
    if (!fecha) {
      return "-";
    }

    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =========================================================
  // FECHA ACTUAL
  // =========================================================

  const hoy = new Date();

  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(hoy.getDate()).padStart(2, "0")}`;

  // =========================================================
  // CLASES VISIBLES
  // =========================================================
  //
  // ADMIN:
  // Ve todas las clases.
  //
  // RESIDENTE:
  // Ve solamente las clases de hoy y futuras.
  //
  // Las clases pasadas siguen existiendo en Supabase.
  // =========================================================

  const clasesVisibles = esAdmin
    ? clases
    : clases.filter((clase) => clase.fecha >= fechaHoy);

  // =========================================================
  // AGRUPAR CLASES POR FECHA
  // =========================================================

  const clasesPorFecha = clasesVisibles.reduce((acc, clase) => {
    const fecha = clase.fecha;

    if (!acc[fecha]) {
      acc[fecha] = {
        fecha,

        primerAnio: null,

        segundoAnio: null,

        tercerAnio: null,
      };
    }

    if (Number(clase.anio_residencia) === 1) {
      acc[fecha].primerAnio = clase;
    }

    if (Number(clase.anio_residencia) === 2) {
      acc[fecha].segundoAnio = clase;
    }

    if (Number(clase.anio_residencia) === 3) {
      acc[fecha].tercerAnio = clase;
    }

    return acc;
  }, {});

  // =========================================================
  // ORDENAR FILAS POR FECHA
  // =========================================================

  const filas = Object.values(clasesPorFecha).sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha),
  );

  // =========================================================
  // MOSTRAR CLASE DENTRO DE LA CELDA
  // =========================================================

  const renderizarClase = (clase) => {
    if (!clase) {
      return <Typography color="text.disabled">-</Typography>;
    }

    return (
      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          justifyContent: "space-between",

          gap: 1,

          minHeight: 40,
        }}
      >
        {/* NOMBRE DE LA CLASE */}

        <Typography
          sx={{
            fontWeight: 500,
          }}
        >
          {clase.nombre_clase}
        </Typography>

        {/* ACCIONES DEL ADMIN */}

        {esAdmin && (
          <Box
            sx={{
              display: "flex",

              flexShrink: 0,

              gap: 0.25,
            }}
          >
            {/* MODIFICAR */}

            {hasPermission(role, "clases", "modificar") && (
              <Tooltip title="Modificar">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => abrirEditar(clase)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* ELIMINAR */}

            {hasPermission(role, "clases", "eliminar") && (
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => abrirConfirmacionEliminar(clase)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>
      {/* =====================================================
          CABECERA
      ===================================================== */}

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

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Gestión de clases de residencia
          </Typography>
        </Box>

        {/* BOTÓN NUEVA CLASE */}

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

      {/* =====================================================
          TABLA
      ===================================================== */}

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
            minWidth: esAdmin ? 950 : 650,
          }}
        >
          {/* =================================================
              ENCABEZADO
          ================================================= */}

          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: esAdmin ? 180 : 150,

                  fontWeight: 700,
                }}
              >
                Fecha
              </TableCell>

              {esAdmin ? (
                <>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Clase
                  </TableCell>

                  <TableCell
                    sx={{
                      width: 180,

                      fontWeight: 700,
                    }}
                  >
                    Año de Residencia
                  </TableCell>

                  <TableCell
                    sx={{
                      width: 120,

                      fontWeight: 700,
                    }}
                  >
                    Acciones
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    1° Año
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    2° Año
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    3° Año
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>

          {/* =================================================
              CUERPO
          ================================================= */}

          <TableBody>
            {/* CARGANDO */}

            {loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
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

            {/* SIN CLASES */}

            {!loading && clasesVisibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
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

            {/* CLASES */}

            {!loading &&
              (esAdmin
                ? clasesVisibles
                    .slice()
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                    .map((clase) => (
                      <TableRow key={clase.id} hover>
                        {/* FECHA */}

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,

                              textTransform: "capitalize",
                            }}
                          >
                            {formatearDia(clase.fecha)}
                          </Typography>
                        </TableCell>

                        {/* CLASE */}

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 500,
                            }}
                          >
                            {clase.nombre_clase}
                          </Typography>
                        </TableCell>

                        {/* AÑO DE RESIDENCIA */}

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 500,
                            }}
                          >
                            {clase.anio_residencia}° año
                          </Typography>
                        </TableCell>

                        {/* ACCIONES */}

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",

                              alignItems: "center",

                              gap: 0.25,
                            }}
                          >
                            {/* MODIFICAR */}

                            {hasPermission(role, "clases", "modificar") && (
                              <Tooltip title="Modificar">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => abrirEditar(clase)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* ELIMINAR */}

                            {hasPermission(role, "clases", "eliminar") && (
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    abrirConfirmacionEliminar(clase)
                                  }
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                : filas.map((fila) => (
                    <TableRow key={fila.fecha} hover>
                      {/* FECHA */}

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,

                            textTransform: "capitalize",
                          }}
                        >
                          {formatearDia(fila.fecha)}
                        </Typography>
                      </TableCell>

                      {/* 1° AÑO */}

                      <TableCell>{renderizarClase(fila.primerAnio)}</TableCell>

                      {/* 2° AÑO */}

                      <TableCell>{renderizarClase(fila.segundoAnio)}</TableCell>

                      {/* 3° AÑO */}

                      <TableCell>{renderizarClase(fila.tercerAnio)}</TableCell>
                    </TableRow>
                  )))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* =====================================================
          DIALOG CREAR / EDITAR
      ===================================================== */}

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
            {/* FECHA */}

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

            {/* NOMBRE */}

            <TextField
              label="Nombre de la clase"
              name="nombre_clase"
              value={formulario.nombre_clase}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            />

            {/* AÑO DE RESIDENCIA */}

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

      {/* =====================================================
          DIALOG CONFIRMAR ELIMINACIÓN
      ===================================================== */}

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

      {/* =====================================================
          MENSAJE DE ERROR
      ===================================================== */}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      {/* =====================================================
          MENSAJE DE ÉXITO
      ===================================================== */}

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
