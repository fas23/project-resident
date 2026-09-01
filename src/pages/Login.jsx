import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error de login:", error);

      setError("Correo electrónico o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        px: {
          xs: 2,
          sm: 3,
        },

        py: {
          xs: 3,
          sm: 5,
        },

        background: `
          linear-gradient(
            135deg,
            #FFF8CF 0%,
            #FBE6C2 50%,
            #FFF8CF 100%
          )
        `,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 430,

          p: {
            xs: 3,
            sm: 4,
          },

          borderRadius: {
            xs: 3,
            sm: 4,
          },

          border: "1px solid #D8E4C8",
        }}
      >
        {/* LOGO */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,

              borderRadius: "50%",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              bgcolor: "primary.main",

              color: "white",

              mb: 2,

              boxShadow: "0 6px 16px rgba(42,124,19,0.25)",
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>

          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              color: "primary.dark",
            }}
          >
            Residencias
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 0.5 }}
          >
            Sistema de gestión
          </Typography>
        </Box>

        {/* FORM */}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography
            variant="h6"
            sx={{
              mb: 2.5,
              fontWeight: 700,
            }}
          >
            Iniciar sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              minHeight: 48,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </Box>

        {/* FOOTER */}

        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
          sx={{ mt: 3 }}
        >
          Acceso exclusivo para usuarios registrados
        </Typography>
      </Paper>
    </Box>
  );
}
