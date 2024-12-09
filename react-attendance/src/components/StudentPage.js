import React from "react";

const StudentPage = ({ role, onLogout }) => {
  return (
    <div style={{ marginLeft: "200px" }}>
      <div style={{ padding: "20px" }}>
        <h1>Student Dashboard</h1>
        <p>Welcome, Student! View your courses and messages here.</p>
      </div>
    </div>
  );
};

export default StudentPage;
