import { useRouteError, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const ErrorPage = () => {
    const error = useRouteError();
    const navigate = useNavigate();
    console.error(error);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
                <p className="text-xl text-gray-600 mb-8">Sorry, an unexpected error has occurred.</p>
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 max-w-md mx-auto overflow-auto text-left">
                    <p className="font-bold mb-1">Error Details:</p>
                    <p className="font-mono text-sm break-words">
                        {error.statusText || error.message || "Unknown Error"}
                    </p>
                    {error.stack && (
                        <details className="mt-2 text-xs opacity-75 cursor-pointer">
                            <summary>Stack Trace</summary>
                            <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                        </details>
                    )}
                </div>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
                    <Button onClick={() => navigate("/")}>Go Home</Button>
                </div>
            </div>
        </div>
    );
};
export default ErrorPage;
