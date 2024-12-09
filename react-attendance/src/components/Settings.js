import React, { useState } from "react";
import { motion } from "framer-motion";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const colorPalette = {
    softBackground: "#F0F4F2",
    sage: "#2C3E50",
    coral: "#F68E5F",
    darkestBlack: "#080F0F",
    white: "#FFFFFF",
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("No user is currently signed in.");
        return;
      }

      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);
      setSuccess("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err.message);
      setError("Failed to update password. Please check your credentials and try again.");
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
            Settings
          </h1>
        </div>
        <form onSubmit={handlePasswordChange} className="pt-6 px-6">
          <div className="space-y-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <input
                type="password"
                placeholder="Current Password"
                className="w-full p-2 border rounded"
                style={{
                  borderColor: colorPalette.sage,
                  color: colorPalette.darkestBlack,
                  backgroundColor: colorPalette.white,
                }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-2 border rounded"
                style={{
                  borderColor: colorPalette.sage,
                  color: colorPalette.darkestBlack,
                  backgroundColor: colorPalette.white,
                }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full p-2 border rounded"
                style={{
                  borderColor: colorPalette.sage,
                  color: colorPalette.darkestBlack,
                  backgroundColor: colorPalette.white,
                }}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </motion.div>
          </div>
          {error && (
            <p className="text-red-500 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              {success}
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
              Change Password
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
              Back to Dashboard
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;
