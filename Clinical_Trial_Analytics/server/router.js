
var CT = require('./modules/country-list');
var LL = require('./modules/location-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var json2html = require('node-json2html');
var request = require('request');


module.exports = function(app) {

	app.get('/', function(req, res){
		res.render('login2', { title: 'Hello - Please Login To Your Account' });
	});
// main login page //

	app.get('/login', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
			// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/search');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/login', function(req, res){
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


	var output1;
	var data1;

	//Get all data from BSON database
	app.get('/searchResult', function(req, res) {
		var query = require('url').parse(req.url,true).query;
		var disease = query.disease;

		request('http://webserviceanalytics.somee.com/Search/Results?type=disease&term=' +disease, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			AM.saveResult({
				search 	: disease,
			}, function(e){
			})
			AM.getRecommend(function(e,bsonSearch1){
				 data1 = bsonSearch1;
			})
			AM.searchResult(disease, function(e, bsonSearch){
				var data = bsonSearch;
				res.render('searchResult',{title: 'Search Result', result : data, result1 : data1});
			})
		}
	})
});

	app.get('/searchResultOutput', function(req, res) {
		var query = require('url').parse(req.url,true).query;
		var output = query.output;
		AM.searchResultOutput(output, function(e, bsonSearch){
				console.log('SearchResultOutput:' +JSON.stringify(bsonSearch[0]))
				output1 = bsonSearch[0].clinical_study.brief_title
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
									"tag": "br",
									"html": "Sponsors:"
								},
								{
						 			"html": "Lead Sponsor:"
								},
								{
			            			"html": "Agency: ${clinical_study.sponsors.lead_sponsor.agency}"
								},
								{
									"tag": "div",
			            			"html": "Agency Class: ${clinical_study.sponsors.lead_sponsor.agency_class}"
								},
								{
									"tag": "span",
						 			"html": "Source:${clinical_study.source}"
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
								{
									"tag": "br",
			            			"html": "${clinical_study.phase}",
			            			"tag": "br"
								},
								{
									"tag": "p",
			            			"html": "Study Type: ${clinical_study.study_type}"
								},
								{
									"tag": "p",
			            			"html": "Study Design: ${clinical_study.study_design}"
								},
								{
									"tag": "p",
			            			"html": "Enrollment: ${clinical_study.enrollment}"
								},
								{
									"tag": "p",
			            			"html": "Condition: ${clinical_study.condition}"
								},
								{
									"tag": "label",
			            			"html": "Eligibility Criteria:"
								},
								{
									"tag": "p",
			            			"html": "	${clinical_study.eligibility.criteria.textblock}"
								},
								{
									"tag": "p",
			            			"html": "Gender: ${clinical_study.eligibility.gender}"
								},
								{
									"tag": "p",
			            			"html": "Minimum Age: ${clinical_study.eligibility.minimum_age}"
								},
								{
									"tag": "p",
			            			"html": "Maximum Age: ${clinical_study.eligibility.maximum_age}"
								},
								{
									"tag": "p",
			            			"html": "Healthy Volunteers: ${clinical_study.eligibility.healthy_volunteers}"
								},
								{
									"tag": "p",
			            			"html": "Location Countries: ${clinical_study.location_countries.country}"
								},
								{
									"tag": "p",
			            			"html": "Link: ${clinical_study.link.url}"
								},
								{
									"tag": "p",
			            			"html": "Verification Date: ${clinical_study.verification_date}"
								},
								{
									"tag": "p",
			            			"html": "Last Changed Date: ${clinical_study.lastchanged_date}"
								},
								{
									"tag": "p",
			            			"html": "First Received Date: ${clinical_study.firstreceived_date}"
								}
			    				]
							};
			var final_output = json2html.transform(bsonSearch[0], transform);
			res.render('searchResultOutput',{title: 'Search Result Output', result : final_output})
			//res.send(transform);
			});
	});

	app.post('/subscribe', function(req, res){
		AM.addNewSubscriber({
			email 	: req.param('email'),
			brief_title : output1,
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
		
	//Search page
	app.get('/search', function(req, res) {
		res.render('search', {  title: 'Search' });	
	});
	
	app.get('/map', function(req, res) {
		res.render('map', {  title: 'Clinical Locations' });	
	});
	
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
}; 


