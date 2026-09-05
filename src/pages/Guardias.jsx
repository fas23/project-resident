import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";

import {
  Add,
  ChevronLeft,
  ChevronRight,
  Delete,
  Edit,
  Today,
} from "@mui/icons-material";

import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";

import {
  getGuardias,
  createGuardia,
  updateGuardia,
  deleteGuardia,
} from "../services/guardias";

// ======================================================
// CONSTANTES
// ======================================================

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formularioInicial = {
  residente: "",
};

const pad = (number) => String(number).padStart(2, "0");

const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// ======================================================
// COMPONENTE
// ======================================================

export default function Guardias() {
  const { role } = useAuth();

  const esAdmin = role === "admin";

  // ====================================================
  // ESTADOS
  // ====================================================

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(dateKey(today));

  const [guardias, setGuardias] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ====================================================
  // DIALOG CREAR / EDITAR
  // ====================================================

  const [openDialog, setOpenDialog] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);

  const [guardiaEditando, setGuardiaEditando] = useState(null);

  const [guardiaDate, setGuardiaDate] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);

  // ====================================================
  // DIALOG ELIMINAR
  // ====================================================

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [guardiaAEliminar, setGuardiaAEliminar] = useState(null);

  // ====================================================
  // CARGAR GUARDIAS
  // ====================================================

  const cargarGuardias = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getGuardias();

      setGuardias(data || []);
    } catch (error) {
      console.error("Error cargando guardias:", error);

      setError("No se pudieron cargar las guardias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGuardias();
  }, []);

  // ====================================================
  // CALENDARIO
  // ====================================================

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const startOffset = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result = [];

    // Días del mes anterior

    for (let i = startOffset - 1; i >= 0; i--) {
      result.push({
        date: new Date(year, month, -i),
        currentMonth: false,
      });
    }

    // Días del mes actual

    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    // Días del mes siguiente

    let nextDay = 1;

    while (result.length % 7 !== 0) {
      result.push({
        date: new Date(year, month + 1, nextDay),
        currentMonth: false,
      });

      nextDay++;
    }

    return result;
  }, [currentDate]);

  // ====================================================
  // GUARDIAS AGRUPADAS POR FECHA
  // ====================================================

  const guardiasPorFecha = useMemo(() => {
    return guardias.reduce((acc, guardia) => {
      const fecha = guardia.fecha;

      if (!acc[fecha]) {
        acc[fecha] = [];
      }

      acc[fecha].push(guardia);

      return acc;
    }, {});
  }, [guardias]);

  const selectedGuardias = guardiasPorFecha[selectedDate] || [];

  // ====================================================
  // NAVEGACIÓN
  // ====================================================

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    const now = new Date();

    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));

    setSelectedDate(dateKey(now));
  };

  // ====================================================
  // ABRIR CREAR
  // ====================================================

  const abrirCrear = (date) => {
    if (!hasPermission(role, "guardias", "crear")) {
      return;
    }

    const key = dateKey(date);

    setSelectedDate(key);

    setGuardiaDate(key);

    setFormulario(formularioInicial);

    setGuardiaEditando(null);

    setModoEdicion(false);

    setOpenDialog(true);
  };

  // ====================================================
  // ABRIR EDITAR
  // ====================================================

  const abrirEditar = (guardia) => {
    if (!hasPermission(role, "guardias", "modificar")) {
      return;
    }

    setFormulario({
      residente: guardia.residente || "",
    });

    setGuardiaEditando(guardia);

    setGuardiaDate(guardia.fecha);

    setModoEdicion(true);

    setOpenDialog(true);
  };

  // ====================================================
  // CERRAR DIALOG CREAR / EDITAR
  // ====================================================

  const cerrarDialog = () => {
    if (saving) {
      return;
    }

    setOpenDialog(false);

    setFormulario(formularioInicial);

    setGuardiaEditando(null);

    setGuardiaDate(null);

    setModoEdicion(false);
  };

  // ====================================================
  // CAMBIAR FORMULARIO
  // ====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // GUARDAR
  // ====================================================

  const guardarGuardia = async () => {
    if (!formulario.residente.trim()) {
      setError("Debes ingresar el nombre y apellido del residente.");

      return;
    }

    if (!guardiaDate) {
      setError("No se encontró la fecha de la guardia.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      const datos = {
        fecha: guardiaDate,
        residente: formulario.residente.trim(),
      };

      if (modoEdicion) {
        await updateGuardia(guardiaEditando.id, datos);

        setSuccess("Guardia modificada correctamente.");
      } else {
        await createGuardia(datos);

        setSuccess("Guardia asignada correctamente.");
      }

      cerrarDialog();

      await cargarGuardias();
    } catch (error) {
      console.error("Error guardando guardia:", error);

      setError(error.message || "No se pudo guardar la guardia.");
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // ABRIR CONFIRMACIÓN ELIMINAR
  // ====================================================

  const abrirConfirmacionEliminar = (guardia) => {
    if (!hasPermission(role, "guardias", "eliminar")) {
      return;
    }

    setGuardiaAEliminar(guardia);

    setOpenDeleteDialog(true);
  };

  // ====================================================
  // CERRAR CONFIRMACIÓN ELIMINAR
  // ====================================================

  const cerrarConfirmacionEliminar = () => {
    if (deleting) {
      return;
    }

    setOpenDeleteDialog(false);

    setGuardiaAEliminar(null);
  };

  // ====================================================
  // CONFIRMAR ELIMINACIÓN
  // ====================================================

  const confirmarEliminar = async () => {
    if (!guardiaAEliminar) {
      return;
    }

    try {
      setDeleting(true);

      setError("");

      await deleteGuardia(guardiaAEliminar.id);

      setSuccess("Guardia eliminada correctamente.");

      cerrarConfirmacionEliminar();

      await cargarGuardias();
    } catch (error) {
      console.error("Error eliminando guardia:", error);

      setError(error.message || "No se pudo eliminar la guardia.");
    } finally {
      setDeleting(false);
    }
  };

  // ====================================================
  // HELPERS
  // ====================================================

  const isToday = (date) => dateKey(date) === dateKey(today);

  const selectedDateObject = () => {
    const [year, month, day] = selectedDate.split("-");

    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const selectedDateLabel = () => {
    const date = selectedDateObject();

    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <Box>
      {/* ==================================================
          CABECERA
      ================================================== */}

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
            Guardias
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Asignación y organización de guardias de residentes
          </Typography>
        </Box>
      </Box>

      {/* ==================================================
          CALENDARIO + PANEL
      ================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) 360px",
          },
          gap: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {/* ==================================================
            CALENDARIO
        ================================================== */}

        <Card
          elevation={0}
          sx={{
            overflow: "hidden",
          }}
        >
          {/* HEADER CALENDARIO */}

          <Box
            sx={{
              px: {
                xs: 1.5,
                sm: 2,
              },
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: {
                  xs: "1rem",
                  sm: "1.2rem",
                },
              }}
            >
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Typography>

            <Stack direction="row" spacing={0.5}>
              <IconButton
                onClick={previousMonth}
                sx={{
                  color: "primary.main",
                }}
              >
                <ChevronLeft />
              </IconButton>

              <IconButton
                onClick={nextMonth}
                sx={{
                  color: "primary.main",
                }}
              >
                <ChevronRight />
              </IconButton>
            </Stack>
          </Box>

          {/* DÍAS */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {WEEK_DAYS.map((day) => (
              <Box
                key={day}
                sx={{
                  py: 1,
                  textAlign: "center",
                  fontWeight: 700,
                  color: "primary.main",
                  fontSize: {
                    xs: 10,
                    sm: 13,
                  },
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* GRILLA */}

          {loading ? (
            <Box
              sx={{
                py: 8,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              }}
            >
              {calendarDays.map(({ date, currentMonth }, index) => {
                const key = dateKey(date);

                const dayGuardias = guardiasPorFecha[key] || [];

                const selected = selectedDate === key;

                return (
                  <Box
                    key={index}
                    onClick={() => setSelectedDate(key)}
                    sx={{
                      minWidth: 0,
                      minHeight: {
                        xs: 105,
                        sm: 130,
                        md: 150,
                      },

                      height: "auto",

                      alignSelf: "stretch",
                      p: {
                        xs: 0.5,
                        sm: 1,
                      },

                      borderRight: index % 7 !== 6 ? "1px solid" : "none",

                      borderBottom: "1px solid",

                      borderColor: "divider",

                      bgcolor: selected
                        ? "rgba(118,196,87,0.14)"
                        : currentMonth
                          ? "background.paper"
                          : "#F7F6EF",

                      opacity: currentMonth ? 1 : 0.45,

                      cursor: "pointer",

                      "&:hover": {
                        bgcolor: "rgba(118,196,87,0.10)",
                      },
                    }}
                  >
                    {/* FECHA */}

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box
                        sx={{
                          width: {
                            xs: 25,
                            sm: 30,
                          },

                          height: {
                            xs: 25,
                            sm: 30,
                          },

                          borderRadius: "50%",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          bgcolor: isToday(date)
                            ? "primary.main"
                            : "transparent",

                          color: isToday(date) ? "#FFFFFF" : "text.primary",

                          fontWeight: 700,

                          fontSize: {
                            xs: 11,
                            sm: 13,
                          },
                        }}
                      >
                        {date.getDate()}
                      </Box>

                      {/* SOLO ADMIN */}

                      {esAdmin && hasPermission(role, "guardias", "crear") && (
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();

                            abrirCrear(date);
                          }}
                          sx={{
                            color: "primary.main",

                            width: {
                              xs: 25,
                              sm: 30,
                            },

                            height: {
                              xs: 25,
                              sm: 30,
                            },
                          }}
                        >
                          <Add
                            sx={{
                              fontSize: {
                                xs: 16,
                                sm: 20,
                              },
                            }}
                          />
                        </IconButton>
                      )}
                    </Stack>

                    {/* GUARDIAS */}

                    <Stack
                      spacing={0.5}
                      mt={0.5}
                      sx={{
                        overflow: "visible",
                      }}
                    >
                      {dayGuardias.map((guardia) => (
                        <Box
                          key={guardia.id}
                          sx={{
                            px: {
                              xs: 0.4,
                              sm: 0.7,
                            },

                            py: {
                              xs: 0.35,
                              sm: 0.5,
                            },

                            borderRadius: 1,

                            bgcolor: "secondary.light",

                            borderLeft: "3px solid",

                            borderColor: "secondary.dark",

                            overflow: "hidden",
                          }}
                        >
                          <Typography
                            noWrap
                            sx={{
                              fontWeight: 700,

                              fontSize: {
                                xs: 8,
                                sm: 11,
                              },

                              color: "text.primary",
                            }}
                          >
                            {guardia.residente}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          )}
        </Card>

        {/* ==================================================
            PANEL DERECHO
        ================================================== */}

        <Card
          elevation={0}
          sx={{
            alignSelf: "start",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 2.5,
              },
            }}
          >
            {/* HEADER */}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    textTransform: "capitalize",

                    fontWeight: 700,

                    fontSize: {
                      xs: "1rem",
                      sm: "1.15rem",
                    },
                  }}
                >
                  {selectedDateLabel()}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {selectedGuardias.length}{" "}
                  {selectedGuardias.length === 1
                    ? "residente asignado"
                    : "residentes asignados"}
                </Typography>
              </Box>

              {/* HOY */}

              <Button
                size="small"
                variant="outlined"
                startIcon={<Today />}
                onClick={goToToday}
                sx={{
                  color: "primary.main",
                  borderColor: "primary.main",

                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                }}
              >
                Hoy
              </Button>
            </Stack>

            {/* HOY MOBILE */}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Today />}
              onClick={goToToday}
              sx={{
                mb: 2,
                color: "primary.main",
                borderColor: "primary.main",

                display: {
                  xs: "flex",
                  sm: "none",
                },
              }}
            >
              Ir a hoy
            </Button>

            <Divider />

            {/* SIN GUARDIAS */}

            {selectedGuardias.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 5,
                }}
              >
                <Typography color="text.secondary">
                  No hay guardias asignadas para este día.
                </Typography>

                {esAdmin && hasPermission(role, "guardias", "crear") && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => abrirCrear(selectedDateObject())}
                    sx={{
                      mt: 2,
                    }}
                  >
                    Asignar guardia
                  </Button>
                )}
              </Box>
            ) : (
              <Stack spacing={1.5} mt={2}>
                {selectedGuardias.map((guardia) => (
                  <Box
                    key={guardia.id}
                    sx={{
                      p: 1.5,

                      borderRadius: 2,

                      bgcolor: "background.paper",

                      border: "1px solid",

                      borderColor: "divider",

                      borderLeft: "4px solid",

                      borderLeftColor: "primary.main",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {guardia.residente}
                        </Typography>

                        <Chip
                          label={formatearFecha(guardia.fecha)}
                          size="small"
                          sx={{
                            mt: 0.75,

                            bgcolor: "background.default",

                            color: "primary.main",

                            fontWeight: 700,
                          }}
                        />
                      </Box>

                      {/* ACCIONES ADMIN */}

                      {esAdmin && (
                        <Stack direction="row" spacing={0.5}>
                          {hasPermission(role, "guardias", "modificar") && (
                            <Tooltip title="Editar guardia">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => abrirEditar(guardia)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {hasPermission(role, "guardias", "eliminar") && (
                            <Tooltip title="Eliminar guardia">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  abrirConfirmacionEliminar(guardia)
                                }
                                disabled={deleting}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ==================================================
          DIALOG CREAR / EDITAR
      ================================================== */}

      <Dialog open={openDialog} onClose={cerrarDialog} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "primary.dark",
          }}
        >
          {modoEdicion ? "Modificar guardia" : "Asignar guardia"}
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
              autoFocus
              label="Residente"
              name="residente"
              value={formulario.residente}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              fullWidth
              disabled={saving}
              helperText="Ingresa nombre y apellido del residente."
            />

            {guardiaDate && (
              <Box
                sx={{
                  p: 1.5,

                  bgcolor: "background.default",

                  borderRadius: 1,

                  border: "1px solid",

                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Fecha de guardia
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,

                    color: "primary.dark",

                    textTransform: "capitalize",
                  }}
                >
                  {new Date(`${guardiaDate}T00:00:00`).toLocaleDateString(
                    "es-AR",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </Typography>
              </Box>
            )}
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
            onClick={guardarGuardia}
            disabled={saving || !formulario.residente.trim()}
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

      {/* ==================================================
          DIALOG CONFIRMAR ELIMINACIÓN
      ================================================== */}

      <Dialog
        open={openDeleteDialog}
        onClose={cerrarConfirmacionEliminar}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "primary.dark",
          }}
        >
          Confirmar eliminación
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar esta guardia?
          </DialogContentText>

          {guardiaAEliminar && (
            <Box
              sx={{
                mt: 2,
                p: 2,

                backgroundColor: "#FBE6C2",

                borderLeft: "4px solid",

                borderColor: "primary.main",

                borderRadius: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {guardiaAEliminar.residente}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {formatearFecha(guardiaAEliminar.fecha)}
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

      {/* ==================================================
          MENSAJES
      ================================================== */}

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
