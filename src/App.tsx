import React from 'react';
import { Routes, Route } from 'react-router-dom'
import DefaultLayout from './components/layouts/Default';
import Home from './views/Home';
import CheckInContainer from './views/CheckIn';

function App() {
    return (
        <Routes>
            <Route path="/" element={<DefaultLayout />}>
                <Route index element={<Home />} />
                <Route path="/check-in" element={<CheckInContainer />} />
            </Route>
        </Routes>
    );
}

export default App;
