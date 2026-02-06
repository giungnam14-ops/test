import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Database Setup (DBeaver에서 연결 가능한 users.db 생성)
const dbPath = join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database opening error:', err);
    console.log('Connected to SQLite database.');
});

// 테이블 생성
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        picture TEXT,
        provider TEXT,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// 사용자 정보 저장 API
app.post('/api/users', (req, res) => {
    const { name, email, picture, provider } = req.body;

    const query = `INSERT OR REPLACE INTO users (name, email, picture, provider, last_login) 
                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`;

    db.run(query, [name, email, picture, provider], function (err) {
        if (err) {
            console.error('Error saving user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log(`User saved to DB: ${name} (${provider})`);
        res.json({ message: 'User saved success', id: this.lastID });
    });
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
    console.log(`Connect DBeaver to: ${dbPath}`);
});
