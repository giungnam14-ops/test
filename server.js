import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OAuth2Client } from 'google-auth-library';

// ES Module 환경에서 __dirname 만들기
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4005;
const GOOGLE_CLIENT_ID = "732049580459-f80e0jkf6n2n7m9k8m8r9.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// =========================
// SQLite DB 연결
// =========================
const dbPath = join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SQLite 연결 실패:', err.message);
    } else {
        console.log('SQLite DB 연결 성공');
        console.log('DB 경로:', dbPath);
    }
});

// =========================
// users 테이블 생성
// =========================
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      picture TEXT,
      provider TEXT,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// =========================
// 로그인 사용자 저장 API (Verified)
// =========================
app.post('/api/users', async (req, res) => {
    const { name, email, picture, provider, credential } = req.body;

    let finalUser = { name, email, picture, provider };

    // Google 토큰이 전달된 경우 서버 사이드에서 직접 검증 수행
    if (provider === 'google' && credential) {
        try {
            console.log("[Auth] Verifying Google Token...");
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (payload) {
                finalUser = {
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture,
                    provider: 'google'
                };
                console.log("[Auth] Token verified for:", finalUser.email);
            }
        } catch (error) {
            console.error("[Auth] Google token verification failed:", error);
            return res.status(401).json({ error: 'Invalid Google Token' });
        }
    }

    const query = `
    INSERT OR REPLACE INTO users (name, email, picture, provider, last_login)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

    db.run(query, [finalUser.name, finalUser.email, finalUser.picture, finalUser.provider], function (err) {
        if (err) {
            console.error('사용자 저장 실패:', err);
            return res.status(500).json({ error: 'DB error' });
        }
        console.log(`User saved to DB: ${finalUser.name} (${finalUser.provider})`);
        res.json({ message: 'User saved successfully', id: this.lastID });
    });
});

// 테스트용 API
app.get('/test-db', (req, res) => {
    db.run(
        `INSERT INTO users (name, email, picture, provider) VALUES (?, ?, ?, ?)`,
        ['테스트유저', 'test@test.com', '', 'test'],
        function (err) {
            if (err) return res.status(500).send(err.message);
            res.send('DB 저장 성공 (DBeaver에서 새로고침 하세요)');
        }
    );
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
