import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let recoveryDetected = false;

    const checkRecovery = async () => {
      // Escuchamos el evento PASSWORD_RECOVERY
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          recoveryDetected = true;
          setRecoveryMode(true);
          setCheckingSession(false);
        }
      });

      // Verificamos si existe una sesión
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError("No se pudo verificar la sesión.");
        setCheckingSession(false);
        return;
      }

      // Esperamos un momento para que Supabase procese
      // el evento PASSWORD_RECOVERY del enlace.
      setTimeout(() => {
        if (!recoveryDetected) {
          if (!data.session) {
            setError("El enlace de recuperación no es válido o ya expiró.");
          } else {
            setError(
              "Esta página solo puede utilizarse mediante un enlace de recuperación de contraseña.",
            );
          }

          setCheckingSession(false);
        }
      }, 500);

      return () => {
        subscription.unsubscribe();
      };
    };

    checkRecovery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Completá ambos campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Tu contraseña fue actualizada correctamente.");

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  if (checkingSession) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>Verificando enlace de recuperación...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            padding: 4,
          }}
        >
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Cambiar contraseña
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Ingresá tu nueva contraseña.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {recoveryMode && !success && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nueva contraseña"
                type="password"
                value={password}
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Cambiar contraseña"}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
