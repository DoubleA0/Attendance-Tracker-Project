import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import AttendanceTable from "./AttendanceTable";

// Instructor Dashboard Content
const InstructorDashboard = ({ role, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [user, setUser] = useState(null);
  const [professorName, setProfessorName] = useState("");
  const [loading, setLoading] = useState(true);

  // Monitor the authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    const fetchProfessorData = async () => {
      if (!user) return;

      try {
        // Fetch professor data based on their email
        const professorQuery = query(
          collection(db, "Professor"),
          where("professorEmail", "==", user.email)
        );
        const professorSnapshot = await getDocs(professorQuery);

        if (!professorSnapshot.empty) {
          const professorData = professorSnapshot.docs[0].data();
          setProfessorName(professorData.professorName);
          const courseIds = professorSnapshot.docs.map((doc) => doc.data().courseId);

          // Fetch courses associated with the professor
          const coursesQuery = query(
            collection(db, "Courses"),
            where("courseId", "in", courseIds)
          );
          const coursesSnapshot = await getDocs(coursesQuery);

          const courseList = coursesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort courses by the most recent start date (descending order)
          const sortedCourses = courseList.sort((a, b) => b.startTime - a.startTime);

          setCourses(sortedCourses);
        } else {
          console.error("No professor data found for this email.");
        }
      } catch (error) {
        console.error("Error fetching professor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessorData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ padding: "20px", flex: 1, marginLeft: "10px" }}>
        <h1>
          <span style={{ fontSize: "28px" }}>
            Welcome, <span style={{ fontWeight: "bold" }}>{professorName || "Instructor"}</span>!
          </span>
        </h1>
        <div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              padding: "8px",
              margin: "10px 0",
              width: "300px",
              fontSize: "16px",
            }}
          >
            <option value="">Select a Course...</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseId} - {course.courseName}
              </option>
            ))}
          </select>
        </div>
        {selectedCourse ? (
          <AttendanceTable
            courseId={selectedCourse}
            professorName={professorName}
          />
        ) : (
          <p>Please select a course to view attendance data.</p>
        )}
      </div>
    </div>
  );
};

// Main Instructor Page Component
const InstructorPage = ({ role, onLogout }) => {
  const [userRole, setUserRole] = useState(role);

  useEffect(() => {
    // Update userRole whenever the role prop changes
    if (!userRole) setUserRole(role);
  }, [role, userRole]); // Added 'userRole' to the dependency array

  return (
    <div>
      <InstructorDashboard role={userRole} onLogout={onLogout} />
    </div>
  );
};

export default InstructorPage;
