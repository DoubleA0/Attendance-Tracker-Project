import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ role, onLogout, userEmail }) => {
  const [isOpen, setIsOpen] = useState(true); // Track sidebar open/close state
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const menuOptions = {
    instructor: [
      { label: "Dashboard", path: "/" },
      { label: "Students", path: "/students" },
      { label: "Settings", path: "/settings" },
    ],
    student: [
      { label: "My Courses", path: "/" },
      { label: "Settings", path: "/settings" },
    ],
    admin: [
      { label: "Manage Users", path: "/" },
      { label: "Settings", path: "/settings" },
    ],
  };

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isOpen ? "225px" : "60px", // Adjust width
        alignItems: isOpen ? "flex-start" : "center", // Center in collapsed state
      }}
    >
      {/* Hamburger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.hamburgerButton}
        aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <div style={styles.hamburgerBar}></div>
        <div style={styles.hamburgerBar}></div>
        <div style={styles.hamburgerBar}></div>
      </button>

      {/* Sidebar Content */}
      {isOpen && (
        <>
          <div style={styles.header}>
            <h2 style={styles.logoText}>AttendEase</h2>
          </div>
          <div style={styles.menu}>
            {menuOptions[role]?.map((option) => (
              <Link key={option.path} to={option.path} style={styles.link}>
                {option.label}
              </Link>
            ))}
          </div>
          <div style={styles.footer}>
            <p style={styles.smallText}>Logged in as: {userEmail}</p>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100%",
    backgroundColor: "#2C3E50",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: "10px",
    transition: "width 0.3s ease, align-items 0.3s ease",
  },
  hamburgerButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    alignItems: "center",
  },
  hamburgerBar: {
    width: "25px",
    height: "3px",
    backgroundColor: "white",
    borderRadius: "2px",
  },
  header: {
    textAlign: "center",
    padding: "20px 0", // Add vertical padding to center the text with the sidebar
    marginBottom: "20px",
    width: "100%",
  },
  logoText: {
    fontSize: "36px", // Large font size for AttendEase
    fontWeight: "bold",
    color: "white",
    lineHeight: "1.5", // Adjust line height to vertically align within the header area
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "20px", // Add space between menu items
    marginTop: "20px",
    marginBottom: "20px",
    width: "100%",
  },
  footer: {
    marginTop: "auto", // Push footer to the bottom
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Center horizontally
    width: "100%",
    paddingBottom: "20px", // Add spacing at the bottom
  },
  smallText: {
    fontSize: "14px",
    color: "#BDC3C7",
    marginBottom: "10px",
    textAlign: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    padding: "15px", // Increased padding for better spacing
    backgroundColor: "#34495E",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "90%", // Buttons take 90% of the sidebar's width
    alignSelf: "center", // Center the buttons horizontally
    textAlign: "center",
  },
  logoutButton: {
    color: "white",
    textDecoration: "none",
    padding: "15px", // Match menu buttons' padding
    backgroundColor: "#E74C3C",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "90%", // Logout button matches the menu buttons' alignment
    textAlign: "center",
  },
};

export default Sidebar;
