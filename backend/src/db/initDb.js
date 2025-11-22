// Script to initialize the PostgreSQL database with required tables
import { pool } from "../config/postgres.js";
import fs from "fs";
import path from "path";

async function initDatabase() {
    try {
        console.log("Initializing database...");

        const client = await pool.connect();

        // Create matches table
        await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        lost_item_id VARCHAR(255) NOT NULL,
        found_item_id VARCHAR(255) NOT NULL,
        text_score DECIMAL(5,4),
        location_score DECIMAL(5,4),
        combined_score DECIMAL(5,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create notifications table
        await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        match_id INTEGER REFERENCES matches(id),
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE
      )
    `);

        // Create activity_logs table
        await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        action VARCHAR(100),
        item_id VARCHAR(255),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create indexes
        try {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_matches_lost_item_id ON matches(lost_item_id)`);
        } catch (err) {
            console.log("Index idx_matches_lost_item_id already exists or error creating it");
        }

        try {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_matches_found_item_id ON matches(found_item_id)`);
        } catch (err) {
            console.log("Index idx_matches_found_item_id already exists or error creating it");
        }

        try {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_matches_combined_score ON matches(combined_score)`);
        } catch (err) {
            console.log("Index idx_matches_combined_score already exists or error creating it");
        }

        try {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`);
        } catch (err) {
            console.log("Index idx_notifications_user_id already exists or error creating it");
        }

        try {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_match_id ON notifications(match_id)`);
        } catch (err) {
            console.log("Index idx_notifications_match_id already exists or error creating it");
        }

        try {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`);
        } catch (err) {
            console.log("Index idx_activity_logs_user_id already exists or error creating it");
        }

        try {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)`);
        } catch (err) {
            console.log("Index idx_activity_logs_action already exists or error creating it");
        }

        client.release();

        console.log("Database initialized successfully!");
    } catch (err) {
        console.error("Error initializing database:", err);
        throw err;
    }
}

// Run the initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initDatabase();
}

export default initDatabase;