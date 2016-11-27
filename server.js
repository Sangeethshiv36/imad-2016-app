var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;
var crypto=require('crypto');
var bodyParser = require('body-parser');

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
app.use(bodyParser.json());

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

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/aboutstyle.css',function(req,res){
    res.sendFile(path.join(__dirname,'ui','aboutstyle.css'));
});

app.get('/ui/login.css',function(req,res){
    res.sendFile(path.join(__dirname,'ui','login.css'));
});

app.get('/ui/prof.jpg',function(req,res){
    res.sendFile(path.join(__dirname,'ui','prof.jpg'));
});


app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});


app.post('/create-user',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    pool.query('INSERT INTO "user" (username,password) VALUES ($1,$2)',[username,dbString],function(err,result){
         if(err){
            res.status(500).send(err.toString());
        }else{ 
            res.send('User Successfully Created : ' + username);
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

app.post('/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    pool.query('SELECT * FROM "user" WHERE username = $1',[username],function(err,result){
         if(err){
            res.status(500).send(err.toString());
        }else{ 
            if(result.rows.length === 0){
                res.send(403).send('username/password is invalid');
            }else{
            var dbString=result.rows[0].password;
            var salt=dbString.split('$')[2];
            var hashedPassword=hash(password,salt);
            if(hashedPassword === dbString){
            res.send('credentials correct');
        }else{
            res.send(403).send('username/password is invalid');
        }
            }
        }
    });
});

function hash(input,salt){
   var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
   return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function(req,res){
    var hashedString = hash(req.params.input,'random-string');
    res.send(hashedString);
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



var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
