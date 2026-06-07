import { onValueCreated } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";

// Update stats when new meter is added
export const updateSystemStats = onValueCreated(
  { ref: "/meters/{meterId}", region: "asia-south1" },
  async (event) => {
    const db = admin.database();
    try {
      const statsRef = db.ref('/admin/systemStats/totalMeters');
      await statsRef.transaction((currentValue) => {
        return (currentValue || 0) + 1;
      });
      await db.ref('/admin/systemStats/lastUpdated').set(admin.database.ServerValue.TIMESTAMP);
    } catch (error) {
      logger.error("Error updating system stats", error);
    }
  }
);
