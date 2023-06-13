const express = require('express');
const cookieParser = require('cookie-parser');
const authMiddleware = require('../auth/authMiddleware');
const router = express.Router();
const Citation = require('../models/citation');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.use(cookieParser());

// Pour obtenir des citations aléatoires
router.get('/citations', async (req, res, next) => {
  try {
    const count = await Citation.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const citation = await Citation.findOne().skip(randomIndex);

    res.render('index', { citation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enregistrer une nouvelle citation
router.post('/citationAdd', authMiddleware, async (req, res) => {
  const citation = new Citation({
    texte: req.body.texte,
    auteur: req.body.auteur
  });

  try {
    await citation.save();
    res.redirect('/citations');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/users/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Cet utilisateur existe déjà' });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashPassword });
    await newUser.save();

    res.redirect('/login');  } catch (error) 
    {

    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Nom d\'utilisateur incorrect' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '24h' });

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });



    res.redirect('/citations');

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token'); 
  res.redirect('/login'); 
});




module.exports = router;
