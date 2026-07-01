const tokenUrl = import.meta.env.VITE_OAUTH_TOKEN_URL
const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID
const clientSecret = import.meta.env.VITE_OAUTH_CLIENT_SECRET
const grantType = import.meta.env.VITE_OAUTH_GRANT_TYPE

export async function fetchOAuthToken() {
    if (!tokenUrl || !clientId || !clientSecret || !grantType) {
        throw new Error('Missing OAuth environment variables')
    }

    const body = new URLSearchParams({
        grant_type: grantType,
        client_id: clientId,
        client_secret: clientSecret,
    })

    const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`OAuth token request failed: ${res.status} ${errorText}`)
    }

    return res.json() as Promise<{ access_token: string; expires_in?: number; token_type?: string }>
}