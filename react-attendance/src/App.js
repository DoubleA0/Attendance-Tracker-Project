import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Settings from "./components/Settings";
import InstructorPage from "./components/InstructorPage";
import StudentPage from "./components/StudentPage";
import AdminPage from "./components/AdminPage";
import Sidebar from "./components/Sidebar";
import { auth } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Roster from "./components/Roster";


const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || ""); // Load role from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state for async tasks
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);

        // Attempt to fetch role from localStorage
        const savedRole = localStorage.getItem("role");
        if (savedRole) {
          setRole(savedRole); // Set role from storage
        } else {
          setRole(""); // No role in storage, handle fetching or setting it
        }
      } else {
        setIsAuthenticated(false);
        setUserEmail("");
        setRole(""); // Reset role if user logs out
      }
      setLoading(false); // Stop loading after auth state has been checked
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userRole) => {
    setRole(userRole);
    localStorage.setItem("role", userRole); // Save role in localStorage
    setIsAuthenticated(true);
    setLoading(false); // Stop loading after login
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign out
      setRole("");
      setIsAuthenticated(false);
      setUserEmail("");
      localStorage.removeItem("role"); // Clear role from localStorage
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state while authentication is being checked
  }

  return (
    <Router>
      <div style={{ display: "flex", backgroundColor: '#F0F4F2'}}>
        {isAuthenticated && <Sidebar role={role} userEmail={userEmail} onLogout={handleLogout} />}
        <div style={{ marginLeft: isAuthenticated ? "200px" : "0", flex: 1, padding: "20px" }}>
          <Routes>
            {/* Public routes */}
            {!isAuthenticated ? (
              <>
                <Route path="/" element={<Login onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignUp />} />
              </>
            ) : (
              <>
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    role === "instructor" ? (
                      <InstructorPage role={role} onLogout={handleLogout} />
                    ) : role === "student" ? (
                      <StudentPage role={role} onLogout={handleLogout} />
                    ) : role === "admin" ? (
                      <AdminPage role={role} onLogout={handleLogout} />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
                {/* Role-based navigation */}
                <Route path="/students" element={role === "instructor" ? <Roster/>  : <Navigate to="/" />} />
                <Route path="/settings" element={role === "admin" || role === "instructor" || role === "student" ? <Settings/> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
