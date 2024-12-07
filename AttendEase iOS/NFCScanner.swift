import SwiftUI
import CoreNFC
import FirebaseCore
import FirebaseFirestore
import FirebaseAuth

struct NFCCardData: Equatable, Codable {
    let courseId: String
    let professorId: String
    let professorName: String
    let timestamp: String
}

class NFCScanner: NSObject, ObservableObject, NFCNDEFReaderSessionDelegate {
    private var session: NFCNDEFReaderSession?
    private var selectedCourse: String?
    private var currentUser: User?
    @Published var lastScannedCardData: NFCCardData?
    @Published var scanError: String?
    private let db = Firestore.firestore()
    
    func beginScanning(for courseId: String, user: User) {
        guard NFCNDEFReaderSession.readingAvailable else {
            scanError = "NFC is not supported on this device"
            return
        }
        
        selectedCourse = courseId
        currentUser = user
        print("Selected course ID for scanning: \(courseId)")
        session = NFCNDEFReaderSession(delegate: self, queue: nil, invalidateAfterFirstRead: true)
        session?.alertMessage = "Hold your iPhone near the professor's course card"
        session?.begin()
    }
    
    func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {
        print("NFC session became active")
    }
    
    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        print("Detected NDEF messages: \(messages)")
        
        guard let firstMessage = messages.first,
              let firstRecord = firstMessage.records.first else {
            handleScanError("No valid records found on card")
            return
        }
        
        let payloadData = firstRecord.payload
        print("Raw payload data: \(payloadData)")
        
        if let payloadString = String(data: payloadData.dropFirst(), encoding: .utf8) {
            print("Payload string: \(payloadString)")
            processNTAG215Data(payloadString)
        } else {
            handleScanError("Unable to decode card data")
        }
    }
    
    private func processNTAG215Data(_ payload: String) {
        let components = payload.components(separatedBy: "|")
        print("Processing components: \(components)")
        
        // Expecting card data format: courseId|professorId
        guard components.count >= 2 else {
            handleScanError("Invalid card format")
            return
        }
        
        let scannedCourseId = components[0].replacingOccurrences(of: "en", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        let professorId = components[1].trimmingCharacters(in: .whitespacesAndNewlines)
        
        print("Extracted courseId: \(scannedCourseId)")
        print("Extracted professorId: \(professorId)")
        print("Selected course: \(selectedCourse ?? "nil")")
        
        guard scannedCourseId == selectedCourse else {
            handleScanError("This card is not for the selected course. Scanned: \(scannedCourseId), Selected: \(selectedCourse ?? "nil")")
            return
        }
        
        validateProfessorCard(courseId: scannedCourseId, professorId: professorId)
    }
    
    private func validateProfessorCard(courseId: String, professorId: String) {
        db.collection("Professor")
            .whereField("courseId", isEqualTo: courseId)
            .whereField("professorId", isEqualTo: professorId)
            .getDocuments { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.handleScanError("Database error: \(error.localizedDescription)")
                    return
                }
                
                guard let document = snapshot?.documents.first else {
                    self.handleScanError("Invalid professor card for this course")
                    return
                }
                
                let professorData = document.data()
                let professorName = professorData["professorName"] as? String ?? "Unknown Professor"
                
                // After validating professor, fetch student info from Students collection
                self.db.collection("Students")
                    .whereField("studentEmail", isEqualTo: self.currentUser?.email ?? "")
                    .getDocuments { studentSnapshot, studentError in
                        if let studentError = studentError {
                            self.handleScanError("Error fetching student data: \(studentError.localizedDescription)")
                            return
                        }
                        
                        guard let studentDoc = studentSnapshot?.documents.first else {
                            self.handleScanError("Student information not found")
                            return
                        }
                        
                        let studentData = studentDoc.data()
                        let studentId = studentData["studentId"] as? String ?? ""
                        let studentName = studentData["studentName"] as? String ?? ""
                        
                        let dateFormatter = DateFormatter()
                        dateFormatter.dateStyle = .short
                        dateFormatter.timeStyle = .short
                        let timestamp = dateFormatter.string(from: Date())
                        
                        // Store in Firestore database with student information
                        let attendanceData: [String: Any] = [
                            "courseId": courseId,
                            "studentEmail": self.currentUser?.email ?? "",
                            "studentId": studentId,
                            "studentName": studentName,
                            "professorId": professorId,
                            "professorName": professorName,
                            "timestamp": timestamp
                        ]
                        
                        self.db.collection("Attendance").addDocument(data: attendanceData) { error in
                            if let error = error {
                                print("Error saving to database: \(error.localizedDescription)")
                            } else {
                                print("Successfully saved attendance record to Firebase")
                            }
                        }
                        
                        // Update UI
                        DispatchQueue.main.async {
                            self.lastScannedCardData = NFCCardData(
                                courseId: courseId,
                                professorId: professorId,
                                professorName: professorName,
                                timestamp: timestamp
                            )
                            print("Attendance recorded for student: \(studentName)")
                            print("Professor: \(professorName)")
                            print("Course ID: \(courseId)")
                            print("Timestamp: \(timestamp)")
                        }
                    }
            }
    }
    
    private func handleScanError(_ message: String) {
        print("Error: \(message)")
        DispatchQueue.main.async {
            self.scanError = message
            // Show an alert to the user
            let alert = UIAlertController(title: "NFC Scan Error", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
            UIApplication.shared.windows.first?.rootViewController?.present(alert, animated: true, completion: nil)
        }
    }
    
    func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        print("Session invalidated with error: \(error.localizedDescription)")
        DispatchQueue.main.async {
            if let readerError = error as? NFCReaderError {
                switch readerError.code {
                case .readerSessionInvalidationErrorFirstNDEFTagRead:
                    print("Successfully completed reading.")
                case .readerSessionInvalidationErrorUserCanceled:
                    self.scanError = "Scanning was canceled"
                    // Show an alert to the user
                    let alert = UIAlertController(title: "NFC Scan Canceled", message: "The NFC scan was canceled.", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
                    UIApplication.shared.windows.first?.rootViewController?.present(alert, animated: true, completion: nil)
                default:
                    self.scanError = "Error: \(error.localizedDescription)"
                    // Show an alert to the user
                    let alert = UIAlertController(title: "NFC Scan Error", message: "An error occurred during the NFC scan: \(error.localizedDescription)", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
                    UIApplication.shared.windows.first?.rootViewController?.present(alert, animated: true, completion: nil)
                }
            }
        }
    }
}
