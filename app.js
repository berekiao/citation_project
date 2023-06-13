const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const cookieParser = require('cookie-parser');
const citationRoutes = require('./routes/router');
const Citation = require('./models/citation');
const authMiddleware = require('./auth/authMiddleware');


const app = express();
const upload = multer();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const db_url = 'mongodb+srv://berekiaahouandjinou:Ahouandjinou14@cluster0.dpfw1ca.mongodb.net/citation_app?retryWrites=true&w=majority';
mongoose.connect(db_url)
  .then(() => {
    app.listen(3000);
    console.log('Server started on port 3000');
  })
  .catch((err) => {
    console.log('Database connection error:', err);
  });

app.use(cookieParser());
app.use('/', citationRoutes);

// Importer le fichier excel
app.post('/citations/import', authMiddleware, upload.single('file'), (req, res) => {
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const citations = data.map(item => ({ texte: item.texte, auteur: item.auteur }));

  Citation.insertMany(citations)
    .then(() => {
      res.redirect('/citations');
    })
    .catch(error => {
      res.status(500).json({ message: error.message });
    });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/creer', (req, res)=>{
  res.render('create')
})

app.use((req, res) => {
  const message = 'Impossible d\'accéder à cette page. Veuillez essayer une autre page. Merci.';
  res.status(404).json({ message });
});
