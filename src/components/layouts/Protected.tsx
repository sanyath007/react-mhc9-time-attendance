import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const ProtectedLayout = () => {
    const isAuthenticated = localStorage.getItem("access_token");

    if (!isAuthenticated) {
        return <Navigate replace to={"/login"} />;
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
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