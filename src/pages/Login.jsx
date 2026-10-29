import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Grid2X2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { login } from '../api/users.js';
import { useAuth } from '../contexts/authContext.jsx';

export default function Login() {
    const [, setToken] = useAuth();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: () => login({ email, password }),
        onSuccess: (res) => {
            console.log("You are in");
            setToken(res.data.token);
            console.log(res.data.token);
            navigate('/');
        },
        onError: () => undefined,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation.mutate();
    };

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <section className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link to="/" className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.18)]">
                        <Grid2X2 className="h-7 w-7" />
                    </Link>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">Welcome back</p>
                    <h1 className="text-3xl font-black tracking-tight text-white">Sign in to Point Point</h1>
                    <p className="mt-2 text-sm text-slate-400">Jump back into your next match.</p>
                </div>
                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60 sm:p-8">
                    <div className="space-y-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="create-email">
                            Email address
                            <span className="relative mt-2 block">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input id="create-email" name="create-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-normal normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40" />
                            </span>
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="create-password">
                            Password
                            <span className="relative mt-2 block">
                                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input id="create-password" name="create-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-normal normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40" />
                            </span>
                        </label>
                    </div>
                    {loginMutation.isError && <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-normal normal-case tracking-normal text-red-300">We couldn't sign you in. Check your details and try again.</p>}
                    <button type="submit" disabled={!password || !email || loginMutation.isPending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-bold normal-case tracking-normal text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">
                        {loginMutation.isPending ? 'Logging in...' : 'Log in'}
                        {!loginMutation.isPending && <ArrowRight className="h-4 w-4" />}
                    </button>
                    <div className="mt-5 flex items-center justify-center gap-2 text-xs font-normal normal-case tracking-normal text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Secure player access</div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-400">New to Point Point? <Link to="/signup" className="font-bold text-emerald-400 hover:text-emerald-300">Create an account</Link></p>
            </section>
        </main>
    );
}
