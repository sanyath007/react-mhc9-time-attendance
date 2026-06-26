// import { type ChangeEvent, type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../../hooks/useAuth';
import FormField from '../../../components/ui/Forms/FormField';
import { cn } from '../../../utils/tailwindcss';
import { AtSign, Lock, LogIn, ScanFace } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().nonempty('Email is required').email('Invalid email address'),
    password: z.string().nonempty('Password is required').min(4, 'Password must be at least 4 characters long'),
});

type LoginType = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    // const [credentials, setCredentials] = useState<LoginType>({ email: '', password: '' });
    // const [errors, setErrors] = useState<any>(null)
    const { login, isAuthenticated } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginType>({
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
        <div className="px-4 py-6 rounded-2xl shadow-lg bg-white max-md:w-4/5 md:w-3/6 lg:w-1/3">
            <div className="flex flex-col space-y-4">
                <div className="text-center">
                    <h1 className="text-indigo-700 text-2xl font-bold">เข้าสู่ระบบ</h1>
                </div>

                {/* Alert messages */}
                {/* {errors && (
                    <ul className='rounded-lg p-2 bg-red-100'>
                        {errors.map((err, index) => <li className="text-red-500 text-sm" key={index}>- {err.message}</li>)}
                    </ul>
                )} */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6">
                    <FormField label='อีเมล' error={errors.email?.message}>
                        <div className={cn("border border-gray-400 rounded-lg py-2 px-3 overflow-hidden flex flex-row gap-2", errors.email && "border-red-500")}>
                            <AtSign className="text-gray-300" />
                            <input
                                type="email"
                                {...register("email")}
                                // value={credentials.email}
                                // onChange={handleChange}
                                className="w-full outline-none text-gray-500"
                                placeholder='your@email.com'
                            />
                        </div>
                    </FormField>
                    <FormField label='รหัสผ่าน' error={errors.password?.message}>
                        <div className={cn("border border-gray-400 rounded-lg py-2 px-3 overflow-hidden flex flex-row gap-2", errors.password && "border-red-500")}>
                            <Lock className="text-gray-300" />
                            <input
                                type="password"
                                {...register("password")}
                                // value={credentials.password}
                                // onChange={handleChange}
                                className="w-full outline-none text-gray-500"
                                placeholder='รหัสผ่านของคุณ'
                            />
                        </div>
                    </FormField>
                    <button
                        type="submit"
                        className="w-full border bg-indigo-500 p-2 text-white rounded-lg hover:bg-indigo-800"
                    >
                        <LogIn className="inline-block mr-2" />
                        เข้าสู่ระบบ
                    </button>
                </form>

                <div className='mb-4 flex flex-col justify-center items-center space-y-6 px-6 pb-4'>
                    <Link to="/auth/register" className="text-sm text-center text-gray-500 hover:underline">
                        Don't have an account? <span className="text-indigo-600 font-semibold">Register</span>
                    </Link>

                    <div className='flex justify-center'>
                        <Link to="/check-in" className="bg-gray-50 p-2 text-gray-500 rounded-lg border hover:border-gray-600 hover:text-gray-800 text-center flex flex-col items-center gap-2">
                            <ScanFace className="inline-block" />
                            <span className='font-bold'>Check in</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login