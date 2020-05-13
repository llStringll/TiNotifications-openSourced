const User = require('../models/user.model');
const OTP = require('../models/otp.model')
const filename="./baarfoobar.extension"; // file here for societies list containing names and codes for societies
const webpush = require('web-push');
const formidable = require('formidable');
var path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const readXlsxFile = require('read-excel-file/node');
const fyrfile = "./foobarfoo.extension"; // file here for verification of legit first yr thapar students
const Crypto = require('crypto-js')
const salt = "anyrandomsaltforpwdencryption";

const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:harshveer321.code@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth:{
		user: '<mail-here>',
		pass: '<password-here>'
	}
});

//-----------------------------------------DATABASE SCRIPTS--------------------------------

// /*START of --> auto subscribe soc to all students*/
// STUDENT=[];
// SOC="";

// User.find({role:'user'},(err,ret)=>{
//    for(let i=0;i<ret.length;i++){
//       STUDENT.push(ret[i].email);
//    }
// });//now STUDENT contains all students

// //edit soc code value to subscribe to

// User.find({email:SOC.toLowerCase()+"@thapar.edu"},(err,res)=>{
//   let b=res[0].subscrips;
//   for(let i=0;i<STUDENT.length;i++){
//     User.find({email:STUDENT[i]},(err,ret)=>{
//       let a = ret[0].subscrips;
//       a.push(SOC);
//       User.findOneAndUpdate(
//       	{email:ret[0].email},
//       	{$set:{subscrips:a}},
//       	{new:true},
//       	(err,dc)=>{
//       		if(err)console.error(err);
//       		console.log("done subscribing user");
//       });
//     });
//     b.push(ret[0].email);
//   }
//   User.findOneAndUpdate(
//   	{email:res[0].email},
//   	{$set:{subscrips:b}},
//   	{new:true},
//   	(err,dc)=>{
//   		if(err)console.error(err);
//   		console.log("done subscribing soc");
//   });
// });
// /*END of --> auto subscribe soc to all students*/

/*START of --> Delete empty post*/
// console.log("for deleting");
// User.find({role:'user'},(err,ret)=>{
//   console.log("doing 1");
//   for(let i=0;i<ret.length;i++){
//   	let v= ret[i].notifs;
//     for(let j=0;j<v.length;j++){
//       if(v[j].info.length<10){
//         v.splice(j,1);
//       }
//     }
//     console.log("notifs check done for a user");
// 	User.findOneAndUpdate(
//       {email:ret[i].email},
//       {$set:{notifs:v}},
//       {new:true},
//       (err,dc)=>{
//         if(err)console.error(err);
//         console.log("empty post rem from user");
//     });
//   }
// });
//
// User.find({role:'admin'},(err,ret)=>{
//   console.log("doing 2");
//   for(let i=0;i<ret.length;i++){
//   	let v= ret[i].notifs;
//     for(let j=0;j<v.length;j++){
//       if(v[j].info.length<10){
//         v.splice(j,1);
//       }
//     }
//     console.log("notifs check done for a user");
// 	User.findOneAndUpdate(
//       {email:ret[i].email},
//       {$set:{notifs:v}},
//       {new:true},
//       (err,dc)=>{
//         if(err)console.error(err);
//         console.log("empty post rem from user");
//     });
//   }
// });
/*END of --> Delete empty post*/

/*START of --> deleting post*/
// let info="";//enter post data text here
// let soc_rp="";//enter society code in caps here
// User.find({email:soc_rp.toLowerCase()+'@thapar.edu'},(err,ret)=>{
// 	let v = ret[0].notifs;
// 	for(let i=0;i<v.length;i++){
// 		if(v[i].info.includes(info))v.splice(i,1);
// 	}
// 	User.findOneAndUpdate(
//      {email:ret[0].email},
//      {$set:{notifs:v}},
//      {new:true},
//      (err,dc)=>{
//        if(err)console.error(err);
//        console.log("given post rem from soc");
//    });
// });
// User.find({role:'user'},(err,ret)=>{
// 	for(let i=0;i<ret.length;i++){
// 		let v = ret[i].notifs;
// 		for(let j=0;j<v.length;j++){
// 			if(v[j].info.includes(info))v.splice(j,1);
// 		}
// 		User.findOneAndUpdate(
// 	      {email:ret[i].email},
// 	      {$set:{notifs:v}},
// 	      {new:true},
// 	      (err,dc)=>{
// 	        if(err)console.error(err);
// 	        console.log("given post rem from a student");
// 	    });
// 	}
// });
/*END of --> deleting post*/


//-------------------------------ACTUAL CONTROLLERS-----------------------------------

exports.chkuser = function(req,res){
	if(req.session.id==null)res.send("n");
		else res.send("y");
}

exports.getsoc = function(req,res){
	fs.readFile(filename, 'utf8', function(err, data) {
	  if (err) throw err;
	  res.send(data);
	});
};

exports.genotp = function(req,res){
	var otp = Math.floor(Math.random() * 90000) + 10000;//create otp
	let otp2 = new OTP(
		{
			otp:otp
		}
	);
	otp2.save(function(err,records){
		if(err){
			console.error("Error in saving otp");
		}
		else{
			console.log("saved otp: "+otp);
		}
	});//save otp
	transporter.sendMail({
		from: 'tinotifications.1@gmail.com',
		to: req.body.mailid,
		subject: 'OTP for activating TiNotifications account',
		text: 'Your OTP for activating TiNotifications account is '+ String(otp)
	},function(err,info){
		if(err){
			console.log(err);
			res.send("no");
		}
		else {
			console.log("OTP sent in email: "+info.response);
			res.send("ok");
		}
	});//mail otp
}

exports.user_create = function(req,res){
	var regno = req.body.reno;
	if(req.body.yr!=='1')regno="";
	let user = new User(
		{
			name: req.body.name,
			regno: regno,
			email: req.body.email,
			password: Crypto.SHA256(req.body.password+salt).toString(),
			role: "user",
			subs:"",
			logout:"",
			notifs:Array(),
			subscrips:Array(),
			bio:""
		}
	);
	OTP.find({otp:req.body.otp}, function(err,otpentry){
		if(otpentry.length==0){
			// console.log("no such OTP");
			res.send('nootp');
			res.end();
		}else{
			// console.log("OTP exists");
			if(req.body.yr=='1'){
				User.find({regno:req.body.regno},function(err,pUser){
					// console.log("pUser:",pUser);
					if(pUser.length!=0){
						// console.log("entry exists");
			    		res.send('regnois');
						res.end();
					}
					else{
						User.find({email:req.body.email},function(err,pUsr){
							if(pUsr.length!=0){
								res.send('signup');
								res.end();
							}
							else{
								// verify registration number from THAPARS database
								readXlsxFile(fyrfile).then((rows)=>{
									let cfg=0;
									for(let i=0;i<rows.length;i++,cfg++){
										if(rows[i][0]==req.body.regno){
											if(rows[i][1].toLowerCase()==req.body.name.toLowerCase()){
												console.log("gotem");
												break;
											}
										}else continue;
									}
									if(cfg>=rows.length){
										res.send('noregno');
										res.end();
									}
									else{
										console.log("adding...");
										user.save(function(err, records){
											if(err){
												console.error("Error in creating user:"+err);
											}
									    	req.session.id = records._id;
									    	// console.log("User added "+req.session.id);
									    	if(req.body.role=="user" || req.body.role=="USER"){
												fs.readFile(filename, 'utf8', function(err, data) {
												  if (err) throw err;
												  var d = JSON.parse(data);
												  for(let i=0;i<d.length;i++){
												  	// console.log("Doing subs for "+d[i]['CODES']);
													User.find( { email: d[i]['CODES'].toLowerCase()+"@thapar.edu" }, function(err,ret){//finding soc in db
														if(err){
															console.error(err);
															res.sendStatus(404);
														}
														// console.log("Codes is - "+d[i]['CODES']);
														// console.log("id is - "+ret[0]._id);
														User.findByIdAndUpdate(//add subscription to soc db
																ret[0]._id,
																{$push:{subscrips:req.body.email}},
																function(err,uuser){
																	if(err){
																		console.error(err);
																		res.sendStatus(404);
																	}
																}
															);
													});
													User.find( { email: req.body.email }, function(err,ret){//finding soc in db
														if(err){
															console.error(err);
															res.sendStatus(404);
														}
														User.findByIdAndUpdate(//add subscription to soc db
																ret[0]._id,
																{$push:{subscrips:d[i]['CODES']}},
																function(err,uuser){
																	if(err){
																		console.error(err);
																		res.sendStatus(404);
																	}
																}
															);
													});
												  }
												});
									    	}
									    	res.send('start');
										});
									}
								});
						    }
						});
					}
				});
			}
			if(req.body.yr!='1'){
				User.find({email:req.body.email},function(err,pUser){
					// console.log("pUser:",pUser);
					if(pUser.length!=0){
						// console.log("entry exists");
			    		res.send('signup');
						res.end();
					}
					else{
						user.save(function(err, records){
							if(err){
								console.error("Error in creating user:"+err);
							}
					    	req.session.id = records._id;
					    	// console.log("User added "+req.session.id);
					    	if(req.body.role=="user" || req.body.role=="USER"){
								fs.readFile(filename, 'utf8', function(err, data) {
								  if (err) throw err;
								  var d = JSON.parse(data);
								  for(let i=0;i<d.length;i++){
								  	// console.log("Doing subs for "+d[i]['CODES']);
									User.find( { email: d[i]['CODES'].toLowerCase()+"@thapar.edu" }, function(err,ret){//finding soc in db
										if(err){
											console.error(err);
											res.sendStatus(404);
										}
										// console.log("Codes is - "+d[i]['CODES']);
										// console.log("id is - "+ret[0]._id);
										User.findByIdAndUpdate(//add subscription to soc db
												ret[0]._id,
												{$push:{subscrips:req.body.email}},
												function(err,uuser){
													if(err){
														console.error(err);
														res.sendStatus(404);
													}
												}
											);
									});
									User.find( { email: req.body.email }, function(err,ret){//finding soc in db
										if(err){
											console.error(err);
											res.sendStatus(404);
										}
										User.findByIdAndUpdate(//add subscription to soc db
												ret[0]._id,
												{$push:{subscrips:d[i]['CODES']}},
												function(err,uuser){
													if(err){
														console.error(err);
														res.sendStatus(404);
													}
												}
											);
									});
								  }
								});
					    	}
					    	res.send('start');
							res.end();
						});
					}
				});
			}
		}
	});
};

exports.user_details = function(req,res){
	User.findById(req.session.id, function(err, pUser){
		if(err){
			console.error("Cant get user details:"+err);
			res.sendStatus(404);
		}
		if(pUser==null){
		}else{
			res.send(pUser);
		}
	});
};

exports.user_update = function(req,res){
	User.findByIdAndUpdate(
		req.params.id,
		{$set: req.body},
		function(err, User){
			if(err){
				console.error("Cant update user:"+err);
				res.sendStatus(404);
			};
			res.send('User updated');
		}
	);
};

exports.user_delete = function(req,res){
	User.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.error("Cant delete user:"+err);
			res.sendStatus(404);
		};
		res.send('Deleted Successfully');
	});
};

exports.user_lgout = function(req,res){
	User.findByIdAndUpdate(
		req.session.id,
		{
			$set:{
				logout:"true",
				subs:""
			}
		},
		function(err, User){
			if(err){
				console.error("Cant logout:"+err);
				res.sendStatus(404);
			};
			// console.log("marked as logged-out in db ");
		}
	);
	req.session = null;
	// console.log("Session cleared, sess: "+req.session);
	res.send('start');
};

exports.pst_admin = function(req,res){
	User.findById(req.session.id, function(err, pUser){
		if(err){
			console.error("Cant find admin:"+err);
			res.sendStatus(404);
		};
		if(pUser.role == "admin"){
			  var datalist=[];
			  var form = new formidable.IncomingForm();
			  form.multiples = true;
			  form.uploadDir = './server_data';
			  form.on('error',function(err){
			  	console.error(err);
			  });
			  //rename files properly as per pUser.email
			  form.on('file', function(field, file) {
			  	var name = pUser.email + file.name;
			  	datalist.push(name);
			     fs.rename(file.path, path.join(form.uploadDir, name),function(err){
			     	if (err)console.error("Error in renaming files:"+err);
			     	// console.log("A file renamed");
			     });
			  });
			  form.parse(req, function(err,fields,files){
			  	if (err)console.log("Errors:"+err);
							fs.readFile(filename, 'utf8', function(err, data) {
								if(err){
									console.error("Cant read file "+filename+":"+err);
								};
							  	let sobj = JSON.parse(data);
							  	var sname="";
							  	for(let s=0;s<sobj.length;s++){
							  		if(sobj[s]['NAMES']==pUser.name){
							  			// console.log("Found one");
							  			sname+=sobj[s]['CODES'];
							  			break;
							  		}
							  	}
								User.findByIdAndUpdate(//add to admin db as his/her msgs log
									req.session.id,
									{$push:{notifs:{info:sname+" "+fields.info, data:datalist, up_date:Date().slice(4,15)}}},
									function(err,uuser){
										if(err){
											console.error("Cant add to admin db:"+err);
											res.sendStatus(404);
										};
										// console.log("admin msg log updated");
									}
								);
							});
				var bcclist=[];
				var sname="";
				for(let k=0;k<pUser.subscrips.length;k++){
					bcclist.push(pUser.subscrips[k]);
					sname=pUser.email.slice(0,pUser.email.indexOf('@')).toUpperCase();
					User.find( { email: pUser.subscrips[k] }, function(err,ret){
						if(err){
							console.error(err);
						}
						if(ret.length==0){
								console.error("Cant get subscribed user to push to it, moving on");
						}
						else{
							// console.log("gotcha,:",ret[0].email,ret[0].logout,ret[0].subs);
							fs.readFile(filename, 'utf8', function(err, data) {
								if(err){
									console.error("Cant read file "+filename+":"+err);
								};
							  	let sobj = JSON.parse(data);
							  	console.log("sname:",sname);
								User.findByIdAndUpdate(//add to user db as his/her msgs
									ret[0]._id,
									{$push:{notifs:{info:sname+" "+fields.info, data:datalist, up_date:Date().slice(4,15)}}},
									function(err,uuser){
										if(err){
											console.error("Cant add to user db:"+err);
											res.sendStatus(404);
										};
										// console.log("one user updated");
									}
								);
							});
							if(ret[0].logout=="false" && ret[0].subs!=""){//user is logged in, and subs id is not empty(its empty when logged in from http device)
								// console.log("subs = "+ret[0].subs);
								var subsObj = JSON.parse(ret[0].subs);
								// console.log(subsObj);
								// console.log(fields.info+" will be pushed");
								//add to userdb as new msg
								console.log("Pushing to a user");
								webpush.sendNotification(subsObj, fields.info).catch(function(err){
									// console.log("error is:",err);
								});
							}else{
								console.log("Cant push to a user, sending normal message");
							}
						}
					}).catch(function(err){
						console.error(err);
					});
				}
				var tempbcclist=[];
				for(let b=0;b<bcclist.length;b++){
					tempbcclist.push(bcclist[b]);
					if((tempbcclist.length%500==0 && tempbcclist.length!=0) || b==bcclist.length-1){
						console.log("will send bcc now",tempbcclist.length,sname);
						myto=tempbcclist[0];
						mybcc=tempbcclist.slice(1,);
						console.log(myto,mybcc.length);
						transporter.sendMail({
							from: 'tinotifications.1@gmail.com',
							to: myto,
							bcc: mybcc,
							subject: 'TiNotifications:'+sname+' posted something new and exciting',
							text: fields.info.slice(0,1000),
							html: '<a href="https://tinotifications.in">'+fields.info.slice(0,1000)+'</a>....'
						},function(err,info){
							if(err){
								console.log("couldnt send notif in email:",err);
							}
							else {
								console.log("notif sent in email");
							}
						});
						tempbcclist=[];
					}
				}
				fs.readFile(filename, 'utf8', function(err, data) {
					var sname="";
					if(err){
						console.error("Cant read file "+filename+":"+err);
					};
				  	let sobj = JSON.parse(data);
				  	for(let s=0;s<sobj.length;s++){
				  		if(sobj[s]['NAMES']==pUser.name){
				  			// console.log("Found one");
				  			sname+=sobj[s]['CODES'];
				  			break;
				  		}
				  	}
					// console.log("sname: "+sname);
			  		res.send(sname);
				});

			  });
		}else{
			// console.log("Cant post");
			res.sendStatus(404);// not allowed to post
		}
	});
};

exports.lgin = function(req,res){
	// console.log("email:"+req.body.logemail+" password:"+req.body.logpwd);
	User.find( { email: req.body.logemail }, function(err,ret){
		if(err){
			console.error(err);
			res.sendStatus(404);
		}
		if(ret.length!=0){
			if (ret[0].email == req.body.logemail && Crypto.SHA256(req.body.logpwd+salt).toString() == ret[0].password) {
				// console.log('ret[0].id:'+ret[0].id);
				req.session.id = ret[0]._id;
				// console.log("req.session.id:"+req.session.id);
				// console.log("Logging in");
				User.findByIdAndUpdate(
				req.session.id,
				{
					$set:{
						logout:"false"
					}
				},
				function(err, User){
					if(err){
						console.error(err);
						res.sendStatus(404);
					}
					// console.log("marked as logged-in in db ");
				}
			);
				res.send('start');
			}
			else{
				// console.log("Wrong credentials");
				res.send('login');
			}
		}else{
			// console.log("Wrong credentials");
			res.send('login');
		}
	});
};

exports.add_subs = function(req,res){
		User.findByIdAndUpdate(
		req.session.id,
		{
			$set:{
				subs:JSON.stringify(req.body)
			}
		},
		function(err, User){
			if(err){
				console.error("Error in add subs:",err);
				res.sendStatus(404);
			}
			console.log("subscription added in db ");
			res.sendStatus(200);
		}
	);
}

exports.chgpwd = function(req,res){
		// console.log("id:",JSON.stringify(req.session.id))
		// console.log("newpwd:",req.body.newpwd)
		User.findById(req.session.id, function(err, pUser){
			if(Crypto.SHA256(req.body.oldpwd+salt).toString()==pUser.password){
						User.findByIdAndUpdate(
		req.session.id,
		{
			$set:{
				password:Crypto.SHA256(req.body.newpwd+salt).toString()
			}
		},
		function(err, User){
			if(err){
				console.error(err);
				res.sendStatus(404);
			}
			// console.log("password changed");
			res.send("y");
		}
	);
			}
				else{
					// console.log("password not changed");
					res.send("n");
				}
		});
}

exports.pub_key=function(req,res){
	console.log(vapidKeys.publicKey);
	var data={
		key:vapidKeys.publicKey
	};
	res.send(data);
}

exports.getNotifs = function(req,res){
	User.findById(req.session.id, function(err, pUser){
		if(err){
			console.error("ERROR IS THIS : "+err);
			res.sendStatus(404);
		}
		if(pUser==null){
		}else{
			res.send(pUser.notifs);
		}
	});
}

exports.add_sub_soc = function(req,res){
	// console.log(req.body.status);
	if(req.body.status == "SUBSCRIBE"){
		User.findById(req.session.id, function(err,pUser){
			if(err){
				console.error(err);
				res.sendStatus(404);
			}
			fs.readFile(filename, 'utf8', function(err, data) {
				if(err){
					console.error(err);
				}
				var sname=req.body.soc.toLowerCase()+"@thapar.edu";
			  	// let sobj = JSON.parse(data);
			  	// for(let s=0;s<sobj.length;s++){
			  	// 	if(sobj[s]['CODES']==req.body.soc){
			  	// 		console.log("Found one");
			  	// 		sname+=sobj[s]['NAMES'];
			  	// 		break;
			  	// 	}
			  	// }
				User.find( { email: sname }, function(err,ret){//finding soc in db
					if(err){
						console.error(err);
						res.sendStatus(404);
					}
					User.findByIdAndUpdate(//add subscription to soc db
							ret[0]._id,
							{$push:{subscrips:pUser.email}},
							function(err,uuser){
								if(err){
									console.error(err);
									res.sendStatus(404);
								}
								// console.log("subscription added");
							}
						);
				});
				User.find( { email: pUser.email }, function(err,ret){//finding soc in db
					if(err){
						console.error(err);
						res.sendStatus(404);
					}
					User.findByIdAndUpdate(//add subscription to soc db
							ret[0]._id,
							{$push:{subscrips:req.body.soc}},
							function(err,uuser){
								if(err){
									console.error(err);
									res.sendStatus(404);
								}
								// console.log("subscription added");
								res.sendStatus(201);
							}
						);
				});
			});
		});
	}
	if(req.body.status == "UNSUBSCRIBE"){
		User.findById(req.session.id, function(err,pUser){
			if(err){
				console.error(err);
				res.sendStatus(404);
			}
			fs.readFile(filename, 'utf8', function(err, data) {
			  	if (err) throw err;
				var sname=req.body.soc.toLowerCase()+"@thapar.edu";
			  	// let sobj = JSON.parse(data);
			  	// for(let s=0;s<sobj.length;s++){
			  	// 	if(sobj[s]['CODES']==req.body.soc){
			  	// 		console.log("Found one");
			  	// 		sname+=sobj[s]['NAMES'];
			  	// 		break;
			  	// 	}
			  	// }
				User.find( { email: sname }, function(err,ret){//finding soc in db
					if(err){
						console.error(err);
						res.sendStatus(404);
					}
					User.findByIdAndUpdate(//add subscription to soc db
							ret[0]._id,
							{$pull:{subscrips:pUser.email}},
							function(err,uuser){
							if(err){
								console.error(err);
								res.sendStatus(404);
							}
								// console.log("subscription removed");
							}
						);
				});
				User.find( { email: pUser.email }, function(err,ret){//finding soc in db
					if(err){
						console.error(err);
						res.sendStatus(404);
					}
					User.findByIdAndUpdate(//add subscription to soc db
							ret[0]._id,
							{$pull:{subscrips:req.body.soc}},
							function(err,uuser){
								if(err){
									console.error(err);
									res.sendStatus(404);
								}
								// console.log("subscription removed");
								res.sendStatus(201);
							}
						);
				});
			});
		});
	}
}

exports.chkpwd = function(req,res){
	User.findById(req.session.id, function(err, pUser){
		if(err){
			console.error("ERROR IS THIS : "+err);
			res.sendStatus(404);
		}
		if(pUser!=null){
			// console.log(pUser.email+", "+pUser.password);
			if(Crypto.SHA256(String(pUser.email.slice(0,pUser.email.indexOf('@')))+salt).toString()==pUser.password){
				// console.log("default pwd");
				res.send("y");
			}else{
				// console.log("no default pwd");
				res.send("n");
			}
		}
	});
}

function makepwd(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

exports.forgemail = function(req,res){
	pwd = makepwd(8);

	User.find({email:req.body.email},function(err,rec){

		if(rec.length>0){
			User.findByIdAndUpdate(//add subscription to soc db
				rec[0]._id,
				{$set:{password:Crypto.SHA256(String(pwd)+salt).toString()}},
				function(err,uuser){
					if(err){
						console.error(err);
						res.send("no");
					}else{
						console.log("pwd changed to temp pwd");
					}
				}
			);
			transporter.sendMail({
				from: 'tinotifications.1@gmail.com',
				to: req.body.email,
				subject: 'Temporary password',
				text: 'Your Temporary password:'+ String(pwd) + '. Change it after logging in for security reasons'
			},function(err,info){
				console.log("email:",req.body.email);
				if(err){
					console.log(err);
					res.send("no");
				}
				else {
					console.log("temp pwd sent in mail: "+info.response+String(pwd));
					res.send("ok");
				}
			});
		}else{
			console.log("entered email not found");
			res.send("no");
		}
	});
}
