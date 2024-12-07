//
//  AttendanceManager.swift
//  Attendance Scanner FP
//
//  Created by Steven Kurt on 12/4/24.
//

import SwiftUI
import FirebaseCore
import FirebaseFirestore
import FirebaseAuth

class AttendanceManager: ObservableObject {
    static let shared = AttendanceManager()
    private let db = Firestore.firestore()
    
    struct AttendanceRecord: Identifiable {
        let id: UUID = UUID()
        let courseId: String
        let professorId: String
        let professorName: String
        let timestamp: String
    }
    
    @Published var attendanceHistory: [String: [AttendanceRecord]] = [:]
    
    func markAttendance(course: String, professorId: String, professorName: String, timestamp: String, user: User?) {
        let courseId = getCourseId(for: course)
        
        let record = AttendanceRecord(
            courseId: courseId,
            professorId: professorId,
            professorName: professorName,
            timestamp: timestamp
        )
        
        if var history = attendanceHistory[course] {
            history.append(record)
            attendanceHistory[course] = history
        } else {
            attendanceHistory[course] = [record]
        }
        
        let attendanceData: [String: Any] = [
            "courseId": courseId,
            "professorId": professorId,
            "professorName": professorName,
            "timestamp": timestamp
        ]
        
        db.collection("Attendance").addDocument(data: attendanceData) { error in
            if let error = error {
                print("Error adding attendance record: \(error)")
            } else {
                print("Successfully added attendance record to Firebase")
            }
        }
    }
    
    func getAttendance(for course: String, user: User, completion: @escaping ([AttendanceRecord]) -> Void) {
        let courseId = getCourseId(for: course)
        
        if let cachedRecords = attendanceHistory[course] {
            completion(cachedRecords)
            return
        }
        
        db.collection("Attendance")
            .whereField("courseId", isEqualTo: courseId)
            .getDocuments { [weak self] snapshot, error in
                if let error = error {
                    print("Error getting documents: \(error)")
                    completion([])
                    return
                }
                
                guard let documents = snapshot?.documents else {
                    print("No documents found")
                    completion([])
                    return
                }
                
                let records = documents.map { doc -> AttendanceRecord in
                    let data = doc.data()
                    return AttendanceRecord(
                        courseId: data["courseId"] as? String ?? "",
                        professorId: data["professorId"] as? String ?? "",
                        professorName: data["professorName"] as? String ?? "",
                        timestamp: data["timestamp"] as? String ?? ""
                    )
                }
                
                DispatchQueue.main.async {
                    self?.attendanceHistory[course] = records
                    completion(records)
                }
            }
    }
    
    private func getCourseId(for courseName: String) -> String {
        switch courseName {
        case "CSCI 380: Intro to Software Engineering":
            return "380"
        case "CSCI 300: Database Management":
            return "300"
        case "CSCI 235: Elements of Discrete Structures":
            return "235"
        case "MAT 210: Linear Algebra":
            return "210"
        default:
            return ""
        }
    }
}
