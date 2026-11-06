import { supabase } from "../lib/supabase";

export async function getEvaluaciones() {
  const { data, error } = await supabase
    .from("evaluaciones")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createEvaluacion(evaluacion) {
  const { data, error } = await supabase
    .from("evaluaciones")
    .insert([evaluacion])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateEvaluacion(id, evaluacion) {
  const { data, error } = await supabase
    .from("evaluaciones")
    .update(evaluacion)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteEvaluacion(id) {
  const { error } = await supabase.from("evaluaciones").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
