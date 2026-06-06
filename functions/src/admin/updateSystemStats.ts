import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Update stats when new meter is added
export const updateSystemStats = functions.database.ref("/meters/{meterId}")
  .onCreate(async (snapshot, context) => {
    const db = admin.database();
    try {
      const statsRef = db.ref('/admin/systemStats/totalMeters');
      await statsRef.transaction((currentValue) => {
        return (currentValue || 0) + 1;
      });
      await db.ref('/admin/systemStats/lastUpdated').set(admin.database.ServerValue.TIMESTAMP);
    } catch (error) {
      functions.logger.error("Error updating system stats", error);
    }
  });
