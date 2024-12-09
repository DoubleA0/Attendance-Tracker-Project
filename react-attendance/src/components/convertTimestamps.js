import { collection, Timestamp, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const convertTimestampsToFirestore = async () => {
    try {
      // Reference to the Attendance collection
      const attendanceCollection = collection(db, "Attendance");
  
      // Fetch all documents in the Attendance collection
      const querySnapshot = await getDocs(attendanceCollection);
  
      querySnapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
  
        // Check if timestamp is a string
        if (typeof data.timestamp === "string") {
          try {
            // Convert string timestamp to a Date object
            const date = new Date(data.timestamp);
            if (!isNaN(date.getTime())) {
              // Convert to Firestore Timestamp and update the document
              const firestoreTimestamp = Timestamp.fromDate(date);
              const docRef = doc(db, "Attendance", docSnapshot.id);
  
              await updateDoc(docRef, { timestamp: firestoreTimestamp });
              console.log(`Updated document: ${docSnapshot.id}`);
            } else {
              console.error(`Invalid date format for document: ${docSnapshot.id}`);
            }
          } catch (err) {
            console.error(`Error parsing timestamp for document: ${docSnapshot.id}`, err);
          }
        }
      });
  
      console.log("Timestamp conversion complete!");
    } catch (error) {
      console.error("Error converting timestamps:", error);
    }
  };

  export default convertTimestampsToFirestore;