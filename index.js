const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const fetch      = require("node-fetch");
const cheerio    = require('cheerio');
const mysql      = require('mysql');
const port       = process.env.PORT || 3000;

app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});
connection.connect();

app.get('/', (req, res)=>{
    connection.query('SELECT * FROM products', (err, result)=>{
        if (err) throw err;
        // console.log(result);
        res.render('products.ejs', {products: result});
    });
});

app.get('/new', (req, res)=>{
    res.render('add.ejs');
});

app.post('/new', (req, res)=>{
    fetch(req.body.link)
    .then(response => response.text())
    .then(response =>{
       const $ = cheerio.load(response);
       let name = $('.wt-text-body-03.wt-line-height-tight.wt-break-word.wt-mb-xs-1').text().trim();
       let price = parseFloat($('.wt-text-title-03.wt-mr-xs-2').text().trim().substring(1));
       let image = $('.wt-max-width-full.wt-horizontal-center.wt-vertical-center.carousel-image.wt-rounded').attr('src').trim();
       connection.query(`INSERT INTO products (pName, pImage, price) VALUES ('${name}', '${image}', ${price})`, (err, result)=>{
           if(err) throw err;
           res.redirect('/');
       })
    });
});

app.get('/products/id=:id', (req, res)=>{
    connection.query(`SELECT * FROM products WHERE id=${req.params.id}`, (err, result)=>{
        if(err) throw err;
        res.render('product.ejs', {product: result[0]});
    })
})

app.listen(port, ()=>{
    console.log('app is up and running');
});