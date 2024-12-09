import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [error, setError] = useState("");

  const colorPalette = {
    softBackground: "#F0F4F2",
    sage: "#2C3E50",
    coral: "#F68E5F",
    darkestBlack: "#080F0F",
    white: "#FFFFFF",
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store role information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
      });

      console.log("User signed up successfully and role assigned:", role);
      navigate("/"); // Navigate to the Login page
    } catch (error) {
      setError("Error signing up: " + error.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: colorPalette.softBackground }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="w-96 shadow-lg rounded-xl overflow-hidden"
        style={{
          backgroundColor: colorPalette.white,
          border: `2px solid ${colorPalette.sage}`,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="text-center border-b pb-4 pt-4"
          style={{
            borderColor: colorPalette.sage,
            backgroundColor: colorPalette.white,
          }}
        >
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              color: colorPalette.sage,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            AttendEase
          </h1>
        </div>
        <form onSubmit={handleSignUp} className="pt-6 px-6">
          <div className="space-y-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
                style={{
                  borderColor: colorPalette.sage,
                  color: colorPalette.darkestBlack,
                  backgroundColor: colorPalette.white,
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded"
                style={{
                  borderColor: colorPalette.sage,
                  color: colorPalette.darkestBlack,
                  backgroundColor: colorPalette.white,
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-2 border rounded"
                style={{
                  borderColor: colorPalette.sage,
                  color: colorPalette.darkestBlack,
                  backgroundColor: colorPalette.white,
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <select
                className="w-full p-2 border rounded"
                style={{
                  borderColor: colorPalette.sage,
                  color: colorPalette.darkestBlack,
                  backgroundColor: colorPalette.white,
                }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {/*  <option value="student">Student</option>*/}
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </motion.div>
          </div>
          {error && (
            <p className="text-red-500 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </p>
          )}
          <div className="flex flex-col space-y-4 pt-4 pb-6">
            <motion.button
              type="submit"
              className="w-full p-2 rounded"
              style={{
                backgroundColor: colorPalette.coral,
                color: colorPalette.white,
              }}
              whileHover={{ backgroundColor: "#8C5F4A" }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-center text-sm"
              style={{
                color: colorPalette.sage,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignUp;
