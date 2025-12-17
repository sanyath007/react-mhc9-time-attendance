import React from 'react';
import { Routes, Route } from 'react-router-dom'
import ProtectedLayout from './components/layouts/Protected';
import DefaultLayout from './components/layouts/Default';
import AuthLayout from './components/layouts/Auth';
import Home from './pages/Home';
import CheckInContainer from './pages/CheckIn';
import NotFound from './pages/NotFound';
import EmployeeList from './pages/Employee/List';
import EmployeeFaceRegistration from './pages/Employee/FaceRegistration';
import EmployeeForm from './pages/Employee/Form';
import AttendanceList from './pages/Attendance/List';
import Login from './pages/Auth/Login';

function App() {
    return (
        <Routes>
            {/* Protected routes */}
            <Route path="/" element={<ProtectedLayout />}>
                <Route index element={<Home />} />
                <Route path="/attendance" element={<AttendanceList />} />

                <Route path="/employee" element={<EmployeeList />} />
                <Route path="/employee/register" element={<EmployeeForm />} />
                <Route path="/employee/:id/face" element={<EmployeeFaceRegistration />} />
            </Route>

            {/* Default routes */}
            <Route path="/" element={<DefaultLayout />}>
                <Route path="/check-in" element={<CheckInContainer />} />
            </Route>

            {/* Auth routes */}
            <Route path="/" element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                {/* <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} /> */}
            </Route>

            {/* Error routes */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
