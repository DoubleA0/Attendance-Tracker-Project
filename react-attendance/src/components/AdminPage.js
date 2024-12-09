import React, { useEffect, useState } from "react";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, query, collection, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AdminPage = () => {
  const [role, setRole] = useState(null); // User's role
  const [adminData, setAdminData] = useState(null); // Admin's details
  const [loading, setLoading] = useState(true); // Loading state
  const [users, setUsers] = useState([]); // All users

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      console.log(`Updated user ${userId} role to ${newRole}`);
      fetchUsers(); // Refresh user data
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Send password reset email
  const handleResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      alert("Error sending password reset email. Please try again.");
    }
  };

  // Delete user from Firestore (not Authentication)
  const handleDeleteUser = async (userId) => {
    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", userId));

      // Display success message
      alert(`User with ID ${userId} has been deleted successfully`);

      // Refresh user list after deletion
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);

            if (userData.role === "admin") {
              const adminQuery = query(
                collection(db, "Admin"),
                where("adminEmail", "==", user.email)
              );
              const adminSnapshot = await getDocs(adminQuery);

              if (!adminSnapshot.empty) {
                const adminInfo = adminSnapshot.docs[0].data();
                setAdminData(adminInfo);
              } else {
                console.error("No admin data found for this email.");
              }

              fetchUsers(); 
            }
          } else {
            console.error("User role not found in users collection.");
          }
        } catch (error) {
          console.error("Error fetching user/admin data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (role !== "admin") {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ padding: "20px", flex: 1, marginLeft: "10px" }}>
        <h1>
          <span style={{ fontSize: "28px" }}>
            Welcome, <span style={{ fontWeight: "bold" }}>{adminData?.adminName || "Instructor"}</span>!
          </span>
        </h1>
        <p>Manage roles and settings here.</p>
        <div>
          <h2>User Management</h2>
          {users.length > 0 ? (
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Role</th>
                  <th className="border px-4 py-2">Support</th>
                  <th className="border px-4 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-4 py-2">{u.email}</td>
                    <td className="border px-4 py-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="admin">Admin</option>
                        <option value="instructor">Instructor</option>
                      </select>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleResetPassword(u.email)}
                        className="p-1 text-white bg-blue-500 rounded"
                      >
                        Reset Password
                      </button>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleDeleteUser(u.id)} // Trigger delete function
                        className="p-1 text-white bg-red-500 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
