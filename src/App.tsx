import React from 'react';
import Navbar from './components/Navbar';
import CheckInContainer from './views/CheckIn';
import CheckIn from './components/CheckIn';

function App() {
    return (
        <div className="App">
            <Navbar />

            <main className="p-8">
                <CheckInContainer>
                    <CheckIn />
                </CheckInContainer>
            </main>

            {/* Footer */}
            <footer className="p-4 border-t border-t-zinc-200 text-center">
                <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} Next 15 Crash Course</p>
            </footer>
        </div>
    );
}

export default App;
