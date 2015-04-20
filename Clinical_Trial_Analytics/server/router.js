
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var json2html = require('node-json2html');

module.exports = function(app) {

// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	
	
	
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('home', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
	    }
	});
	
	app.post('/home', function(req, res){
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
				AM.getAccountByEmail(req.param('email'), function(o){
					if (o){
						res.send('ok', 200);
						EM.dispatchSignUpSuccessEmail(o, function(e, m){
						// this callback takes a moment to return //
						// should add an ajax loader to give user feedback //
							if (!e) {
							//	res.send('ok', 200);
							}	else{
								res.send('email-server-error', 400);
								for (k in e) console.log('error : ', k, e[k]);
							}
						});
					}	else{
						res.send('email-not-found', 400);
					}
				});
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/subscribe', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
		    console.log("USer:" +req.session.user)
			res.render('subscribe', {
				title : 'Subscribe Panel',
				udata : req.session.user
			});
	    }
	});
	
	app.post('/subscribe', function(req, res){
		AM.addNewSubscriber({
			email 	: req.param('email')
			
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
				// look up the user's account via their email //
				AM.getAccountByEmail(req.param('email'), function(o){
					if (o){
						res.send('ok', 200);
						EM.dispatchSubscribeEmail(o, function(e, m){
						// this callback takes a moment to return //
						// should add an ajax loader to give user feedback //
							if (!e) {
							//	res.send('ok', 200);
							}	else{
								res.send('email-server-error', 400);
								for (k in e) console.log('error : ', k, e[k]);
							}
						});
					}	else{
						res.send('email-not-found', 400);
					}
				});
			}
		});
	});
	
	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	//Get all data from BSON database
	app.get('/searchResult', function(req, res) {
		var query = require('url').parse(req.url,true).query;
		var disease = query.disease;
		AM.searchResult(disease, function(e, bsonSearch){
			
			//bsonSearch[0][]
		/*	console.log("test" + bsonSearch.length);
			for(key in bsonSearch){
				console.log("key is: " + bsonSearch);
				console.log("key is: " + bsonSearch[key]);

			}*/
			console.log("DATA Length:" + bsonSearch.length);
			console.log("DATA Length:" + bsonSearch[0].clinical_study.brief_summary.textblock);
			console.log("DATA Length:" + bsonSearch[1].clinical_study.brief_summary.textblock);
			for(var i=0; i<bsonSearch.length; i++){
			 	console.log("VALUESNAMITHA" +[i] +":"+ bsonSearch[i].clinical_study.brief_summary.textblock);
				res.render('searchResult',{title: 'Search Result', result0 : bsonSearch[0].clinical_study.brief_summary.textblock, result1: bsonSearch[1].clinical_study.brief_summary.textblock})
			}
			});
			//res.send(bsonSearch);
	});
	
	/*app.get('/searchResultOutput', function(req, res) {
		var query = require('url').parse(req.url,true).query;
		var output = query.output;
		AM.searchResultOutput(output, function(e, bsonSearch){
			console.log("DATA :" + output);
			console.log("BsonSearch:"+ JSON.stringify(bsonSearch[0]));
			res.render('searchResultOutput',{title: 'Search Result Output', result : JSON.stringify(bsonSearch[0].clinical_study.brief_title)
			//res.send(bsonSearch);
			})
		})
	});*/

	app.get('/searchResultOutput', function(req, res) {
		var query = require('url').parse(req.url,true).query;
		var output = query.output;
		AM.searchResultOutput(output, function(e, bsonSearch){
			console.log("DATA :" + output);
			console.log("BsonSearch:"+ JSON.stringify(bsonSearch[0]));
		var transform = {
	        				"tag": "div",
			    			"id": "searchresult",
			    			"children": [
								{
									"tag":"div",
									"html":"Rank: ${clinical_study.@rank}"
								},
			        			{
			            			"tag": "span",
			            			"html": "Brief Title: ${clinical_study.brief_title}"
			        			},
								{
									"tag": "br",
			            			"html": "Official Title: ${clinical_study.official_title}"
								},
								{
									"tag": "label",
									"html": "Sponsors:"
								},
								{
									"tag": "br",
						 			"html": "Lead Sponsor:"
								},
								{
									"tag": "span",
			            			"html": "Agency: ${clinical_study.sponsors.lead_sponsor.agency}"
								},
								{
									"tag": "span",
			            			"html": "Agency Class: ${clinical_study.sponsors.lead_sponsor.agency_class}"
								},
								{
									"tag": "br",
						 			"html": "Source:${clinical_study.source}"
								},
								{
									"tag": "label",
			            			"html": "Oversight_Info"
								},
								{
									"tag": "br",
			            			"html": "Authority: ${clinical_study.oversight_info.authority}"
								},
								{
									"tag": "br",
			            			"html": "Brief Summary: ${clinical_study.brief_summary.textblock}"
								},
								{
									"tag": "br",
			            			"html": "Detailed Description: ${clinical_study.detailed_description.textblock}"
								},
								{
									"tag": "br",
			            			"html": "Overall Status of the Study: ${clinical_study.overall_status}"
								},
								{
									"tag": "br",
			            			"html": "Study Completion date: ${clinical_study.completion_date.#text}"
								},
			    				]
							};
			var final_output = json2html.transform(bsonSearch[0], transform);
			res.render('searchResultOutput',{title: 'Search Result Output', result : final_output})
			//res.send(final_output);
			});
	});
		
	//Search result
	app.get('/search', function(req, res) {
		res.render('search', {  title: 'Search' });	
	});
	
	app.get('/stock', function(req, res) {
		res.render('stock', {  title: 'Search' });	
	});
	
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
}; 


