import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const RosterDashboard = ({ role, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [user, setUser] = useState(null);
  const [professorName, setProfessorName] = useState("");
  const [studentsData, setStudentsData] = useState([]);
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

  useEffect(() => {
    const fetchStudentsData = async () => {
      if (!selectedCourse) return;

      try {
        // Fetch students registered under the selected course
        const studentsQuery = query(
          collection(db, "UserCourses"),
          where("courseId", "==", selectedCourse)
        );
        const studentsSnapshot = await getDocs(studentsQuery);

        const studentsList = await Promise.all(
          studentsSnapshot.docs.map(async (doc) => {
            const studentEmail = doc.data().studentEmail;
            
            // Fetch student details
            const studentQuery = query(
              collection(db, "Students"),
              where("studentEmail", "==", studentEmail)
            );
            const studentSnapshot = await getDocs(studentQuery);
            const studentData = studentSnapshot.docs[0]?.data();

            if (studentData) {
              // Calculate absences for the student
              const attendanceQuery = query(
                collection(db, "Attendance"),
                where("studentEmail", "==", studentEmail),
                where("courseId", "==", selectedCourse)
              );
              const attendanceSnapshot = await getDocs(attendanceQuery);

              const absences = attendanceSnapshot.docs.filter(
                (doc) => doc.data().timestamp === null
              ).length;

              return {
                studentName: studentData.studentName,
                studentId: studentData.studentId,
                studentEmail: studentData.studentEmail,
                absences,
              };
            }

            return null;
          })
        );

        setStudentsData(studentsList.filter((student) => student !== null));
      } catch (error) {
        console.error("Error fetching students data:", error);
      }
    };

    fetchStudentsData();
  }, [selectedCourse]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ padding: "20px", flex: 1, marginLeft: "10px" }}>
        <h1>
          <span style={{ fontSize: "28px" }}>
            Welcome, <span style={{ fontWeight: "bold" }}>{professorName || "Professor"}</span>!
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
          <div>
            <h2>Students Registered in the Course</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Student Name</th>
                  <th style={tableHeaderStyle}>Student ID</th>
                  <th style={tableHeaderStyle}>Student Email</th>
                  <th style={tableHeaderStyle}>Absences</th>
                </tr>
              </thead>
              <tbody>
                {studentsData.map((student) => (
                  <tr key={student.studentId}>
                    <td style={tableCellStyle}>{student.studentName}</td>
                    <td style={tableCellStyle}>{student.studentId}</td>
                    <td style={tableCellStyle}>{student.studentEmail}</td>
                    <td style={tableCellStyle}>{student.absences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Please select a course to view the students.</p>
        )}
      </div>
    </div>
  );
};

// Table styles
const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
  backgroundColor: "#f4f4f4",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
};

export default RosterDashboard;
