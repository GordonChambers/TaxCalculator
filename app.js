const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.use(express.static(__dirname + '/views'));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});