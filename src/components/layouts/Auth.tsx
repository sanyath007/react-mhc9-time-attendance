import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Outlet />
        </div>
    )
}

export default AuthLayout