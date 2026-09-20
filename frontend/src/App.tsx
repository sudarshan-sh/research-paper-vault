/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notfound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from "react";
import type { User } from "./types/user.types";

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
