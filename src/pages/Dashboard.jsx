import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";
import { getClases } from "../services/clases";

export default function Dashboard() {
  const navigate = useNavigate();

  const { profile, role } = useAuth();

  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const totalClases = clases.length;

  const clasesPrimerAnio = clases.filter(
    (clase) => Number(clase.anio_residencia) === 1,
  ).length;

  const clasesSegundoAnio = clases.filter(
    (clase) => Number(clase.anio_residencia) === 2,
  ).length;

  const clasesTercerAnio = clases.filter(
    (clase) => Number(clase.anio_residencia) === 3,
  ).length;

  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  const proximasClases = [...clases]
    .filter((clase) => {
      if (!clase.fecha) {
        return false;
      }

      const fecha = new Date(`${clase.fecha}T00:00:00`);

      return fecha >= hoy;
    })
    .sort(
      (a, b) =>
        new Date(`${a.fecha}T00:00:00`) - new Date(`${b.fecha}T00:00:00`),
    )
    .slice(0, 5);

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

  const estadisticas = [
    {
      titulo: "Total de clases",
      valor: totalClases,
      icono: <SchoolIcon />,
      color: "primary.main",
      iconColor: "white",
    },
    {
      titulo: "Clases 1° año",
      valor: clasesPrimerAnio,
      icono: <LooksOneIcon />,
      color: "secondary.main",
      iconColor: "primary.dark",
    },
    {
      titulo: "Clases 2° año",
      valor: clasesSegundoAnio,
      icono: <LooksTwoIcon />,
      color: "primary.light",
      iconColor: "primary.dark",
    },
    {
      titulo: "Clases 3° año",
      valor: clasesTercerAnio,
      icono: <Looks3Icon />,
      color: "#FBE6C2",
      iconColor: "primary.dark",
    },
  ];

  const puedeCrearClase = hasPermission(role, "clases", "crear");

  return (
    <Box>
      {/* CABECERA */}

      <Box
        sx={{
          mb: {
            xs: 3,
            md: 4,
          },

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
            Dashboard
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Bienvenido, {profile?.first_name || "usuario"}
          </Typography>
        </Box>

        {puedeCrearClase && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/clases")}
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

      {/* ESTADÍSTICAS */}

      <Grid
        container
        spacing={{
          xs: 2,
          sm: 3,
        }}
        sx={{
          mb: 3,
        }}
      >
        {estadisticas.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.titulo}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 0,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {item.titulo}
                    </Typography>

                    <Typography
                      variant="h3"
                      sx={{
                        mt: 1,
                        fontWeight: 700,
                        color: "primary.dark",
                        fontSize: {
                          xs: "2rem",
                          sm: "2.5rem",
                        },
                      }}
                    >
                      {loading ? "—" : item.valor}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: {
                        xs: 44,
                        sm: 48,
                      },

                      height: {
                        xs: 44,
                        sm: 48,
                      },

                      flexShrink: 0,

                      borderRadius: 0,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      color: item.iconColor,

                      backgroundColor: item.color,
                    }}
                  >
                    {item.icono}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* PRÓXIMAS CLASES */}

      <Paper
        sx={{
          overflow: "hidden",
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },

            display: "flex",

            justifyContent: "space-between",

            alignItems: {
              xs: "flex-start",
              sm: "center",
            },

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Próximas clases
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Las próximas clases programadas
            </Typography>
          </Box>

          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/clases")}
            size="small"
          >
            Ver todas
          </Button>
        </Box>

        <TableContainer
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table
            sx={{
              minWidth: 550,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>

                <TableCell>Clase</TableCell>

                <TableCell>Año de residencia</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && proximasClases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography
                      color="text.secondary"
                      sx={{
                        py: 3,
                      }}
                    >
                      No hay próximas clases programadas.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                proximasClases.map((clase) => (
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
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ERROR */}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
