export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 min-h-screen">
            <h1 className="text-[10rem] font-bold">Oops!</h1>
            <h3 className="text-4xl font-bold">
                404 - Not Found
            </h3>
            <a href="/" className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full hover:bg-indigo-700">Go To Home page</a>
        </div>
    )
}