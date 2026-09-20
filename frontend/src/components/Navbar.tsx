import React from "react";
import type { User } from "../types/user.types";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AUTH_API } from "../config/api";

const Navbar = ({
  user,
  setUser,
}: {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}) => {
  const navigate = useNavigate();
  // logout function
  const handleLogout = async () => {
    try {
      await axios.post(`${AUTH_API}/logout`);
      setUser(null);
      alert("Logged out successfully!");
      navigate("/login");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1
          className="text-white font-bold text-xl cursor-pointer"
          onClick={() => navigate("/")}
        >
          Research Paper Vault
        </h1>
        <div>
          {user ? (
            <>
              <Link
                to="/research-papers"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Research Papers
              </Link>
              <span className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Welcome, {user?.name}!
              </span>
              <button
                onClick={() => handleLogout()}
                className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
