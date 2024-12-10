import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import firebase_admin
from firebase_admin import credentials, firestore
import random
from datetime import datetime
import time

#Intialize GPIO startup
GPIO.setmode(GPIO.BCM)

RED_PIN = 15
GREEN_PIN = 18
BLUE_PIN = 17

#Intialize LED Pins
GPIO.setup(RED_PIN, GPIO.OUT) # Red
GPIO.setup(GREEN_PIN, GPIO.OUT) # Green
GPIO.setup(BLUE_PIN, GPIO.OUT) # Blue

GPIO.output(RED_PIN, False)
GPIO.output(GREEN_PIN, False)
GPIO.output(BLUE_PIN, False)

GPIO.output(RED_PIN, True)
time.sleep(0.5)
GPIO.output(RED_PIN, False)
GPIO.output(GREEN_PIN, True)
time.sleep(0.5)
GPIO.output(GREEN_PIN, False)
GPIO.output(BLUE_PIN, True)
time.sleep(0.5)
GPIO.output(BLUE_PIN, False)

GPIO.output(RED_PIN, False)
GPIO.output(GREEN_PIN, False)
GPIO.output(BLUE_PIN, False)
# Initialize RFID reader
reader = SimpleMFRC522()

# Initialize Firebase
cred = credentials.Certificate("/home/pi/NFC/attendance-tracker-2.json")  # Replace with your Firebase service key
firebase_admin.initialize_app(cred)
db = firestore.client()

# Array of course IDs
course_ids = ["CSCI300", "CSCI380", "MATH310", "CSCI235", "MATH320", "ICBS303"]

try:
    print("Place your RFID tag near the reader...")
    while True:
        GPIO.output(RED_PIN,True)
        time.sleep(5)
        # Read the RFID tag
        _, rfid_data = reader.read()
        rfid_data = rfid_data.strip()  # Clean up the data
        # Check if the format matches (SID1111111)
        if rfid_data.startswith("SID") and rfid_data[3:].isdigit():
            GPIO.output(RED_PIN, False)
            GPIO.output(GREEN_PIN, True)
            student_id = rfid_data[3:]  # Extract "1111111"
            print(f"RFID Scanned! Student ID: {student_id}")
            
            
            # Retrieve student data from Firebase
            GPIO.output(BLUE_PIN, True)
            students_ref = db.collection("Students")
            query = students_ref.where("studentId", "==", student_id).stream()
            student_data = None
            for doc in query:
                student_data = doc.to_dict()
                break  # Assume only one result
            
            if student_data:
                student_name = student_data["studentName"]
                student_email = student_data["studentEmail"]
                print(f"Student Found: {student_name} ({student_email})")
                
                # Choose a random course ID
                course_id = random.choice(course_ids)
                
                # Retrieve professor data based on courseId
                professor_ref = db.collection("Professor")
                prof_query = professor_ref.where("courseId", "==", course_id).stream()
                professor_data = None
                for doc in prof_query:
                    professor_data = doc.to_dict()
                    break  # Assume only one result
                
                if professor_data:
                    professor_name = professor_data["professorName"]
                    professor_id = professor_data["professorId"]
                    print(f"Professor Found: {professor_name} ({professor_id})")
                    
                    # Create attendance record
                    timestamp = firestore.SERVER_TIMESTAMP
                    attendance_record = {
                        "courseId": course_id,
                        "studentEmail": student_email,
                        "studentId": student_id,
                        "studentName": student_name,
                        "professorName": professor_name,
                        "professorId": professor_id,
                        "timestamp": timestamp,
                    }
                    
                    # Add attendance record to Firebase
                    db.collection("Attendance").add(attendance_record)
                    print(f"Attendance recorded: {attendance_record}")
                    GPIO.output(GREEN_PIN, True)
                    GPIO.output(BLUE_PIN, True)
                    time.sleep(0.5)
                    GPIO.output(GREEN_PIN, False)
                    GPIO.output(BLUE_PIN, False)
                else:
                    print(f"No professor found for courseId: {course_id}")
                    GPIO.output(RED_PIN, True)
                    GPIO.output(BLUE_PIN, True)
                    time.sleep(0.5)
                    GPIO.output(RED_PIN, False)
                    GPIO.output(BLUE_PIN, False)
            else:
                print(f"No student found with ID: {student_id}")
                GPIO.output(RED_PIN, True)
                time.sleep(0.25)
                GPIO.output(RED_PIN, False)
                time.sleep(0.25)
                GPIO.output(RED_PIN, True)
                time.sleep(0.25)
                GPIO.output(RED_PIN, False)
        else:
            print(f"Invalid RFID data: {rfid_data}")
            GPIO.output(RED_PIN, False)
except KeyboardInterrupt:
    print("\nExiting program...")
finally:
    GPIO.cleanup()
