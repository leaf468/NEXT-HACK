import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FestivalProvider } from "./contexts/FestivalContext";
import { UserProvider } from "./contexts/UserContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import FestivalDetailPage from "./pages/FestivalDetailPage";
import ArtistSearchPage from "./pages/ArtistSearchPage";
import SchoolSearchPage from "./pages/SchoolSearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import "./styles/global.css";

function App() {
    return (
        <Router>
            <UserProvider>
                <FestivalProvider>
                    <NotificationProvider>
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
                                    <Route
                                        path="/favorites"
                                        element={<FavoritesPage />}
                                    />
                                </Routes>
                            </main>
                            <Footer />
                        </div>
                    </NotificationProvider>
                </FestivalProvider>
            </UserProvider>
        </Router>
    );
}

export default App;
