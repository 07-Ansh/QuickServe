import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isValidUrl = (url: string | undefined) => {
    try {
        return url && new URL(url)
    } catch {
        return false
    }
}

export const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseUrl !== 'your-project-url'

export const supabase = isConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : createClient('https://placeholder.supabase.co', 'placeholder')
