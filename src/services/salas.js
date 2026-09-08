import { supabase } from "../lib/supabase";

// =========================================================
// SALAS
// =========================================================

export async function getSalas() {
  const { data, error } = await supabase
    .from("salas")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error obteniendo salas:", error);
    throw error;
  }

  return data || [];
}

export async function createSala(datos) {
  const { data, error } = await supabase
    .from("salas")
    .insert({
      nombre: datos.nombre,
      tipo: datos.tipo || null,
      observaciones: datos.observaciones || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando sala:", error);
    throw error;
  }

  return data;
}

export async function updateSala(id, datos) {
  const { data, error } = await supabase
    .from("salas")
    .update({
      nombre: datos.nombre,
      tipo: datos.tipo || null,
      observaciones: datos.observaciones || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error modificando sala:", error);
    throw error;
  }

  return data;
}

export async function deleteSala(id) {
  const { error } = await supabase.from("salas").delete().eq("id", id);

  if (error) {
    console.error("Error eliminando sala:", error);
    throw error;
  }

  return true;
}

// =========================================================
// RESIDENTES DE UNA SALA
// =========================================================

export async function getSalaResidentes(salaId) {
  const { data, error } = await supabase
    .from("sala_residentes")
    .select("*")
    .eq("sala_id", salaId)
    .order("camas_desde", { ascending: true })
    .order("apellido", { ascending: true });

  if (error) {
    console.error("Error obteniendo residentes de la sala:", error);

    throw error;
  }

  return data || [];
}

// =========================================================
// CREAR ASIGNACIÓN
// =========================================================

export async function createSalaResidente(datos) {
  const { data, error } = await supabase
    .from("sala_residentes")
    .insert({
      sala_id: datos.sala_id,

      apellido: datos.apellido,

      nombre: datos.nombre,

      camas_desde: datos.camas_desde === "" ? null : Number(datos.camas_desde),

      camas_hasta: datos.camas_hasta === "" ? null : Number(datos.camas_hasta),

      observaciones: datos.observaciones || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando asignación:", error);
    throw error;
  }

  return data;
}

// =========================================================
// MODIFICAR ASIGNACIÓN
// =========================================================

export async function updateSalaResidente(id, datos) {
  const { data, error } = await supabase
    .from("sala_residentes")
    .update({
      sala_id: datos.sala_id,

      apellido: datos.apellido,

      nombre: datos.nombre,

      camas_desde: datos.camas_desde === "" ? null : Number(datos.camas_desde),

      camas_hasta: datos.camas_hasta === "" ? null : Number(datos.camas_hasta),

      observaciones: datos.observaciones || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error modificando asignación:", error);
    throw error;
  }

  return data;
}

// =========================================================
// ELIMINAR ASIGNACIÓN
// =========================================================

export async function deleteSalaResidente(id) {
  const { error } = await supabase
    .from("sala_residentes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando asignación:", error);
    throw error;
  }

  return true;
}
