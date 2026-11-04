import { supabase } from "../lib/supabase";

export async function getNotasDeEvaluacion(evaluacionId) {
  const { data, error } = await supabase
    .from("notas")
    .select("*")
    .eq("evaluacion_id", evaluacionId)
    .order("apellido", { ascending: true });
  //.order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function guardarNota(nota) {
  const { data, error } = await supabase
    .from("notas")
    .upsert(nota)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getTodasLasNotas() {
  const { data, error } = await supabase
    .from("notas")
    .select(
      `
      *,
      evaluaciones (
        id,
        nombre,
        fecha
      )
    `,
    )
    .order("apellido", { ascending: true });
  //.order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
