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
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";

import {
  getSalas,
  createSala,
  updateSala,
  deleteSala,
  getSalaResidentes,
  createSalaResidente,
  updateSalaResidente,
  deleteSalaResidente,
} from "../services/salas";

const formularioSalaInicial = {
  nombre: "",
  tipo: "",
  observaciones: "",
};

const formularioResidenteInicial = {
  residente: "",
  anio_residencia: "",
  camas_desde: "",
  camas_hasta: "",
  observaciones: "",
};

export default function Salas() {
  const { role } = useAuth();

  const esAdmin = role === "admin";

  // =====================================================
  // SALAS
  // =====================================================

  const [salas, setSalas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // SALA SELECCIONADA
  // =====================================================

  const [salaSeleccionada, setSalaSeleccionada] = useState(null);

  const [salaResidentes, setSalaResidentes] = useState([]);

  const [loadingResidentes, setLoadingResidentes] = useState(false);

  // =====================================================
  // MENSAJES
  // =====================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // DIALOG SALA
  // =====================================================

  const [openSalaDialog, setOpenSalaDialog] = useState(false);

  const [modoEdicionSala, setModoEdicionSala] = useState(false);

  const [salaEditando, setSalaEditando] = useState(null);

  const [formularioSala, setFormularioSala] = useState(formularioSalaInicial);

  // =====================================================
  // DIALOG ELIMINAR SALA
  // =====================================================

  const [openDeleteSalaDialog, setOpenDeleteSalaDialog] = useState(false);

  const [salaAEliminar, setSalaAEliminar] = useState(null);

  // =====================================================
  // DIALOG RESIDENTE
  // =====================================================

  const [openResidenteDialog, setOpenResidenteDialog] = useState(false);

  const [modoEdicionResidente, setModoEdicionResidente] = useState(false);

  const [residenteEditando, setResidenteEditando] = useState(null);

  const [formularioResidente, setFormularioResidente] = useState(
    formularioResidenteInicial,
  );

  // =====================================================
  // DIALOG ELIMINAR RESIDENTE
  // =====================================================

  const [openDeleteResidenteDialog, setOpenDeleteResidenteDialog] =
    useState(false);

  const [residenteAEliminar, setResidenteAEliminar] = useState(null);

  // =====================================================
  // CARGAR SALAS
  // =====================================================

  const cargarSalas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSalas();

      setSalas(data || []);
    } catch (error) {
      console.error("Error cargando salas:", error);

      setError("No se pudieron cargar las salas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSalas();
  }, []);

  // =====================================================
  // ABRIR SALA
  // =====================================================

  const abrirSala = async (sala) => {
    try {
      setSalaSeleccionada(sala);

      setLoadingResidentes(true);

      setError("");

      const data = await getSalaResidentes(sala.id);

      setSalaResidentes(data || []);
    } catch (error) {
      console.error("Error cargando asignaciones:", error);

      setError("No se pudieron cargar las asignaciones.");
    } finally {
      setLoadingResidentes(false);
    }
  };

  const volverASalas = () => {
    setSalaSeleccionada(null);
    setSalaResidentes([]);
  };

  // =====================================================
  // CREAR SALA
  // =====================================================

  const abrirCrearSala = () => {
    setFormularioSala(formularioSalaInicial);

    setSalaEditando(null);

    setModoEdicionSala(false);

    setOpenSalaDialog(true);
  };

  // =====================================================
  // EDITAR SALA
  // =====================================================

  const abrirEditarSala = (sala) => {
    setFormularioSala({
      nombre: sala.nombre || "",
      tipo: sala.tipo || "",
      observaciones: sala.observaciones || "",
    });

    setSalaEditando(sala);

    setModoEdicionSala(true);

    setOpenSalaDialog(true);
  };

  const cerrarSalaDialog = () => {
    if (saving) {
      return;
    }

    setOpenSalaDialog(false);

    setFormularioSala(formularioSalaInicial);

    setSalaEditando(null);

    setModoEdicionSala(false);
  };

  // =====================================================
  // CAMBIOS FORMULARIO SALA
  // =====================================================

  const handleSalaChange = (event) => {
    const { name, value } = event.target;

    setFormularioSala((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // GUARDAR SALA
  // =====================================================

  const guardarSala = async () => {
    if (!formularioSala.nombre.trim()) {
      setError("Debes ingresar el nombre de la sala.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const datos = {
        nombre: formularioSala.nombre.trim(),
        tipo: formularioSala.tipo.trim(),
        observaciones: formularioSala.observaciones.trim(),
      };

      if (modoEdicionSala) {
        await updateSala(salaEditando.id, datos);

        setSuccess("Sala modificada correctamente.");
      } else {
        await createSala(datos);

        setSuccess("Sala creada correctamente.");
      }

      cerrarSalaDialog();

      await cargarSalas();
    } catch (error) {
      console.error("Error guardando sala:", error);

      setError(error.message || "No se pudo guardar la sala.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ELIMINAR SALA
  // =====================================================

  const abrirConfirmacionEliminarSala = (sala) => {
    setSalaAEliminar(sala);

    setOpenDeleteSalaDialog(true);
  };

  const cerrarConfirmacionEliminarSala = () => {
    if (deleting) {
      return;
    }

    setOpenDeleteSalaDialog(false);

    setSalaAEliminar(null);
  };

  const confirmarEliminarSala = async () => {
    if (!salaAEliminar) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteSala(salaAEliminar.id);

      setSuccess("Sala eliminada correctamente.");

      cerrarConfirmacionEliminarSala();

      await cargarSalas();
    } catch (error) {
      console.error("Error eliminando sala:", error);

      setError(error.message || "No se pudo eliminar la sala.");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // CREAR ASIGNACIÓN
  // =====================================================

  const abrirCrearResidente = () => {
    setFormularioResidente(formularioResidenteInicial);

    setResidenteEditando(null);

    setModoEdicionResidente(false);

    setOpenResidenteDialog(true);
  };

  // =====================================================
  // EDITAR ASIGNACIÓN
  // =====================================================

  const abrirEditarResidente = (residente) => {
    setFormularioResidente({
      residente: residente.residente || "",
      anio_residencia:
        residente.anio_residencia != null
          ? Number(residente.anio_residencia)
          : "",
      camas_desde:
        residente.camas_desde != null ? String(residente.camas_desde) : "",
      camas_hasta:
        residente.camas_hasta != null ? String(residente.camas_hasta) : "",
      observaciones: residente.observaciones || "",
    });

    setResidenteEditando(residente);

    setModoEdicionResidente(true);

    setOpenResidenteDialog(true);
  };

  const cerrarResidenteDialog = () => {
    if (saving) {
      return;
    }

    setOpenResidenteDialog(false);

    setFormularioResidente(formularioResidenteInicial);

    setResidenteEditando(null);

    setModoEdicionResidente(false);
  };

  // =====================================================
  // CAMBIOS FORMULARIO ASIGNACIÓN
  // =====================================================

  const handleResidenteChange = (event) => {
    const { name, value } = event.target;

    setFormularioResidente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // GUARDAR ASIGNACIÓN
  // =====================================================

  const guardarResidente = async () => {
    if (!formularioResidente.residente.trim()) {
      setError("Debes ingresar el residente.");
      return;
    }

    if (
      formularioResidente.anio_residencia === "" ||
      formularioResidente.anio_residencia == null
    ) {
      setError("Debes seleccionar el año de residencia.");
      return;
    }

    if (
      (formularioResidente.camas_desde === "") !==
      (formularioResidente.camas_hasta === "")
    ) {
      setError("Debes completar ambas camas del rango.");
      return;
    }

    if (
      formularioResidente.camas_desde !== "" &&
      Number(formularioResidente.camas_desde) <= 0
    ) {
      setError("La cama inicial debe ser mayor a 0.");
      return;
    }

    if (
      formularioResidente.camas_hasta !== "" &&
      Number(formularioResidente.camas_hasta) <
        Number(formularioResidente.camas_desde)
    ) {
      setError("El rango de camas no es válido.");
      return;
    }

    if (!salaSeleccionada) {
      setError("No hay una sala seleccionada.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const datos = {
        sala_id: salaSeleccionada.id,
        residente: formularioResidente.residente.trim(),
        anio_residencia:
          formularioResidente.anio_residencia === ""
            ? null
            : Number(formularioResidente.anio_residencia),
        camas_desde: formularioResidente.camas_desde,
        camas_hasta: formularioResidente.camas_hasta,
        observaciones: formularioResidente.observaciones.trim(),
      };

      if (modoEdicionResidente) {
        await updateSalaResidente(residenteEditando.id, datos);

        setSuccess("Asignación modificada correctamente.");
      } else {
        await createSalaResidente(datos);

        setSuccess("Residente asignado correctamente.");
      }

      cerrarResidenteDialog();

      const data = await getSalaResidentes(salaSeleccionada.id);

      setSalaResidentes(data || []);
    } catch (error) {
      console.error("Error guardando asignación:", error);

      setError(error.message || "No se pudo guardar la asignación.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ELIMINAR ASIGNACIÓN
  // =====================================================

  const abrirConfirmacionEliminarResidente = (residente) => {
    setResidenteAEliminar(residente);

    setOpenDeleteResidenteDialog(true);
  };

  const cerrarConfirmacionEliminarResidente = () => {
    if (deleting) {
      return;
    }

    setOpenDeleteResidenteDialog(false);

    setResidenteAEliminar(null);
  };

  const confirmarEliminarResidente = async () => {
    if (!residenteAEliminar) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteSalaResidente(residenteAEliminar.id);

      setSuccess("Asignación eliminada correctamente.");

      cerrarConfirmacionEliminarResidente();

      const data = await getSalaResidentes(salaSeleccionada.id);

      setSalaResidentes(data || []);
    } catch (error) {
      console.error("Error eliminando asignación:", error);

      setError(error.message || "No se pudo eliminar la asignación.");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // FORMATEAR CAMAS
  // =====================================================

  const formatearCamas = (residente) => {
    if (residente.camas_desde == null || residente.camas_hasta == null) {
      return "-";
    }

    return `${residente.camas_desde} - ${residente.camas_hasta}`;
  };

  // =====================================================
  // DETALLE DE SALA
  // =====================================================

  if (salaSeleccionada) {
    return (
      <Box>
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
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={volverASalas}
              sx={{ mb: 1 }}
            >
              Volver a salas
            </Button>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "primary.dark",
              }}
            >
              {salaSeleccionada.nombre}
            </Typography>

            {salaSeleccionada.tipo && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {salaSeleccionada.tipo}
              </Typography>
            )}
          </Box>

          {hasPermission(role, "salas", "crear") && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirCrearResidente}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              Asignar residente
            </Button>
          )}
        </Box>

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
              minWidth: esAdmin ? 750 : 600,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Camas</TableCell>
                <TableCell>Residente</TableCell>
                <TableCell>Año de residencia</TableCell>
                <TableCell>Observaciones</TableCell>

                {esAdmin && <TableCell align="right">Acciones</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingResidentes && (
                <TableRow>
                  <TableCell colSpan={esAdmin ? 5 : 4} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loadingResidentes && salaResidentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={esAdmin ? 5 : 4} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No hay residentes asignados a esta sala.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loadingResidentes &&
                salaResidentes.map((residente) => (
                  <TableRow key={residente.id} hover>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {formatearCamas(residente)}
                      </Typography>
                    </TableCell>

                    <TableCell>{residente.residente}</TableCell>

                    <TableCell>{residente.anio_residencia}° año</TableCell>

                    <TableCell>{residente.observaciones || "-"}</TableCell>

                    {esAdmin && (
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          {hasPermission(role, "salas", "modificar") && (
                            <Tooltip title="Modificar">
                              <IconButton
                                color="primary"
                                onClick={() => abrirEditarResidente(residente)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {hasPermission(role, "salas", "eliminar") && (
                            <Tooltip title="Eliminar">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  abrirConfirmacionEliminarResidente(residente)
                                }
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

        {/* DIALOG ASIGNACIÓN */}

        <Dialog
          open={openResidenteDialog}
          onClose={cerrarResidenteDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {modoEdicionResidente
              ? "Modificar asignación"
              : "Asignar residente"}
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
                label="Residente"
                name="residente"
                value={formularioResidente.residente}
                onChange={handleResidenteChange}
                fullWidth
                disabled={saving}
              />

              <TextField
                select
                label="Año de residencia"
                name="anio_residencia"
                value={formularioResidente.anio_residencia}
                onChange={handleResidenteChange}
                fullWidth
                disabled={saving}
              >
                <MenuItem value={1}>1° año</MenuItem>
                <MenuItem value={2}>2° año</MenuItem>
                <MenuItem value={3}>3° año</MenuItem>
              </TextField>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                }}
              >
                <TextField
                  label="Cama desde"
                  name="camas_desde"
                  type="number"
                  value={formularioResidente.camas_desde}
                  onChange={handleResidenteChange}
                  fullWidth
                  disabled={saving}
                  inputProps={{
                    min: 1,
                  }}
                />

                <TextField
                  label="Cama hasta"
                  name="camas_hasta"
                  type="number"
                  value={formularioResidente.camas_hasta}
                  onChange={handleResidenteChange}
                  fullWidth
                  disabled={saving}
                  inputProps={{
                    min: 1,
                  }}
                />
              </Box>

              <TextField
                label="Observaciones"
                name="observaciones"
                value={formularioResidente.observaciones}
                onChange={handleResidenteChange}
                fullWidth
                multiline
                minRows={2}
                disabled={saving}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={cerrarResidenteDialog} disabled={saving}>
              Cancelar
            </Button>

            <Button
              variant="contained"
              onClick={guardarResidente}
              disabled={saving}
            >
              {saving ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG ELIMINAR ASIGNACIÓN */}

        <Dialog
          open={openDeleteResidenteDialog}
          onClose={cerrarConfirmacionEliminarResidente}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Confirmar eliminación
          </DialogTitle>

          <DialogContent>
            <DialogContentText>
              ¿Seguro que deseas eliminar esta asignación?
            </DialogContentText>

            {residenteAEliminar && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#FBE6C2",
                  borderLeft: "4px solid",
                  borderColor: "primary.main",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {residenteAEliminar.residente}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Año de residencia: {residenteAEliminar.anio_residencia}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Camas: {formatearCamas(residenteAEliminar)}
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={cerrarConfirmacionEliminarResidente}
              disabled={deleting}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={confirmarEliminarResidente}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogActions>
        </Dialog>

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

  // =====================================================
  // LISTADO DE SALAS
  // =====================================================

  return (
    <Box>
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
            Salas
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de salas y residentes asignados
          </Typography>
        </Box>

        {hasPermission(role, "salas", "crear") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirCrearSala}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            Nueva sala
          </Button>
        )}
      </Box>

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
            minWidth: esAdmin ? 700 : 500,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Sala</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Observaciones</TableCell>

              {esAdmin && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={esAdmin ? 4 : 3} align="center">
                  <Box sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading && salas.length === 0 && (
              <TableRow>
                <TableCell colSpan={esAdmin ? 4 : 3} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No hay salas registradas.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              salas.map((sala) => (
                <TableRow
                  key={sala.id}
                  hover
                  sx={{
                    cursor: "pointer",
                  }}
                  onClick={() => abrirSala(sala)}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {sala.nombre}
                    </Typography>
                  </TableCell>

                  <TableCell>{sala.tipo || "-"}</TableCell>

                  <TableCell>{sala.observaciones || "-"}</TableCell>

                  {esAdmin && (
                    <TableCell
                      align="right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        {hasPermission(role, "salas", "modificar") && (
                          <Tooltip title="Modificar">
                            <IconButton
                              color="primary"
                              onClick={() => abrirEditarSala(sala)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission(role, "salas", "eliminar") && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              color="error"
                              onClick={() =>
                                abrirConfirmacionEliminarSala(sala)
                              }
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

      {/* DIALOG SALA */}

      <Dialog
        open={openSalaDialog}
        onClose={cerrarSalaDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {modoEdicionSala ? "Modificar sala" : "Nueva sala"}
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
              label="Nombre de la sala"
              name="nombre"
              value={formularioSala.nombre}
              onChange={handleSalaChange}
              fullWidth
              disabled={saving}
            />

            <TextField
              label="Tipo"
              name="tipo"
              value={formularioSala.tipo}
              onChange={handleSalaChange}
              fullWidth
              disabled={saving}
            />

            <TextField
              label="Observaciones"
              name="observaciones"
              value={formularioSala.observaciones}
              onChange={handleSalaChange}
              fullWidth
              multiline
              minRows={2}
              disabled={saving}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarSalaDialog} disabled={saving}>
            Cancelar
          </Button>

          <Button variant="contained" onClick={guardarSala} disabled={saving}>
            {saving ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG ELIMINAR SALA */}

      <Dialog
        open={openDeleteSalaDialog}
        onClose={cerrarConfirmacionEliminarSala}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirmar eliminación
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar esta sala?
          </DialogContentText>

          {salaAEliminar && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#FBE6C2",
                borderLeft: "4px solid",
                borderColor: "primary.main",
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {salaAEliminar.nombre}
              </Typography>

              {salaAEliminar.tipo && (
                <Typography variant="body2" color="text.secondary">
                  {salaAEliminar.tipo}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarConfirmacionEliminarSala} disabled={deleting}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmarEliminarSala}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
