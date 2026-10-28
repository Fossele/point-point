import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Grid2X2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { signup } from '../api/users.js';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const signupMutation = useMutation({
        mutationFn: () => signup({ username, email, password }),
        onSuccess: () => navigate('/login'),
        onError: () => undefined,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        signupMutation.mutate();
    };

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <section className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link to="/" className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.18)]">
                        <Grid2X2 className="h-7 w-7" />
                    </Link>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">Enter the arena</p>
                    <h1 className="text-3xl font-black tracking-tight text-white">Create your account</h1>
                    <p className="mt-2 text-sm text-slate-400">Build your profile and challenge a friend.</p>
                </div>
                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60 sm:p-8">
                    <div className="space-y-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="create-username">
                            Username
                            <span className="relative mt-2 block">
                                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input id="create-username" name="create-username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a player name" className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-normal normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40" />
                            </span>
                        </label>
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
                                <input id="create-password" name="create-password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a secure password" className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-normal normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40" />
                            </span>
                        </label>
                    </div>
                    {signupMutation.isError && <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-normal normal-case tracking-normal text-red-300">We couldn't create your account. Please try again.</p>}
                    <button type="submit" disabled={!username || !password || !email || signupMutation.isPending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-bold normal-case tracking-normal text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">
                        {signupMutation.isPending ? 'Creating account...' : 'Create account'}
                        {!signupMutation.isPending && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300">Sign in</Link></p>
            </section>
        </main>
    );
}
