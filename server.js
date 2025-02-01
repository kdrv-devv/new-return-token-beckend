// server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Ro'yxatdan o'tish
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    }
    
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Login qilish
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email va parol talab qilinadi" });
    }
    
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

const PORT = process.env.PORT || 5000;  // 5000-portni o'zgartiring
app.listen(PORT, () => console.log(`Server ${PORT} portida ishlayapti`));
