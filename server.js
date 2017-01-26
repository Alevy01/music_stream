var express = require('express');
var multer  = require('multer');
var pg = require('pg');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

var upload = multer({dest : '/tmp/songs'});
var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('./site'));

const file_location = "/song_location/";

var config = {
  user: 'postgres', //env var: PGUSER 
  database: 'songs', //env var: PGDATABASE 
  password: '', //env var: PGPASSWORD 
  host: 'localhost', // Server hosting the postgres database 
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};

// var pool = new pg.Pool(config);
var client = new pg.Client(config);
client.connect();

app.post('/upload', upload.array('songs', 5), function(req, res){
  num_files = req.files.length

  for(i = 0; i<num_files; i++){
    song_name = req.files[i].originalname;
    filename = req.files[i].filename;
    path = req.files[i].path;      
    owner = 'adam' 

    client.query("INSERT INTO library (parent, filename, orig_name) values ('"+owner+"', '"+filename+"', '"+song_name+"');", function(err){
      if(err){
        console.log(err);
        return;
      }
    });
    newpath = file_location+owner+'/'
    fs.rename(path, newpath+filename, function(){
      fs.unlink(path, function(){
        console.log("UNLINKED")
      })
    });
    console.log(newpath+filename);

  }
  
  res.redirect('./index.html');
});

app.get('/library', function(req, res){
  owner = 'adam'
  client.query("SELECT orig_name, filename FROM library WHERE parent='"+owner+"';", function(err, results){
    if(err){
      console.log(err);
      return;
    }
    res.json(results);
  });
});

app.get('/serve/:filename', function(req, res){
  file = req.params.filename;
  owner = 'adam'
  client.query("SELECT orig_name FROM library WHERE filename='"+file+"';", function(err, results){
    if(err){
      console.log(err);
      return;
    }
    path = file_location+owner+'/'+file;
    name = results.rows[0]['orig_name'];

    res.header('Content-Type', 'audio/mpeg')
    var stat = fs.statSync(path);
    var readStream = fs.createReadStream(path, {highWaterMark : 32 * 1024});
  
    readStream.pipe(res);
    readStream.on('data', function(chunk){
      console.log(chunk);
    })
  });
});

app.get('/stream', function(req, res){
  res.header('Content-Type', 'audio/mpeg')
  var filePath = __dirname + '/site/Views.mp3';
  var stat = fs.statSync(filePath);

  var readStream = fs.createReadStream(filePath, {highWaterMark : 32 * 1024});
  // console.log(readStream);
  readStream.pipe(res);

  readStream.on('data', function(chunk){
    console.log(chunk.length)
  })

  readStream.on('end', () =>{
    res.end();
  })
});


app.listen(8000);
