import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FestivalProvider } from "./contexts/FestivalContext";
import { UserProvider, UserContext } from "./contexts/UserContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/user/ProtectedRoute";
import LoginPopup from "./components/user/LoginPopup";
import HomePage from "./pages/HomePage";
import FestivalDetailPage from "./pages/FestivalDetailPage";
import ArtistSearchPage from "./pages/ArtistSearchPage";
import SchoolSearchPage from "./pages/SchoolSearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import CalendarPage from "./pages/CalendarPage";
import AuthPage from "./pages/AuthPage";
import "./styles/global.css";
import "./styles/components/comments.css";
import "font-awesome/css/font-awesome.min.css";

// Main app content component (separating from providers)
const AppContent = () => {
    const { showLoginPopup, setShowLoginPopup } = useContext(UserContext);

    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/festival/:id"
                        element={<FestivalDetailPage />}
                    />
                    <Route
                        path="/search/artist"
                        element={<ArtistSearchPage />}
                    />
                    <Route
                        path="/search/school"
                        element={<SchoolSearchPage />}
                    />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <FavoritesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/auth" element={<AuthPage />} />
                </Routes>
            </main>
            <Footer />

            {/* 로그인 팝업 */}
            <LoginPopup
                isOpen={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
            />
        </div>
    );
};

function App() {
    return (
        <Router>
            <UserProvider>
                <FestivalProvider>
                    <NotificationProvider>
                        <AppContent />
                    </NotificationProvider>
                </FestivalProvider>
            </UserProvider>
        </Router>
    );
}

export default App;
