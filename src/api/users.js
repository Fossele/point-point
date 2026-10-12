export const signup = async ({ username, email, password }) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/signup`, {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json'
        },
        body: JSON.stringify({
            username, email, password
        }),
    })
    if (!res.ok) throw new Error('failed to signup');

    return await res.json()
}

export const login = async ({ email, password }) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/json'
            },
            body: JSON.stringify({
                email, password
            }),
        });
    if (!res.ok) throw new Error('failed to login');
    return await res.json();
}