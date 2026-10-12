import { login } from '../api/users.js'
import { useAuth } from '../context/AuthContext.js'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';


function login() {

    const [, setToken] = useAuth();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const loginMutation = useMutation({
        mutationFn: () => login({
            email,
            password
        }),
        onSuccess: (data) => {
            setToken(data.token)
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
                    value={password}
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