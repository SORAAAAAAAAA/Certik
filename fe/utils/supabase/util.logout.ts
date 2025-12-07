import { supabase } from '../../infra/supabase';

export default async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  return {success: true, message: 'Signed out successfully'};
}