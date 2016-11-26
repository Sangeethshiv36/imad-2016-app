var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;

var config={
    user:'sangeethshiv36',
    database:'sangeethshiv36',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(express.static(__dirname+'/public'));

var articles = {
    'article-one':{
        title:'Article One | Sangeeth Sivan',
        heading:'Be Rich',
        date:'Oct 20, 2016',
        content:
        `<p>This is the content for my first article.i am a master of my own.</p>
            <p>Trump Won,We lost.</p>
            <p>Lets Go!</p>`
    },
    'article-two':{
        title:'Article Two | SangyWarrior',
        heading:'Seriously?',
        date:'Oct 31, 2016',
        content:
        `<p>This is the content for my Second article.FUS RO DA.</p>
            <p>Skyrim.</p>
            <p>Party mode</p>`
    },
    'article-three':{
        title:'Article Three | Legend',
        heading:'Lachrymose',
        date:'Nov 10, 2016',
        content:
        `<p>This is the content for my Third article.Abiyentoo.</p>
            <p>They Hate us,cause they ain't us</p>
            <p>Welp!</p>`
    }
    
};

function createTemplate(data){
    var title = data.title;
    var heading=data.heading;
    var date=data.date;
    var content=data.content;
    var htmlTemplate=`
    <html>
    <head>
        <title>
        ${title}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1 "/>
         <link href="/ui/style.css" rel="stylesheet" />
    </head>
    <body>
        <div class="container">
        <div>
            <a href="/">Home</a>
        </div>
        <hr/>
        <h3>
            ${heading}
        </h3>
        <div>
           ${date.toDateString()}
        </div>
        <div>
            ${content}
        </div>
        </div>
    </body>
</html>`;


return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool = new Pool(config);

app.get('/test-db',function(req,res){
    pool.query('SELECT *FROM test',function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            res.send(JSON.stringify(result.rows));
        }
    });
});
app.get('/about',function(req,res){
    res.sendFile(path.join(__dirname,'ui','about.html'));
});

app.get('/blog',function(req,res){
    res.sendFile(path.join(__dirname,'ui','blog.html'));
});


app.get('/blog/:articleName',function(req,res){
    pool.query("SELECT * FROM articles WHERE title=$1",[req.params.articleName],function(err,result){
        if(err){
          res.status(500).send(err.toString());  
        }else{
            if(result.rows.length===0){
                res.status(404).send('Article not found');
            }else{
                var articleData=result.rows[0];
                res.send(createTemplate(articleData));
            }
        }
});
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/aboutstyle.css',function(req,res){
    res.sendFile(path.join(__dirname,'ui','aboutstyle.css'));
});

app.get('/ui/prof.jpg',function(req,res){
    res.sendFile(path.join(__dirname,'ui','prof.jpg'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
