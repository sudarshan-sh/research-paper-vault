import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_API } from "../config/api";
import type { LoginForm } from "../types/user.types";

const Signup = ({ setUser }: LoginForm) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...form,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${AUTH_API}/signup`, form, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert(response.data.message || "Registration successful!");
      setUser(response.data.user);
      // set the user in the local storage
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-100">
      <form
        action="#"
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-md shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Enter Name"
          className="border border-gray-300 rounded-md p-2 mb-4 w-full"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Enter Email"
          className="border border-gray-300 rounded-md p-2 mb-4 w-full"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Enter Password"
          className="border border-gray-300 rounded-md p-2 mb-6 w-full"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        <p className="mb-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
        </p>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!form.email || !form.password || !form.name}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Signup;
