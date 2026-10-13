import { login } from '../api/users.js'
import { useAuth } from '../contexts/authContext.jsx'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';


export default function Login() {

    const [token, setToken] = useAuth();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: () => login({
            email,
            password
        }),
        onSuccess: (res) => {
            setToken(res.data.token)
            console.log(token)
            navigate('/')
        },
        onError: () => alert('failed to login!'),
    })
    const handleSubmit = (e) => {
        e.preventDefault()
        loginMutation.mutate()
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='create-email'>Email: </label>
                <input
                    type='email'
                    name='create-email'
                    id='create-email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <br />
            <div>
                <label htmlFor='create-password'>Password: </label>
                <input
                    type='password'
                    name='create-password'
                    id='create-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <br />

            <input
                type='submit'
                value={loginMutation.isPending ? 'Logging in...' : 'Login'}
                disabled={!password || !email || loginMutation.isPending}
            />
        </form>
    )
}