import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

const ProtectedLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate replace to={"/login"} />;
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen">
            {/* Header */}
            <Navbar />

            {/* Content */}
            <main className="min-h-screen max-w-7xl mx-auto p-8 max-md:p-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default ProtectedLayout