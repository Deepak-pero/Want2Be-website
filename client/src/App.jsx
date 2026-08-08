import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import LoadingSpinner from "./components/LoadingSpinner";
import MainLayout from "./layout/MainLayout";
import { Toaster } from "react-hot-toast";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import AnalysisHistory from "./pages/AnalysisHistory";
import Footer from "./components/Footer";
import StoryViewer from './components/StoryViewer';


const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: (
                    <>
                        <div className='bg-gradient-to-r from-red-50 to-green-50'>
                            <LandingPage />
                        </div>
                        <Footer />
                    </>
                ),
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "profile/:userId",
                element: <UserProfile />,
            },
            {
                path: "/analysis-history",
                element: <AnalysisHistory />,
            },
            {
                path: "/story/:userId",
                element: <StoryViewer />,
            },
        ],

    },
]);

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <>
            <RouterProvider router={router} />
            <Toaster reverseOrder={false} />
        </>
    );
}

export default App;