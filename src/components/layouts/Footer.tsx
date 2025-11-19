import React from 'react'

export default function Footer() {
    return (
        <footer className="p-4 border-t border-t-zinc-200 text-center">
            <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} Next 15 Crash Course</p>
        </footer>
    )
}
