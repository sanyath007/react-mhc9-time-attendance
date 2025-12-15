import React from 'react'

const Login = () => {
    return (
        <div className="border px-4 py-6 rounded-lg shadow-lg bg-white w-3/12">
            <div className="flex flex-col space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Login Page</h1>
                </div>

                <form className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            name="email"
                            className="border border-indigo-400 rounded-lg p-1"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            name="password"
                            className="border border-indigo-400 rounded-lg p-1"
                        />
                    </div>
                    <button className="w-full border bg-indigo-400 p-2 text-white rounded-lg hover:bg-indigo-500">
                        Log in
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login