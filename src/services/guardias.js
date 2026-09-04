import { supabase } from "../lib/supabase";

export async function getGuardias() {
  const { data, error } = await supabase
    .from("guardias")
    .select("*")
    .order("fecha", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createGuardia(guardia) {
  const { data, error } = await supabase
    .from("guardias")
    .insert([guardia])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGuardia(id, guardia) {
  const { data, error } = await supabase
    .from("guardias")
    .update(guardia)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteGuardia(id) {
  const { error } = await supabase.from("guardias").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
