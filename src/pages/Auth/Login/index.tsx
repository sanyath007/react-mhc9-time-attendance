import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState<any>({ email: '', password: '' });
    const [errors, setErrors] = useState<any>(null)
    const { login, isAuthenticated } = useAuth();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const result = await login(credentials);

            if (result.success) {
                navigate('/');
            }
        } catch (error) {
            setErrors(error)
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    if (isAuthenticated) {
        navigate('/');
    }

    return (
        <div className="border px-4 py-6 rounded-lg shadow-lg bg-white w-3/12">
            <div className="flex flex-col space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Login Page</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            className="border border-indigo-400 rounded-lg py-1 px-3"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="border border-indigo-400 rounded-lg py-1 px-3"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full border bg-indigo-400 p-2 text-white rounded-lg hover:bg-indigo-500"
                    >
                        Log in
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login