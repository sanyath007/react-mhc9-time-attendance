import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'
import ProtectedLayout from './layouts/Protected'
import AuthLayout from './layouts/Auth'
import Login from '../pages/Auth/Login'
import EmployeeList from '../pages/Employee/List'
import EmployeeForm from '../pages/Employee/Form'
import AttendanceList from '../pages/Attendance/List'
import CheckInContainer from '../pages/CheckIn'
import EmployeeFaceRegistration from '../pages/Employee/FaceRegistration'
import DefaultLayout from './layouts/Default'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<ProtectedLayout />}>
                    <Route index element={<Home />} />
                    
                    <Route path="/attendance" element={<AttendanceList />} />
                    <Route path="/attendance/check-in" element={<CheckInContainer />} />

                    <Route path="/employee" element={<EmployeeList />} />
                    <Route path="/employee/register" element={<EmployeeForm />} />
                    <Route path="/employee/:id/face" element={<EmployeeFaceRegistration />} />
                </Route>

                {/* Auth routes */}
                <Route path="/" element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    {/* <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} /> */}
                </Route>

                {/* Public routes */}
                <Route path="/" element={<DefaultLayout />}>
                    <Route path="/check-in" element={<CheckInContainer />} />
                </Route>

                {/* Error routes */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
