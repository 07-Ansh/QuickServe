import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard/customer'
    const role = requestUrl.searchParams.get('role')

    if (code) {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session?.user && role) {
            // Update user metadata with selected role if not exists
            const { error: updateError } = await supabase.auth.updateUser({
                data: { role: role }
            })

            // Also ensure profile exists (optional, if trigger fails)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    role: role as 'customer' | 'provider',
                    email: session.user.email
                }, { onConflict: 'id' })
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
