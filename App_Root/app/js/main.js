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

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log(`Service Worker registed! Scope: ${registration.scope}`);
//       })
//       .catch(err => {
//         console.error(`Service Worker registration failed: ${err}`);
//       });
//   });
// }

function subs_check(){
	if ('serviceWorker' in navigator) {
	  navigator.serviceWorker.register('sw.js').then(function(reg) {
	    console.log('Service Worker Registered!, now checking subs', reg);

	    reg.pushManager.getSubscription().then(function(sub) {
	      if (sub === null) {
	        // Update UI to ask user to register for Push
	        console.log('Not subscribed to push service!');
	          fetch('users/get_pub_key',{
	        	method:'post'
	          }).then(function(resp){
	            return resp.json();
	          }).then(function(j){
	            // console.log("j="+j.key);
	            publickey=j.key;
	            // console.log("public key:, "+publickey);
	            subscribeUser(String(publickey));   
	          }).catch(function(err){
	            console.error("Subscripton failed: "+err);
	          });        
	      } else {
	        // // We have a subscription, update the database
	        // console.log('Subscription object: ', sub);
	        // const subsObject = JSON.stringify(sub);//send this to server as JSON and save it
	        // fetch('/users/add_subs',{
	        // 	method:'POST',
	        // 	headers:new Headers({'Content-Type': 'application/json'}),
	        // 	body:subsObject
	        // }).then(function(resp){
	        // 	console.log("subscription saved");
	        // }).catch(function(err){
	        // 	console.log(err);
	        // });        
	      }
	    });
	  }).catch(function(err) {
	    console.error('Service Worker registration failed: ', err);
	  });
	}
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeUser(publickey) {
	//get public key
  // console.log(typeof(publickey));
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(reg) {
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:urlBase64ToUint8Array(publickey)//put public key here
      }).then(function(sub) {
      	// console.log("Actual sub obj stored in db: "+JSON.stringify(sub));
       //  console.log('Endpoint URL: ', sub.endpoint);
        const subsObject = JSON.stringify(sub);//send this to server as JSON and save it
        fetch('/users/add_subs',{
        	method:'POST',
        	headers:new Headers({'Content-Type': 'application/json'}),
        	body:subsObject
        }).then(function(resp){
        	console.log("subscription saved");
        }).catch(function(err){
        	console.error("Subscription not saved:"+err);
        });
      }).catch(function(e) {
        if (Notification.permission === 'denied') {
          console.warn('Permission for notifications was denied');
        } else {
          console.error('Unable to subscribe to push', e);
        }
      });
    })
  }
}

function unsubscribeUser() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then(function(reg) {
		  reg.pushManager.getSubscription()
		  .then(function(subscription) {
		    if (subscription) {
		      return subscription.unsubscribe();
		    }
		  }).catch(function(error) {
		    console.error('Error unsubscribing', error);
		  }).then(function() {
		    console.log('User is unsubscribed.');
		  });			
		});
	}
}

function changeto(role){
	if(role=='home'){
	  	document.getElementById('home-cont').style.display = 'block';
	  	document.getElementById('prof-cont').style.display = 'none';
	  	document.getElementById('search-cont').style.display = 'none';
	  	document.getElementById('settings').style.display = 'none';
	}
	if(role=='search'){
	  	document.getElementById('home-cont').style.display = 'none';
	  	document.getElementById('prof-cont').style.display = 'none';
	  	document.getElementById('search-cont').style.display = 'block';
	  	document.getElementById('settings').style.display = 'none';
	}
	if(role=='profile'){	
	  	document.getElementById('home-cont').style.display = 'none';
	  	document.getElementById('prof-cont').style.display = 'block';
	  	document.getElementById('search-cont').style.display = 'none';
	  	document.getElementById('settings').style.display = 'block';
	}
}

function genotp(){
	var email = document.getElementById('email').value;
	var yr = document.getElementById('year').value;
	if (email=="" || (!email.includes("thapar.edu")) && yr!='1'){
		if(email=="" || (!email.includes("thapar.edu")) && yr!='1'){
			document.getElementById('msg-email').style.display="block";	
		}else document.getElementById('msg-email').style.display="none";
		return;
	}
	if(email!="" && email.includes("thapar.edu")){
		document.getElementById('msg-email').style.display="none";	
	}
	document.getElementById("check").style.display="block";
	document.getElementById("check-back").style.display="block";
	var data={
		mailid : email
	};
	const headers = new Headers({'Content-Type': 'application/json'});
	const body = JSON.stringify(data);	
	fetch('/users/genotp', {
	method: 'POST',
	headers: headers,
	body:body
	}).then(function(resp){
		return resp.text();
	}).then(function(j){
		if(j == "ok"){
			document.getElementById("check").style.display="none";
			document.getElementById("check-back").style.display="none";
			alert("OTP has been sent to "+data.mailid+", do check the SPAM folder!");
		}
		else{
			document.getElementById("check").style.display="none";
			document.getElementById("check-back").style.display="none";
            alert("We had some problem getting to that address right now, sorry!");
		}
	}).catch(function(err){
		console.error("OTP generation failed:"+err);
	});
}

function signupDB(){
	var usrname = document.getElementById('usrname').value;
	var regno = document.getElementById('regno').value;
	var yr = document.getElementById('year').value;
	var email = document.getElementById('email').value;
	var pwd = document.getElementById('pwd').value;
	var role = "user";
	var otp = document.getElementById('otp').value;

	if (usrname=="" || (email=="" && regno=="") || (!email.includes("thapar.edu") && yr!='1') || pwd=="" || otp==""){
		if(usrname==""){
			document.getElementById('msg-name').style.display="block";
		}else document.getElementById('msg-name').style.display="none";
		if(!email.includes("thapar.edu") && yr!='1'){
			document.getElementById('msg-email').style.display="block";	
		}else document.getElementById('msg-email').style.display="none";
		if(email==""){
			document.getElementById('msg-email').style.display="block";	
		}else document.getElementById('msg-email').style.display="none";
		if(regno=="" && yr=='1'){
			document.getElementById('msg-regno').style.display="block";	
		}else document.getElementById('msg-regno').style.display="none";		
		if(pwd==""){
			document.getElementById('msg-pwd').style.display="block";
		}else document.getElementById('msg-pwd').style.display="none";
		if(otp==""){
			document.getElementById('msg-otp').style.display="block";
		}else document.getElementById('msg-otp').style.display="none";
		return;
	}
	document.getElementById("check").style.display="block";
	document.getElementById("check-back").style.display="block";	
	if(usrname!=""){
		document.getElementById('msg-name').style.display="none";
	}
	if(email!="" && email.includes("thapar.edu")){
		document.getElementById('msg-email').style.display="none";	
	}
	if(regno!=""){
		document.getElementById('msg-regno').style.display="none";	
	}	
	if(pwd!=""){
		document.getElementById('msg-pwd').style.display="none";
	}
	if(otp!=""){
		document.getElementById('msg-otp').style.display="none";
	}
	if(yr!='1')regno="";
	const data = {
	name: usrname,
	regno: regno,
	yr: yr,
	email: email,
	password: pwd,
	role: role,
	otp: otp
	};
	const headers = new Headers({'Content-Type': 'application/json'});
	const body = JSON.stringify(data);
	fetch('/users/create', {
	method: 'POST',
	headers: headers,
	body: body
	}).then(function(resp){
		return resp.text();
	}).then(function(t){
		if(t.includes("signup")){
			alert("Entered email already exists!");
			// window.location = './signup.html';
			document.getElementById("check").style.display="none";
			document.getElementById("check-back").style.display="none";
		}
		else if(t.includes("regnois")){
			alert("Entered reg. no. already exists!");
			// window.location = './signup.html';
			document.getElementById("check").style.display="none";
			document.getElementById("check-back").style.display="none";			
		}
		else if(t.includes("noregno")){
			alert("Entered reg. no. and name pair doesnt match");
			// window.location = './signup.html';
			document.getElementById("check").style.display="none";
			document.getElementById("check-back").style.display="none";			
		}
		else if(t.includes("nootp")){
			alert("Wrong OTP!");
			// window.location = './signup.html';
			document.getElementById("check").style.display="none";
			document.getElementById("check-back").style.display="none";			
		}
		else{
            fetch('/start',{
            	method:'post'
            }).then(function(resp){
                return resp.text();
            }).then(function(t){
                if(t.includes('main')) window.location = './main.html'
                else window.location = './log_sig.html'
            }).catch(function(err){
                // document.getElementById("nocon").style.display = "block";
            });
		}
	}).catch(function(err){
		console.error("Signup failed:"+err);
	});
}

function lgout(){
	document.getElementById("check").style.display="block";
	document.getElementById("check-back").style.display="block";	
	fetch('/users/logout', {
		method: 'post'
		}).then(function(resp){
			return resp.text();
		}).then(function(t){
			if(t.includes('start')){
	            fetch('/start',{
	            	method:'post'
	            }).then(function(resp){
	                return resp.text();
	            }).then(function(t){
	                if(t.includes('main')) window.location = './main.html'
	                else window.location = './log_sig.html'
	            }).catch(function(err){
	                // document.getElementById("nocon").style.display = "block";
	            });			
			}
		}).catch(function(err){
			console.error("Logout failed:"+err);
		});
		unsubscribeUser();
}

function chgpwd(){
	//do all
	const data = {
	oldpwd:document.getElementById('oldpwd').value,
	newpwd:document.getElementById('newpwd').value
	};
	const headers = new Headers({'Content-Type': 'application/json'});
	const body = JSON.stringify(data);	
	fetch('/users/chgpwd', {
	method: 'POST',
	headers: headers,
	body: body
	}).then(function(resp){
		return resp.text();
	}).then(function(r){
		if(r!="y"){
			document.getElementById("chgpwdmsg").style.display="block";
		}else{
			document.getElementById("chgpwdmsg").style.display="none";
			alert("Password changed successfully");
			document.getElementById("chpwd-side").style.display="none";			
		}
	}).catch(function(err){
		console.error("pwd change failed:"+err);
	});
}

function lgin(){
	document.getElementById("check").style.display="block";
	document.getElementById("check-back").style.display="block";
	const data={
		logemail:document.getElementById('logemail').value,
		logpwd:document.getElementById('logpwd').value
	};
	const headers = new Headers({'Content-Type': 'application/json'});
	const body = JSON.stringify(data);
	fetch('/users/lgin',{
		method:'POST',
		headers: headers,
		body:body
	}).then(function(resp){
		return resp.text();
	}).then(function(t){
		if(t.includes('login')){
			document.getElementById("check").style.display="none";
			document.getElementById("check-back").style.display="none";
			document.getElementById("msg-email").style.display="block";
		}else{
            fetch('/start',{
            	method:'post'
            }).then(function(resp){
                return resp.text();
            }).then(function(t){
                if(t.includes('main')) window.location = './main.html'
                else window.location = './log_sig.html'
            }).catch(function(err){
                // document.getElementById("nocon").style.display = "block";
            });
		}
	}).catch(function(err){
		console.error("Login failed:"+err);
	});
}

var formData = new FormData();
var count = 0;
$('.upload-btn').on('click', function (){
	$('#upload-input').click();
});
$('#upload-input').on('change',function(){
	// console.log("on change");
	var files = $(this).get(0).files;

	for(var i=0;i<files.length;i++){
		var file = files[i];
		formData.append('uploads[]',file, file.name);
		count+=1;
	}
	document.getElementById("prog").innerHTML = String(count) + " files attached";
	document.getElementById('prog').style.display = 'block';
});

function postAdmin(){
	document.getElementById("prog").innerHTML = "Uploading files";
	var info = document.getElementById('post').value;
	var data={
		info:info
	};
	formData.append('info', data.info);
	fetch('/users/post_as_admin',{
		method:'POST',
		body:formData
	}).then(function(resp){
		// console.log(resp);
		formData.delete('uploads[]');
		count = 0;
		return resp.text();
	}).then(function(j){
		// console.log("j: "+j);
		let data = {
			info:info,
			socname:j
		}
		get_notifs_inst();	
	}).catch(function(err){
		console.error("Failed to post as admin:"+err);
	});
	document.getElementById("post").value="";
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function get_notifs_inst(){
	fetch('/users/get_notifs',{
    	method:'post'
	}).then(function(resp){
			return resp.json();
	}).then(function(j){
		updateUI3(j);//j are all notifs in db as json
		document.getElementById('prog').style.display = 'none';	
	}).catch(function(err){
		console.error("Failed to get notifs:"+err);
	});		
}

function get_notifs(role){
	fetch('/users/get_notifs',{
		method:'post'
	}).then(function(resp){
			return resp.json();
	}).then(function(j){
		if(role=="user")
			updateUI(j);
		else{
			updateUI2(j);
		}
	}).catch(function(err){
		console.error("Failed to get notifs:"+err);
	});
}

function updateUI(data) {//for user
		for(let i=0;i<data.length;i++){
			var alldata = data[i].info;
			var msg = formatting(alldata.slice(alldata.indexOf(" ")+1,alldata.length));
			// console.log("msg: "+msg);
			var socname = alldata.slice(0,alldata.indexOf(" ")).toUpperCase();
			if(socname.includes("HOSTEL"))socname = "HOSTEL "+socname.slice(6);
			var val='&#9734;';	
			if(data[i].up_date != null)
				var up_date = data[i].up_date;
			else
				var up_date = "none";
			if(data[i].data.length>0){
					const item =
					     `<div class="card-msg">
							<h4>${socname.toUpperCase()}</h4>
					       	<p id="msg-in">${urlify(msg)}</p>
					       	${data[i].data.map(attch => `<li id="msg-in"><a href="../get_img/${attch}" target="_blank">Attacment</li>`)}
					       	<p id="up_date">${up_date}</p>
					     </div>`;
					document.getElementById('user_post-in').insertAdjacentHTML('afterBegin', item);
					
			}else{
					const item =
				     	`<div class="card-msg">
				    	   	<h4>${socname.toUpperCase()}</h4>
				       		<p id="msg-in">${urlify(msg)}</p>
				       		<p id="up_date">${up_date}</p>
				    	 </div>`;
					document.getElementById('user_post-in').insertAdjacentHTML('afterBegin', item);
					
			}
		}			
}

function updateUI2(data) {//for admin
		for(let i=0;i<data.length;i++){
			var alldata = data[i].info;
			var msg = formatting(alldata.slice(alldata.indexOf(" ")+1,alldata.length));
			// console.log("msg: "+msg);
			var socname = alldata.slice(0,alldata.indexOf(" ")).toUpperCase();
			if(socname.includes("HOSTEL"))socname = "HOSTEL "+socname.slice(6);
			var val='&#9734;';	
			if(data[i].up_date != null)
				var up_date = data[i].up_date;
			else
				var up_date = "none";
			if(data[i].data.length>0){
					const item =
					     `<div class="card-msg" id="msg${i}">
							<h4>${socname.toUpperCase()}</h4>
					       	<p id="msg-in">${urlify(msg)}</p>
					       	${data[i].data.map(attch => `<li id="msg-in"><a href="../get_img/${attch}" target="_blank">Attacment</li>`)}
					       	<p id="up_date">${up_date}</p>
					     </div>`;
					document.getElementById('sent').insertAdjacentHTML('afterBegin', item);
			}else{
					const item =
				     	`<div class="card-msg" id="msg${i}">
				    	   	<h4>${socname.toUpperCase()}</h4>
				       		<p id="msg-in">${urlify(msg)}</p>
				       		<p id="up_date">${up_date}</p>
				    	 </div>`;
					document.getElementById('sent').insertAdjacentHTML('afterBegin', item);
			}
		}			
}

function updateUI3(data){// for after new upload at admin side
	    var node = document.getElementById("sent");            
            while (node.hasChildNodes()) {
              node.removeChild(node.lastChild);
            }
		for(let i=0;i<data.length;i++){
			var alldata = data[i].info;
			var msg = formatting(alldata.slice(alldata.indexOf(" ")+1,alldata.length));
			// console.log("msg: "+msg);
			var socname = alldata.slice(0,alldata.indexOf(" ")).toUpperCase();
			if(socname.includes("HOSTEL"))socname = "HOSTEL "+socname.slice(6);
			var val='&#9734;';		
			if(data[i].up_date != null)
				var up_date = data[i].up_date;
			else
				var up_date = "none";
			if(data[i].data.length>0){
					const item =
					     `<div class="card-msg" id="msg${i}">
							<h4>${socname.toUpperCase()}</h4>
					       	<p id="msg-in">${urlify(msg)}</p>
					       	${data[i].data.map(attch => `<li id="msg-in"><a href="../get_img/${attch}" target="_blank">Attacment</li>`)}
					       	<p id="up_date">${up_date}</p>
					     </div>`;
					document.getElementById('sent').insertAdjacentHTML('afterBegin', item);
			}else{
					const item =
				     	`<div class="card-msg" id="msg${i}">
				    	   	<h4>${socname.toUpperCase()}</h4>
				       		<p id="msg-in">${urlify(msg)}</p>
				       		<p id="up_date">${up_date}</p>
				    	 </div>`;
					document.getElementById('sent').insertAdjacentHTML('afterBegin', item);
			}
		}		
}

function formatting(msg){
	return msg.replace(/\n/g, "<br>");
}

// var dbPromise = idb.open('test-db',1,function(upgradeDb){
// 	if(!upgradeDb.objectStoreNames.contains('starred')){
// 		var starredOS = upgradeDb.createObjectStore('starred', {autoIncrement:true});
// 	}
// });

// function starit(argstarctr,argsocimglink, argsocname, argmsg, argattchname){
// 	document.getElementsByClassName("star"+argstarctr)[0].innerHTML="&#9733;";	
// 	dbPromise.then(function(db) {
// 	  var tx = db.transaction('starred', 'readonly');
// 	  var store = tx.objectStore('starred');
// 	  return store.getAll();
// 	}).then(function(items) {
// 	  for(let s=0;s<items.length;s++){
// 	  	if(items[s].msg==argmsg)return;
// 	  }
// 		document.getElementsByClassName("star"+argstarctr)[0].innerHTML="&#9733;";
// 		argattchname=argattchname.substring(1,argattchname.length-1);
// 		argattchname=argattchname.split(",");
// 		console.log(argattchname);
// 		if(argattchname[0].length>0){
// 			const item =
// 			     `<div class="card-msg">
// 					<img id="socimg" src="${argsocimglink}"/><h5>${argsocname.toUpperCase()}</h5>
// 			       	<p id="msg-in">${urlify(argmsg)}</p>
// 			       	${argattchname.map(attch => `<li id="msg-in"><a href="/get_img/${attch}">Attacment</li>`)}
// 			     </div>`;
// 			document.getElementById('linked-cont-in').insertAdjacentHTML('afterBegin', item);		     
// 		}else{
// 			const item =
// 			     `<div class="card-msg">
// 					<img id="socimg" src="${argsocimglink}"/><h5>${argsocname.toUpperCase()}</h5>
// 			       	<p id="msg-in">${urlify(argmsg)}</p>
// 			     </div>`;
// 			document.getElementById('linked-cont-in').insertAdjacentHTML('afterBegin', item);		     
// 		}		  
// 		//save these locally for the user		
// 		dbPromise.then(function(db){
// 			var tx = db.transaction('starred','readwrite');
// 			var store = tx.objectStore('starred');
// 			var item = {
// 				socname:argsocname,
// 				socimglink:argsocimglink,
// 				msg:argmsg,
// 				attchname:argattchname
// 			};
// 			store.add(item);
// 			return tx.complete;
// 		}).then(function(){
// 			console.log('added item to the starred os!');
// 		});
// 	});
// }

// (function(){//anonymous function to read from idb and populate starred msgs
// 	dbPromise.then(function(db) {
// 	  var tx = db.transaction('starred', 'readonly');
// 	  var store = tx.objectStore('starred');
// 	  return store.getAll();
// 	}).then(function(items) {
// 	  for(let s=0;s<items.length;s++){
// 		if(items[s].attchname[0].length>0){
// 			const item =
// 			     `<div class="card-msg">
// 					<img id="socimg" src="${items[s].socimglink}"/><h5>${items[s].socname.toUpperCase()}</h5>
// 			       	<p id="msg-in">${urlify(items[s].msg)}</p>
// 			       	${items[s].attchname.map(attch => `<li id="msg-in"><a href="/get_img/${attch}">Attacment</li>`)}
// 			     </div>`;
// 			document.getElementById('linked-cont-in').insertAdjacentHTML('afterBegin', item);		     
// 		}else{
// 			const item =
// 			     `<div class="card-msg">
// 					<img id="socimg" src="${items[s].socimglink}"/><h5>${items[s].socname.toUpperCase()}</h5>
// 			       	<p id="msg-in">${urlify(items[s].msg)}</p>
// 			     </div>`;
// 			document.getElementById('linked-cont-in').insertAdjacentHTML('afterBegin', item);		     
// 		}	  	
// 	  }
// 	});

// })();

function getsoc(){
	fetch('/users/getsoc',{
    	method:'post'
	}).then(function(resp){
		return resp.text();
	}).then(function(j){
		let obj = JSON.parse(j);
        for(let i=0;i<obj.length;i++){
            for(let j=0;j<obj.length-1;j++){
                if(obj[j]["NAMES"] > obj[j+1]["NAMES"]){
                    let t = obj[j+1];
                    obj[j+1] = obj[j];
                    obj[j] = t;
                }
            }
        }
        var dept_sc_item = `
        	<hr>
            <div id="recc">Departments</div>
            <div class="card-soc">
                <h3>Chemical Engineering(CHED)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-CHED" onclick="subsTo('CHED')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>Civil Engineering(CED)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-CED" onclick="subsTo('CED')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>Computer Science and Engineering(CSED)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-CSED" onclick="subsTo('CSED')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>Department of Biotechnology(DOB)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-DOB" onclick="subsTo('DOB')">SUBSCRIBE</p>
            </div>                        
            <div class="card-soc">
                <h3>Electrical and Instrumentation Engineering(EICD)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-EICD" onclick="subsTo('EICD')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>Electrical and Communication Engineering(ECED)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-ECED" onclick="subsTo('ECED')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>Mechanical Engineering Department(MED)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-MED" onclick="subsTo('MED')">SUBSCRIBE</p>
            </div>


            <hr/>
            <div id="recc">Schools</div>
            <div class="card-soc">
                <h3>School of Chemistry and Biochemistry(SOCB)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-SOCB" onclick="subsTo('SOCB')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>School of Energy and Environment(SOEE)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-SOEE" onclick="subsTo('SOEE')">SUBSCRIBE</p>
            </div>                        
            <div class="card-soc">
                <h3>School of Humanities and Social Sciences(SOHSS)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-SOHSS" onclick="subsTo('SOHSS')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>School of Mathematics(SOM)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-SOM" onclick="subsTo('SOM')">SUBSCRIBE</p>
            </div>
            <div class="card-soc">
                <h3>School of Physics and Material Sciences(SOPMS)</h3>
                <p id="socinfo"></p>
                <p class="substatus" id="subs-SOPMS" onclick="subsTo('SOPMS')">SUBSCRIBE</p>
            </div>
            <hr/>
            <div id="recc">Societies, Clubs and Student chapters</div>`;
		document.getElementById('search-cont').insertAdjacentHTML('beforeEnd', dept_sc_item);              

		for(let i=0;i<obj.length;i++){
			if (obj[i]['NAMES'].includes("Dean") || obj[i]['CODES']=="DOSA" || obj[i]['CODES']=="DOAA" || obj[i]['CODES']=="DORSP" || obj[i]['CODES']=="LIBRARY" || obj[i]['CODES']=="CILP" || obj[i]['CODES']=="CTD" || obj[i]['CODES'].includes("HOSTEL") || obj[i]['NAMES'].includes("School") || obj[i]["NAMES"].includes("Department")){
				continue;
			}
			var weblink = obj[i]['WEBSITES'];
			if(!weblink.includes("http://") && weblink !== "")weblink = "http://"+weblink;
			if(weblink == "")weblink="../noweblink";
			const item=
                `<div class="card-soc">
                    <a href="${weblink}" target="_blank"><h3>${obj[i]['NAMES']}(${obj[i]['CODES']})</h3></a>
                    <p id="socinfo">${obj[i]['BIO']}</p>
                    <p class="substatus" id="subs-${obj[i]['CODES']}" onclick="subsTo('${obj[i]['CODES']}')">SUBSCRIBE</p>
                 </div>`;            	 
			document.getElementById('search-cont').insertAdjacentHTML('beforeEnd', item);            	 
		}
		var hostelItem=`

			<hr/>
			<div id="recc">Hostels</div>
			<div class="card-soc">
                <h4>HOSTEL E</h4>
                <p class="substatus" id="subs-HOSTELE" onclick="subsTo('HOSTELE')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL G</h4>
                <p class="substatus" id="subs-HOSTELG" onclick="subsTo('HOSTELG')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL I</h4>
                <p class="substatus" id="subs-HOSTELI" onclick="subsTo('HOSTELI')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL N</h4>
                <p class="substatus" id="subs-HOSTELN" onclick="subsTo('HOSTELN')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL PG</h4>
                <p class="substatus" id="subs-HOSTELPG" onclick="subsTo('HOSTELPG')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL A</h4>
                <p class="substatus" id="subs-HOSTELA" onclick="subsTo('HOSTELA')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL B</h4>
                <p class="substatus" id="subs-HOSTELB" onclick="subsTo('HOSTELB')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL C</h4>
                <p class="substatus" id="subs-HOSTELC" onclick="subsTo('HOSTELC')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL H</h4>
                <p class="substatus" id="subs-HOSTELH" onclick="subsTo('HOSTELH')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL J</h4>
                <p class="substatus" id="subs-HOSTELJ" onclick="subsTo('HOSTELJ')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL K</h4>
                <p class="substatus" id="subs-HOSTELK" onclick="subsTo('HOSTELK')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL L</h4>
                <p class="substatus" id="subs-HOSTELL" onclick="subsTo('HOSTELL')">SUBSCRIBE</p>
             </div>
             <div class="card-soc">
                <h4>HOSTEL M</h4>
                <p class="substatus" id="subs-HOSTELM" onclick="subsTo('HOSTELM')">SUBSCRIBE</p>
             </div>`;
		document.getElementById('search-cont').insertAdjacentHTML('beforeEnd',hostelItem);
	}).catch(function(err){
		console.error("Failed to get soc data:"+err);
	});	
}

function subsTo(soc){
	var idname="subs-"+String(soc);
	var status = document.getElementById(idname).innerHTML;
	var data={
		soc:soc,
		status:status
	};
	if(status=="SUBSCRIBE"){
		document.getElementById(idname).innerHTML="UNSUBSCRIBE";
	}else{
		document.getElementById(idname).innerHTML="SUBSCRIBE";
	}
	const headers = new Headers({'Content-Type': 'application/json'});
	const body = JSON.stringify(data);	
	fetch("/users/add_sub_soc",{
		method:'POST',
		headers:headers,
		body:body
	}).then(function(resp){
		// console.log("subscribed to "+soc);
	}).catch(function(err){
		console.error("couldn't subscribe to "+soc+", ERR: "+err);
	});
	document.getElementById('reload_notice').style.display="block";
	document.getElementById('reload_notice').innerHTML="Tap here to apply changes";
}