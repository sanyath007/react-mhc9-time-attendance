import React from 'react';
import Navbar from './components/Navbar';
import CheckInContainer from './views/CheckIn';
import CheckIn from './components/CheckIn';
import Footer from './components/Footer';

function App() {
    return (
        <div className="App">
            <Navbar />

            <main className="p-0">
                <CheckInContainer>
                    <CheckIn />
                </CheckInContainer>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default App;
