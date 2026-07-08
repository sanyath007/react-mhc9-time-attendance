import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../hooks/useAuth';
import FormField from '../../../components/ui/Forms/FormField';
import { cn } from '../../../lib/utils/tailwindcss';
import { AtSign, Lock, LogIn, ScanFace } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().nonempty('Email is required').email('Invalid email address'),
    password: z.string().nonempty('Password is required').min(4, 'Password must be at least 4 characters long'),
});

type LoginType = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginType>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur"
    });

    const onSubmit = async (data: LoginType) => {
        try {
            const result = await login(data);
            if (result.success) {
                navigate('/');
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    if (isAuthenticated) {
        navigate('/');
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 max-md:w-11/12 md:w-3/5 lg:w-[400px] hover:shadow-indigo-500/5 transition-all duration-350">
            <div className="flex flex-col space-y-6">
                {/* Brand Identity Header */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                        <ScanFace className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wide">
                            MHC9 Attendance
                        </h1>
                        <p className="text-xs text-gray-400 font-semibold mt-1">ระบบลงทะเบียนและบันทึกเวลาทำงาน</p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Input */}
                    <FormField label="อีเมล" error={errors.email?.message}>
                        <div className={cn(
                            "border border-gray-200 rounded-xl py-3 px-3.5 flex flex-row items-center gap-2.5 bg-gray-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-200",
                            errors.email && "border-red-300 focus-within:ring-red-500/10 focus-within:border-red-500"
                        )}>
                            <AtSign className="text-gray-400 w-4.5 h-4.5" />
                            <input
                                type="email"
                                {...register("email")}
                                className="w-full outline-none text-gray-700 placeholder:text-gray-400 text-sm"
                                placeholder="your@email.com"
                            />
                        </div>
                    </FormField>

                    {/* Password Input */}
                    <FormField label="รหัสผ่าน" error={errors.password?.message}>
                        <div className={cn(
                            "border border-gray-200 rounded-xl py-3 px-3.5 flex flex-row items-center gap-2.5 bg-gray-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-200",
                            errors.password && "border-red-300 focus-within:ring-red-500/10 focus-within:border-red-500"
                        )}>
                            <Lock className="text-gray-400 w-4.5 h-4.5" />
                            <input
                                type="password"
                                {...register("password")}
                                className="w-full outline-none text-gray-700 placeholder:text-gray-400 text-sm"
                                placeholder="รหัสผ่านของคุณ"
                            />
                        </div>
                    </FormField>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-md shadow-indigo-500/10 hover:shadow-lg cursor-pointer"
                    >
                        <LogIn className="w-4.5 h-4.5" />
                        <span>เข้าสู่ระบบ</span>
                    </button>
                </form>

                {/* Footer Options */}
                <div className="flex flex-col space-y-6 pt-2">
                    <div className="text-center text-xs">
                        <Link to="/auth/register" className="text-gray-400 hover:text-indigo-600 transition-colors">
                            Don't have an account? <span className="font-bold text-indigo-500">Register</span>
                        </Link>
                    </div>

                    {/* Face Check-In Card */}
                    <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                            สำหรับพนักงานลงเวลาทำงาน
                        </p>
                        <Link
                            to="/check-in"
                            className="inline-flex items-center justify-center gap-2 py-3 w-full rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/20 text-gray-700 hover:text-indigo-600 font-bold text-sm transition-all duration-200 hover:scale-[1.01] shadow-sm cursor-pointer"
                        >
                            <ScanFace className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                            <span>ลงเวลาปฏิบัติงาน (สแกนใบหน้า)</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;