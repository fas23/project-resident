import { supabase } from "../lib/supabase";

export async function getNotasDeEvaluacion(evaluacionId) {
  const { data, error } = await supabase
    .from("notas")
    .select("*")
    .eq("evaluacion_id", evaluacionId)
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true });

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
        fecha,
        clase_id,
        clases (
          id,
          nombre_clase,
          fecha,
          anio_residencia
        )
      )
    `,
    )
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/* import { supabase } from "../lib/supabase";


export async function getNotasDeEvaluacion(evaluacionId) {
  const { data, error } = await supabase
    .from("notas")
    .select("*")
    .eq("evaluacion_id", evaluacionId)
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true });

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
    .select(`
      *,
      evaluaciones (
        id,
        nombre,
        fecha,
        clase_id,
        clases (
          id,
          nombre_clase,
          fecha,
          anio_residencia
        )
      )
    `)
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}


export async function getNotasDeEvaluacion(evaluacionId) {
  const { data, error } = await supabase
    .from("notas")
    .select(
      `
      id,
      evaluacion_id,
      apellido,
      nombre,
      year_of_residency,
      nota,
      created_at
    `,
    )
    .eq("evaluacion_id", evaluacionId)
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function guardarNota({
  evaluacion_id,
  apellido,
  nombre,
  year_of_residency,
  nota,
}) {
  const { data, error } = await supabase
    .from("notas")
    .upsert(
      [
        {
          evaluacion_id,
          apellido: apellido.trim(),
          nombre: nombre.trim(),
          year_of_residency,
          nota,
        },
      ],
      {
        onConflict: "evaluacion_id,apellido,nombre",
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function eliminarNota(id) {
  const { error } = await supabase.from("notas").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
 */
