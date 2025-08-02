require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const etaxRouter = require('./routes/etax');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/etax', etaxRouter);

app.get('/', (req, res) => {
  res.redirect('/etax');
});

app.listen(PORT, () => {
  console.log(`e-Tax Web App running at http://localhost:${PORT}`);
});
