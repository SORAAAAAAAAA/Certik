import { supabase } from '../../infra/supabase';

export async function signInWithSupabase(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { data: null, error: "Invalid email or password. Please try again." };
        } else {
          return { data: null, error: error.message };
        }

      }

    return { data, error: null };
}