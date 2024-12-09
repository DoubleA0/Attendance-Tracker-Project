import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

const AttendanceTable = ({ courseId, professorName }) => {
  const [attendanceData, setAttendanceData] = useState({});
  const [statusMap, setStatusMap] = useState({}); // Tracks status for each student
  const STATUS_COLORS = ["green", "blue", "red"];

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceQuery = query(
          collection(db, "Attendance"),
          where("courseId", "==", courseId),
          where("professorName", "==", professorName),
          orderBy("timestamp", "asc")
        );

        const querySnapshot = await getDocs(attendanceQuery);

        // Process data into groups by date
        const groupedData = {};
        const seenStudents = {}; // To track the first instance of each student per day

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp.toDate();

          const date = new Date(timestamp).toLocaleDateString(); // Extract date (MM/DD/YYYY)
          const studentId = data.studentId;

          // Only include the first attendance record for each student per day
          if (!seenStudents[`${studentId}-${date}`]) {
            seenStudents[`${studentId}-${date}`] = true;

            if (!groupedData[date]) {
              groupedData[date] = [];
            }
            groupedData[date].push(data);
          }
        });

        // Sort dates in reverse order (most recent first)
        const sortedGroupedData = Object.keys(groupedData)
          .sort((a, b) => new Date(b) - new Date(a)) // Sort by date descending
          .reduce((acc, date) => {
            acc[date] = groupedData[date];
            return acc;
          }, {});

        setAttendanceData(sortedGroupedData);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    if (courseId) {
      fetchAttendance();
    }
  }, [courseId, professorName]);

  // Handle status click
  const toggleStatus = (key) => {
    setStatusMap((prev) => {
      const currentStatus = prev[key] || 0; // Default to green (0)
      const nextStatus = (currentStatus + 1) % STATUS_COLORS.length; // Cycle through statuses
      return { ...prev, [key]: nextStatus };
    });
  };

  return (
    <div>
      {Object.keys(attendanceData).map((date) => (
        <div key={date} style={{ marginBottom: "20px" }}>
          <h2 style={{ fontWeight: "bold", fontSize: "16pt" }}>{date}</h2> {/* Bold and set font size */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Checked In Time</th>
                <th style={tableHeaderStyle}>Student ID</th>
                <th style={tableHeaderStyle}>Student Name</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData[date].map((record, index) => {
                const time = new Date(record.timestamp.toDate()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }); // Format time (e.g., 9:16 PM)
                const key = `${record.studentId}-${date}`;

                return (
                  <tr key={index}>
                    <td style={tableCellStyle}>{time}</td>
                    <td style={tableCellStyle}>{record.studentId}</td>
                    <td style={tableCellStyle}>{record.studentName}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => toggleStatus(key)}
                        style={{
                          ...statusButtonStyle,
                          backgroundColor: STATUS_COLORS[statusMap[key] || 0],
                        }}
                      ></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
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

const statusButtonStyle = {
  width: "20px",
  height: "20px",
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
};

export default AttendanceTable;
