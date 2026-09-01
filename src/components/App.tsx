import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'
import ProtectedLayout from './layouts/Protected'
import AuthLayout from './layouts/Auth'
import Login from '../pages/Auth/Login'
import EmployeeList from '../pages/Employee/List'
import EmployeeForm from '../pages/Employee/Form'
import EmployeeEdit from '../pages/Employee/Edit'
import EmployeeDetail from '../pages/Employee/Detail'
import AttendanceList from '../pages/Attendance/List'
import LeaveList from '../pages/Attendance/LeaveList'
import OfficialDutyList from '../pages/Attendance/OfficialDutyList'
import CheckInContainer from '../pages/CheckIn'
import EmployeeFaceRegistration from '../pages/Employee/FaceRegistration'
import Profile from '../pages/Profile'
import Contact from '../pages/Contact'
import DefaultLayout from './layouts/Default'
import Settings from '../pages/Settings'
import HRReview from '../pages/Attendance/HRReview'
import DirectorApproval from '../pages/Attendance/DirectorApproval'
import SummaryReport from '../pages/Attendance/SummaryReport'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<ProtectedLayout />}>
                    <Route index element={<Home />} />

                    <Route path="/attendance/daily" element={<AttendanceList />} />
                    <Route path="/attendance/check-in" element={<CheckInContainer />} />
                    <Route path="/attendance/hr-review" element={<HRReview />} />
                    <Route path="/attendance/director-approval" element={<DirectorApproval />} />
                    <Route path="/attendance/summary" element={<SummaryReport />} />
                    <Route path="/leave" element={<LeaveList />} />
                    <Route path="/official-duty" element={<OfficialDutyList />} />

                    <Route path="/employee" element={<EmployeeList />} />
                    <Route path="/employee/register" element={<EmployeeForm />} />
                    <Route path="/employee/:id" element={<EmployeeDetail />} />
                    <Route path="/employee/:id/edit" element={<EmployeeEdit />} />
                    <Route path="/employee/:id/face" element={<EmployeeFaceRegistration />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/contact" element={<Contact />} />
                </Route>

                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    {/* <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} /> */}
                </Route>

                {/* Public routes */}
                <Route element={<DefaultLayout />}>
                    <Route path="/check-in" element={<CheckInContainer />} />
                </Route>

                {/* Error routes */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
