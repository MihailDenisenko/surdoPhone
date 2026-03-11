// src/services/LocalDatabase.ts
import { openDatabaseSync } from "expo-sqlite";

const DB_NAME = "surdo_media.db";

export const db = openDatabaseSync(DB_NAME);

export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        gesture_id TEXT NOT NULL,
        gesture_name TEXT NOT NULL,
        gesture_video_url TEXT NOT NULL,
        category_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, gesture_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        gesture_id TEXT NOT NULL,
        gesture_name TEXT NOT NULL,
        gesture_video_url TEXT NOT NULL,
        category_name TEXT,
        watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_history_user_time ON history(user_id, watched_at DESC);
    `);
    console.log("🎉 Database initialized successfully");
  } catch (error) {
    console.error("❌ DB Init Error:", error);
    throw error;
  }
};

export const AuthDB = {
  register: async (
    email: string,
    password: string,
    name: string,
  ): Promise<number> => {
    const result = await db.runAsync(
      `INSERT INTO users (email, password, name) VALUES (?, ?, ?);`,
      [email, password, name],
    );
    return result.lastInsertRowId as number;
  },

  login: async (email: string, password: string): Promise<any> => {
    const result = await db.getFirstAsync<any>(
      `SELECT * FROM users WHERE email = ? AND password = ?;`,
      [email, password],
    );

    if (!result) {
      throw new Error("Invalid credentials");
    }
    return result;
  },

  getCurrentUser: async (userId: number): Promise<any> => {
    return await db.getFirstAsync<any>(`SELECT * FROM users WHERE id = ?;`, [
      userId,
    ]);
  },
};

export const FavoritesDB = {
  add: async (userId: number, gesture: any): Promise<void> => {
    await db.runAsync(
      `INSERT OR REPLACE INTO favorites (user_id, gesture_id, gesture_name, gesture_video_url, category_name) 
       VALUES (?, ?, ?, ?, ?);`,
      [
        userId,
        String(gesture.id),
        gesture.nameLink,
        gesture.videoURL,
        gesture.categoryName || "",
      ],
    );
  },

  remove: async (userId: number, gestureId: string): Promise<void> => {
    await db.runAsync(
      `DELETE FROM favorites WHERE user_id = ? AND gesture_id = ?;`,
      [userId, gestureId],
    );
  },

  getAll: async (userId: number): Promise<any[]> => {
    return await db.getAllAsync<any>(
      `SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC;`,
      [userId],
    );
  },

  isFavorite: async (userId: number, gestureId: string): Promise<boolean> => {
    const result = await db.getFirstAsync<{ val: number }>(
      `SELECT 1 as val FROM favorites WHERE user_id = ? AND gesture_id = ? LIMIT 1;`,
      [userId, gestureId],
    );
    return !!result;
  },
};

export const HistoryDB = {
  add: async (userId: number, gesture: any): Promise<void> => {
    await db.runAsync(
      `INSERT INTO history (user_id, gesture_id, gesture_name, gesture_video_url, category_name) 
       VALUES (?, ?, ?, ?, ?);`,
      [
        userId,
        String(gesture.id),
        gesture.nameLink,
        gesture.videoURL,
        gesture.categoryName || "",
      ],
    );
  },

  getRecent: async (userId: number, limit: number = 20): Promise<any[]> => {
    return await db.getAllAsync<any>(
      `SELECT * FROM history WHERE user_id = ? ORDER BY watched_at DESC LIMIT ?;`,
      [userId, limit],
    );
  },

  clear: async (userId: number): Promise<void> => {
    await db.runAsync(`DELETE FROM history WHERE user_id = ?;`, [userId]);
  },
};
