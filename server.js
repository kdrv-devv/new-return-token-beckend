require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');  // file system moduli
const path = require('path'); // fayl yo'lini olish uchun

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const USERS_FILE = path.join(__dirname, 'users.json');  // users.json faylini belgilash

// Foydalanuvchi ro'yxatdan o'tishi
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    }

    // Foydalanuvchi ma'lumotlarini faylga yozish
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: "Faylni o'qishda xatolik" });
        }

        let users = [];
        if (data) {
            users = JSON.parse(data);  // Agar fayl bo'lsa, uni o'qib olish
        }

        // Foydalanuvchi emaili bo'yicha tekshiruv
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ message: "Bu email bilan foydalanuvchi mavjud" });
        }

        // Yangi foydalanuvchi qo'shish
        users.push({ name, email, password });  // Parolni shifrlashni unutmang, hozircha shifrlanmagan

        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: "Faylga yozishda xatolik" });
            }
            const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Foydalanuvchi login qilish
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email va parol talab qilinadi" });
    }

    // Foydalanuvchini topish va login qilish
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Faylni o'qishda xatolik" });
        }

        const users = JSON.parse(data);
        const user = users.find(user => user.email === email && user.password === password);

        if (!user) {
            return res.status(401).json({ message: "Noto'g'ri email yoki parol" });
        }

        // Token yaratish va qaytarish
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portida ishlayapti`));
