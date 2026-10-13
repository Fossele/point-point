import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/users.js';




export default function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    const signupMutation = useMutation({
        mutationFn: () => signup({
            username,
            email,
            password
        }),
        onSuccess: () => navigate('/login'),
        onError: () => alert('failed to signup!'),
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(username, email, password)
        signupMutation.mutate()
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='create-username'>Username: </label>
                <input
                    type='text'
                    name='create-username'
                    id='create-username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

            <input
                type='submit'
                value={signupMutation.isPending ? 'Signing up...' : 'Sign Up'}
                disabled={!username || !password || !email || signupMutation.isPending}
            />
        </form>
    )
}
