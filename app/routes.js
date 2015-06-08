/**
 * Created by preeti.bala on 6/4/15.
 */
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/success', function(req, res) {
        res.render('success.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.get('/ldaplogin', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('ldaplogin.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/ldaplogin', function(req, res, next) {
        console.log('inside ldappost login');
        passport.authenticate('ldap-login', function (err, user, info) {
            var error = err || info;
            if (error) {
                console.log('error: ' + error);
                return res.json(401, error);
            }
            if (!user) {
                console.log('error: ' + 'Something went wrong, please try again');
                return res.json(404, {message: 'Something went wrong, please try again.'});
            }
//            successRedirect : '/success', // redirect to the secure profile section
//            failureRedirect : '/ldaplogin', // redirect back to the ldaplogin page if there is an error
//            failureFlash : true // allow flash messages
        })(req, res, next)
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        console.log('inside profile');
        console.log('req:'  + req);
        console.log('res: ' + res);
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    console.log('I am not authenticated redirecting to index page');
    console.log('res: ' + res);
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('I am authenticated');
        return next();
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}