import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDJEkhpI4NNgWWozGbYpPJNvLIrvI9n4tk",
    authDomain: "attendance-tracker-e5bcb.firebaseapp.com",
    projectId: "attendance-tracker-e5bcb",
    storageBucket: "attendance-tracker-e5bcb.firebasestorage.app",
    messagingSenderId: "3413302265",
    appId: "1:3413302265:web:49670c79ecbd1488bbfb28",
    measurementId: "G-VNH05CJCTQ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Populate table with records
async function fetchRecords() {
    const recordsTable = document.getElementById("recordsTable");
    recordsTable.innerHTML = ""; // Clear the table before adding rows
    const querySnapshot = await getDocs(collection(db, "attendanceRecords"));

    querySnapshot.forEach((doc) => {
        const record = doc.data();
        const row = `
            <tr>
                <form>
                    <td><input type="text" name="firstName" value="${record.firstName}" required></td>
                    <td><input type="text" name="lastName" value="${record.lastName}" required></td>
                    <td><input type="date" name="date" value="${record.date}" required></td>
                    <td><input type="time" name="time" value="${record.time}" required></td>
                    <td><input type="checkbox" name="present" ${record.present ? "checked" : ""}></td>
                    <td>
                        <button type="button" onclick="updateRecord('${doc.id}', this)">Save</button>
                        <button type="button" onclick="deleteRecord('${doc.id}')">Delete</button>
                    </td>
                </form>
            </tr>`;
        recordsTable.innerHTML += row;
    });
}

// Add a new record
document.getElementById("addRecordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const newRecord = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        date: form.date.value,
        time: form.time.value,
        present: form.present.checked,
    };

    try {
        await addDoc(collection(db, "attendanceRecords"), newRecord);
        alert("Record added successfully!");
        form.reset();
        fetchRecords(); // Refresh the table
    } catch (error) {
        console.error("Error adding record:", error);
    }
});

// Update a record
async function updateRecord(recordId, button) {
    const row = button.closest("tr");
    const form = row.querySelector("form");
    const updatedRecord = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        date: form.date.value,
        time: form.time.value,
        present: form.present.checked,
    };

    try {
        await setDoc(doc(db, "attendanceRecords", recordId), updatedRecord);
        alert("Record updated successfully!");
    } catch (error) {
        console.error("Error updating record:", error);
    }
}

// Delete a record
async function deleteRecord(recordId) {
    try {
        await deleteDoc(doc(db, "attendanceRecords", recordId));
        alert("Record deleted successfully!");
        fetchRecords(); // Refresh the table
    } catch (error) {
        console.error("Error deleting record:", error);
    }
}

// Fetch records on page load
document.addEventListener("DOMContentLoaded", fetchRecords);

// Logout button
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}
