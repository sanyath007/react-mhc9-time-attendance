import React from 'react';
import { Routes, Route } from 'react-router-dom'
import DefaultLayout from './components/layouts/Default';
import Home from './views/Home';
import CheckInContainer from './views/CheckIn';
import EmployeeFaceRegistration from './views/Employee/FaceRegistration';

function App() {
    return (
        <Routes>
            <Route path="/" element={<DefaultLayout />}>
                <Route index element={<Home />} />
                <Route path="/check-in" element={<CheckInContainer />} />
                <Route path="/employee/register" element={<EmployeeFaceRegistration />} />
            </Route>
        </Routes>
    );
}

export default App;
