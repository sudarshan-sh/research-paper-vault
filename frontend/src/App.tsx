import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notfound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import type { User } from "./types/user.types";
import axios from "axios";
import { AUTH_API } from "./config/api";
import ResearchPaperDetails from "./pages/ResearchPaperDetails";

// axios will send cookies with each request
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const user = await axios.get(`${AUTH_API}/user`);
      setUser(user.data.user);
      setLoading(false);
    } catch (error) {
      console.error("Error in App.jsx:", error);
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Router>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Home user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <Signup setUser={setUser} />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
          />
          <Route
            path="/research-papers/:id"
            element={user ? <ResearchPaperDetails /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
