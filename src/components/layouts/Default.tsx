import React from 'react'
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckIn from '../CheckIn';
import Footer from '../Footer';

const DefaultLayout = () => {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navbar />

            <main className="min-h-screen max-w-7xl mx-auto p-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default DefaultLayout