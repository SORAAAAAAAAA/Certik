import { supabase } from '../../infra/supabase';

export async function signUpWithSupabase(name: string, email: string, password: string) {

    const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
            data: {
                full_name: name.trim(),
                display_name: name.trim()
                }
            }
    });

    // validate and handle errors from supabase
    if (error) {
        if (error.message.includes("User already registered")) {
          return {data: null, error: "An account with this email already exists. Please use a different email or try logging in instead."};
        } else if (error.message.includes("Password should be")) {
          return {data: null, error: "Password does not meet requirements. Please choose a stronger password."};
        } else if (error.message.includes("rate limit")) {
          return {data: null, error: "Too many signup attempts. Please wait a moment before trying again."};
        } else {
          return {data: null, error: error.message};
        }
      }

    return { user: data.user, error: null };

};