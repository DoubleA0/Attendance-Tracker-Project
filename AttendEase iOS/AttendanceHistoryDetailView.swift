//
//  AttendanceHistoryDetailView.swift
//  Attendance Scanner FP
//
//  Created by Steven Kurt on 12/4/24.
//

import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct AttendanceRecord: Identifiable {
    let id: String
    let courseId: String
    let professorId: String
    let professorName: String
    let timestamp: String
}

struct AttendanceHistoryDetailView: View {
    let user: User
    let course: Course
    @State private var attendanceRecords: [AttendanceRecord] = []
    @State private var isLoading = true

    var body: some View {
        VStack {
            Text("\(course.name) Attendance History")
                .font(.title)
                .bold()
                .padding()

            if isLoading {
                ProgressView()
                    .padding()
            } else if attendanceRecords.isEmpty {
                Text("No attendance records available.")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .padding()
            } else {
                List(attendanceRecords) { record in
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Professor: \(record.professorName)")
                            .font(.headline)
                        Text("Course ID: \(record.courseId)")
                            .font(.subheadline)
                        Text("Date: \(formatDate(record.timestamp))")
                            .font(.subheadline)
                        Text("Time: \(formatTime(record.timestamp))")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .padding(.vertical, 5)
                }
            }
        }
        .onAppear {
            loadAttendanceRecords()
        }
    }

    private func loadAttendanceRecords() {
        isLoading = true
        let db = Firestore.firestore()
        db.collection("Attendance")
            .whereField("courseId", isEqualTo: course.id)
            .whereField("studentEmail", isEqualTo: user.email ?? "")
            .getDocuments { (querySnapshot, error) in
                if let error = error {
                    print("Error getting documents: \(error)")
                } else {
                    self.attendanceRecords = querySnapshot?.documents.compactMap { document -> AttendanceRecord? in
                        let data = document.data()
                        return AttendanceRecord(
                            id: document.documentID,
                            courseId: data["courseId"] as? String ?? "",
                            professorId: data["professorId"] as? String ?? "",
                            professorName: data["professorName"] as? String ?? "",
                            timestamp: data["timestamp"] as? String ?? ""
                        )
                    } ?? []
                }
                self.isLoading = false
            }
    }

    private func formatDate(_ dateString: String) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MM/dd/yy, h:mm a"
        if let date = dateFormatter.date(from: dateString) {
            dateFormatter.dateFormat = "MMMM d, yyyy"
            return dateFormatter.string(from: date)
        }
        return dateString
    }

    private func formatTime(_ dateString: String) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MM/dd/yy, h:mm a"
        if let date = dateFormatter.date(from: dateString) {
            dateFormatter.dateFormat = "h:mm a"
            return dateFormatter.string(from: date)
        }
        return dateString
    }
}
