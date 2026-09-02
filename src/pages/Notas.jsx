import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
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

import GradeIcon from "@mui/icons-material/Grade";

import { getTodasLasNotas } from "../services/notas";

export default function Notas() {
  const [notas, setNotas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filtroAnio, setFiltroAnio] = useState("");

  const [filtroEvaluacion, setFiltroEvaluacion] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const cargarNotas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTodasLasNotas();

      setNotas(data || []);
    } catch (error) {
      console.error("Error cargando notas:", error);

      setError(error.message || "No se pudieron cargar las notas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNotas();
  }, []);

  // ============================================================
  // EVALUACIONES DISPONIBLES
  // ============================================================

  const evaluaciones = useMemo(() => {
    const mapa = new Map();

    notas.forEach((nota) => {
      const evaluacion = nota.evaluaciones;

      if (!evaluacion) {
        return;
      }

      if (!mapa.has(evaluacion.id)) {
        mapa.set(evaluacion.id, evaluacion);
      }
    });

    return Array.from(mapa.values()).sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha),
    );
  }, [notas]);

  // ============================================================
  // FILTRAR
  // ============================================================

  const notasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return notas.filter((nota) => {
      // FILTRO AÑO

      if (filtroAnio && String(nota.year_of_residency) !== String(filtroAnio)) {
        return false;
      }

      // FILTRO EVALUACIÓN

      if (
        filtroEvaluacion &&
        String(nota.evaluacion_id) !== String(filtroEvaluacion)
      ) {
        return false;
      }

      // BUSCAR

      if (texto) {
        const apellido = nota.apellido?.toLowerCase() || "";

        const nombre = nota.nombre?.toLowerCase() || "";

        const completo = `${apellido} ${nombre}`;

        if (
          !apellido.includes(texto) &&
          !nombre.includes(texto) &&
          !completo.includes(texto)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [notas, filtroAnio, filtroEvaluacion, busqueda]);

  // ============================================================
  // FECHA
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
  // LIMPIAR FILTROS
  // ============================================================

  const limpiarFiltros = () => {
    setFiltroAnio("");
    setFiltroEvaluacion("");
    setBusqueda("");
  };

  return (
    <Box>
      {/* ======================================================
          CABECERA
      ======================================================= */}

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <GradeIcon
            sx={{
              color: "primary.main",
              fontSize: 34,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "primary.dark",
            }}
          >
            Notas
          </Typography>
        </Box>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Consulta de calificaciones de todos los residentes
        </Typography>
      </Box>

      {/* ======================================================
          FILTROS
      ======================================================= */}

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
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr 1fr auto",
            },

            gap: 2,

            alignItems: "center",
          }}
        >
          {/* AÑO */}

          <TextField
            select
            label="Año de residencia"
            value={filtroAnio}
            onChange={(event) => setFiltroAnio(event.target.value)}
            fullWidth
          >
            <MenuItem value="">Todos los años</MenuItem>

            <MenuItem value={1}>1° año</MenuItem>

            <MenuItem value={2}>2° año</MenuItem>

            <MenuItem value={3}>3° año</MenuItem>
          </TextField>

          {/* EVALUACIÓN */}

          <TextField
            select
            label="Evaluación"
            value={filtroEvaluacion}
            onChange={(event) => setFiltroEvaluacion(event.target.value)}
            fullWidth
          >
            <MenuItem value="">Todas las evaluaciones</MenuItem>

            {evaluaciones.map((evaluacion) => (
              <MenuItem key={evaluacion.id} value={evaluacion.id}>
                {evaluacion.nombre}
              </MenuItem>
            ))}
          </TextField>

          {/* BUSCAR */}

          <TextField
            label="Buscar residente"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Apellido o nombre"
            fullWidth
          />

          {/* LIMPIAR */}

          <Box
            sx={{
              display: "flex",
              justifyContent: {
                xs: "stretch",
                sm: "center",
              },
            }}
          >
            <Typography
              component="button"
              onClick={limpiarFiltros}
              sx={{
                border: 0,
                background: "transparent",
                color: "primary.main",
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap",
                padding: 1,
              }}
            >
              Limpiar filtros
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ======================================================
          RESULTADOS
      ======================================================= */}

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
            minWidth: 850,
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
                Evaluación
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                }}
              >
                Fecha
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                }}
              >
                Nota
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* LOADING */}

            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {/* SIN RESULTADOS */}

            {!loading && notasFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography
                    color="text.secondary"
                    sx={{
                      py: 4,
                    }}
                  >
                    No hay notas que coincidan con los filtros.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/* RESULTADOS */}

            {!loading &&
              notasFiltradas.map((nota) => {
                const evaluacion = nota.evaluaciones;

                return (
                  <TableRow key={nota.id} hover>
                    <TableCell>{nota.apellido}</TableCell>

                    <TableCell>{nota.nombre}</TableCell>

                    <TableCell>
                      {nota.year_of_residency
                        ? `${nota.year_of_residency}° año`
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 500,
                        }}
                      >
                        {evaluacion?.nombre || "-"}
                      </Typography>

                      {evaluacion?.clases?.nombre_clase && (
                        <Typography variant="caption" color="text.secondary">
                          {evaluacion.clases.nombre_clase}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{formatearFecha(evaluacion?.fecha)}</TableCell>

                    <TableCell align="center">
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "primary.dark",
                          fontSize: "1.05rem",
                        }}
                      >
                        {Number(nota.nota).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Box>
  );
}
