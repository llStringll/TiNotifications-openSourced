/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var cookieSession = require('cookie-session');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const user = require('./routes/user.route');
var https = require('https');
const workboxBuild = require('workbox-build');

const mongoose = require('mongoose');
let dev_db_url = 'mongodb-database-url-here';
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, {useNewUrlParser:true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cookieSession({
	name:'some-name-here',
	keys:['aa','bb','cc','ddd'],
	maxAge:30*24*60*60*1000
}));

app.use(express.static(__dirname + '/build'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/users', user);

app.post('/start', (req, res, next) => {
	console.log("redirecting /start, sess: "+req.session.id);
	if (!req.session.id)
		res.send('log_sig.html');
	else
		res.send('main.html');
});

app.get('/get_img/:id',function(req,res,next){
  console.log(__dirname+'/server_data/'+req.params.id);
	res.sendFile(__dirname+'/server_data/'+req.params.id,function(err){
    if(err)next();
  });
});

app.get('/noweblink',function(req,res,next){
	res.redirect('/oops.html');
});

// app.get('/connect',(req,res,next)=>{
// 	console.log("Someone's connecting");
// 	res.sendStatus(200);
// });

app.use(redUnmatched);

function redUnmatched(req,res){ // at anything except [index.html,log_sig.html,login.html,main.html,oops.html,signup.html]
	res.redirect('/oops.html');
}

let port = process.argv[2] || 8000;

// port => 8080:database, 8081:css|images|js, 8082:html|allOther
// these port requests are configured with a reverse proxy, using nginx here

workboxBuild.injectManifest({
   swSrc: 'app/sw.js',
   swDest: 'build/sw.js',
   globDirectory: 'build',
   globPatterns: [
     'log_sig.html',
     'main.html',
     'index.html',
     'signup.html',
     'login.html',
     'css/*.*',
     'js/main.js',
     'images/profile/*.*',
     'images/touch/images/*.*',
     'img/*.*',
     'img/attachments/*.*',
     'manifest.json'
   ]
 }).then(resources => {
   console.log(`Injected ${resources.count} resources for precaching, ` +
       `totaling ${resources.size} bytes.`);
 }).catch(err => {
   console.log('Uh oh 😬', err);
 });

app.listen(port,function(){
	console.log("Its on",port);
});

// other start script of package json
// "start": "gulp && concurrently --kill-others \"gulp watch\" \"node server.js 8080\""
