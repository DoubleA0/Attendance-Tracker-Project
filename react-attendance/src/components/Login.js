import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const colorPalette = {
    softBackground: '#F0F4F2',
    sage: '#2C3E50',
    coral: '#F68E5F',
    coralDark: '#E57D4C',
    darkestBlack: '#080F0F',
    white: '#FFFFFF',
    errorRed: '#FF6B6B'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        onLogin(userDoc.data().role);
      } else {
        setError("User profile not found. Please contact support.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: colorPalette.softBackground }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-96 shadow-lg rounded-xl overflow-hidden"
        style={{ 
          backgroundColor: colorPalette.white,
          border: `2px solid ${colorPalette.sage}`,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <div 
          className="text-center border-b pt-4 pb-4 flex justify-center"
          style={{ 
            borderColor: colorPalette.sage,
            backgroundColor: colorPalette.white
          }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold tracking-tight"
            style={{ 
              color: colorPalette.sage,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            AttendEase
          </motion.h1>
        </div>

        <div className="pt-6 px-6">
          <motion.form
            initial="hidden"
            animate="visible"
            variants={dropdownVariants}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border rounded"
              style={{ 
                borderColor: colorPalette.sage,
                color: colorPalette.darkestBlack,
                backgroundColor: colorPalette.white
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-2 border rounded"
              style={{ 
                borderColor: colorPalette.sage,
                color: colorPalette.darkestBlack,
                backgroundColor: colorPalette.white
              }}
            />
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full"
              style={{ 
                backgroundColor: colorPalette.coral,
                color: colorPalette.white,
                padding: '0.5rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.3s ease',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colorPalette.coralDark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colorPalette.coral;
              }}
            >
              {isLoading ? "Loading..." : "Login"}
            </button>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-center"
                style={{ color: colorPalette.errorRed }}
              >
                {error}
              </motion.p>
            )}
          </motion.form>
        </div>

        <div className="text-center mt-4 pb-6">
          <p className="text-sm text-gray-600">
            Need an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{ 
                color: colorPalette.sage,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
