import { supabase } from '../lib/supabase'

export async function getClases() {
  const { data, error } = await supabase
    .from('clases')
    .select('*')
    .order('fecha', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

export async function createClase(clase) {
  const { data, error } = await supabase
    .from('clases')
    .insert([clase])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateClase(id, clase) {
  const { data, error } = await supabase
    .from('clases')
    .update(clase)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteClase(id) {
  const { error } = await supabase
    .from('clases')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
