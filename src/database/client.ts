import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { TelegramGroup, TelegramTopic, TelegramUser, UserTopicInterest } from '../types';

let supabase: SupabaseClient;

/**
 * Inicializa el cliente de Supabase
 */
export function initSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return supabase;
}

/**
 * Obtiene o crea un usuario en la base de datos
 */
export async function getOrCreateUser(
  telegramId: number,
  username: string | undefined,
  firstName: string,
  lastName: string | undefined,
  origen: string = 'direct_bot'
): Promise<TelegramUser> {
  const client = initSupabase();

  // Primero intentar obtener el usuario
  const { data: existingUser, error: fetchError } = await client
    .from('telegram_users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (existingUser) {
    // Actualizar información si cambió
    const { data: updatedUser, error: updateError } = await client
      .from('telegram_users')
      .update({
        username: username || null,
        first_name: firstName,
        last_name: lastName || null,
      })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando usuario:', updateError);
      return existingUser;
    }
    
    return updatedUser;
  }

  // Si no existe, crear nuevo usuario
  const { data: newUser, error: insertError } = await client
    .from('telegram_users')
    .insert({
      telegram_id: telegramId,
      username: username || null,
      first_name: firstName,
      last_name: lastName || null,
      origen,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creando usuario:', insertError);
    throw new Error('No se pudo crear el usuario');
  }

  return newUser;
}

/**
 * Obtiene el grupo principal
 */
export async function getMainGroup(): Promise<TelegramGroup | null> {
  const client = initSupabase();

  const { data, error } = await client
    .from('telegram_group')
    .select('*')
    .eq('activo', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error obteniendo grupo principal:', error);
    throw new Error('Error al buscar el grupo principal');
  }

  return data;
}

/**
 * Obtiene todos los temas activos ordenados
 */
export async function getActiveTopics(): Promise<TelegramTopic[]> {
  const client = initSupabase();

  const { data, error } = await client
    .from('telegram_topics')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error obteniendo temas:', error);
    throw new Error('No se pudieron obtener los temas');
  }

  return data || [];
}

/**
 * Obtiene un tema por su slug
 */
export async function getTopicBySlug(slug: string): Promise<TelegramTopic | null> {
  const client = initSupabase();

  const { data, error } = await client
    .from('telegram_topics')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error obteniendo tema:', error);
    throw new Error('Error al buscar el tema');
  }

  return data;
}

/**
 * Registra interés en un tema
 */
export async function recordTopicInterest(
  telegramUserId: number,
  topicSlug: string
): Promise<UserTopicInterest> {
  const client = initSupabase();

  const { data, error } = await client
    .from('user_topic_interest')
    .insert({
      telegram_user_id: telegramUserId,
      topic_slug: topicSlug,
    })
    .select()
    .single();

  if (error) {
    console.error('Error registrando interés:', error);
    throw new Error('No se pudo registrar el interés');
  }

  return data;
}

/**
 * Obtiene estadísticas de un usuario (cuántos temas le interesan)
 */
export async function getUserStats(telegramUserId: number): Promise<{
  totalInterests: number;
  uniqueTopics: number;
}> {
  const client = initSupabase();

  const { data, error } = await client
    .from('user_topic_interest')
    .select('topic_slug')
    .eq('telegram_user_id', telegramUserId);

  if (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { totalInterests: 0, uniqueTopics: 0 };
  }

  const uniqueTopics = new Set(data.map(d => d.topic_slug));
  
  return {
    totalInterests: data.length,
    uniqueTopics: uniqueTopics.size,
  };
}

