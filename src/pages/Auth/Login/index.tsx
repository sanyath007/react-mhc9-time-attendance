import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../../hooks/useAuth';

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

type LoginType = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    // const [credentials, setCredentials] = useState<LoginType>({ email: '', password: '' });
    // const [errors, setErrors] = useState<any>(null)
    const { login, isAuthenticated } = useAuth();
    const { register, handleSubmit, formState: { errors }} = useForm<LoginType>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur"
    })

    const onSubmit = async (data: LoginType) => {
        // e.preventDefault();

        // const validator = loginSchema.safeParse(credentials);

        try {
            // if (validator.success) {
                const result = await login(data);

                if (result.success) {
                    navigate('/');
                }
            // } else {
            //     setErrors(validator.error.issues);
            // }
        } catch (error) {
            // setErrors(error)
        }
    };

    // const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    //     setCredentials((prev: LoginType) => ({
    //         ...prev,
    //         [e.target.name]: e.target.value,
    //     }))
    // };

    if (isAuthenticated) {
        navigate('/');
    }

    return (
        <div className="border px-4 py-6 rounded-lg shadow-lg bg-white max-md:w-4/5 md:w-3/6 lg:w-1/3">
            <div className="flex flex-col space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
                </div>

                {/* Alert messages */}
                {/* {errors && (
                    <ul className='rounded-lg p-2 bg-red-100'>
                        {errors.map((err, index) => <li className="text-red-500 text-sm" key={index}>- {err.message}</li>)}
                    </ul>
                )} */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            name="email"
                            {...register("email")}
                            // value={credentials.email}
                            // onChange={handleChange}
                            className="border border-indigo-400 rounded-lg py-1 px-3"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            name="password"
                            {...register("password")}
                            // value={credentials.password}
                            // onChange={handleChange}
                            className="border border-indigo-400 rounded-lg py-1 px-3"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
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