import React from 'react';
import { Routes, Route } from 'react-router-dom'
import DefaultLayout from './components/layouts/Default';
import Home from './pages/Home';
import CheckInContainer from './pages/CheckIn';
import EmployeeFaceRegistration from './pages/Employee/FaceRegistration';
import NotFound from './pages/NotFound';
import EmployeeList from './pages/Employee/EmployeeList';

function App() {
    return (
        <Routes>
            {/* Protected routes */}
            <Route path="/" element={<DefaultLayout />}>
                <Route index element={<Home />} />
                <Route path="/check-in" element={<CheckInContainer />} />
                <Route path="/employee" element={<EmployeeList />} />
                <Route path="/employee/register" element={<EmployeeFaceRegistration />} />
            </Route>

            {/* Auth routes */}
            {/* <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} /> */}

            {/* Error routes */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
