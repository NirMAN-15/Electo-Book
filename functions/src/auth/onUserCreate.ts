import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const db = admin.database();
  
  const userProfile = {
    name: user.displayName || "New User",
    email: user.email || "",
    phone: user.phoneNumber || "",
    role: "consumer",
    meterId: "", // To be assigned later
    createdAt: admin.database.ServerValue.TIMESTAMP,
    language: "en"
  };

  try {
    await db.ref(`/users/${user.uid}/profile`).set(userProfile);
    
    // Increment total users stat
    const statsRef = db.ref('/admin/systemStats/totalUsers');
    await statsRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
    });

    functions.logger.info(`Successfully created profile for user ${user.uid}`);
  } catch (error) {
    functions.logger.error(`Error creating profile for user ${user.uid}`, error);
  }
});
