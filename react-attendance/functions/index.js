/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function to delete user by email
exports.deleteUser = functions.https.onCall(async (data, context) => {
  const { email, userId } = data;

  if (!context.auth || context.auth.token.role !== 'admin') {
    // Only allow admin users to call this function
    throw new functions.https.HttpsError('permission-denied', 'You must be an admin to delete users.');
  }

  try {
    // 1. Delete user from Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email); // Fetch user by email
    await admin.auth().deleteUser(userRecord.uid); // Delete user from Authentication

    // 2. Delete user from Firestore
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.delete();

    return { message: `User ${email} deleted successfully` };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new functions.https.HttpsError('internal', 'Error deleting user.');
  }
});
