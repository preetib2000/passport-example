/**
 * Created by preeti.bala on 6/4/15.
 */
var LocalStrategy   = require('passport-local').Strategy;
var LdapStrategy = require('passport-ldapauth').Strategy;
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'test',
    password : '',
    database : 'espressProject'
});

connection.query('USE espressProject');



// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("select * from user where id = "+id,function(err,rows){
            done(err, rows[0]);
        });

    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            console.log('Check if user exists');
            connection.query("select * from user where username = '"+username+"'",function(err,rows) {
                console.log(rows);
                console.log("above row object");
                if (err) {
                    console.log('Error while checking user');
                    return done(err);
                }
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {

                    console.log('Inserting the new user');
                    // if there is no user with that email
                    // create the user
                    var newUserMysql = new Object();

                    newUserMysql.username    = username;
                    newUserMysql.password = password; // use the generateHash function in our user model

                    var insertQuery = "INSERT INTO user ( username, password ) values ('" + username +"','"+ password +"')";
                    console.log(insertQuery);
                    connection.query(insertQuery,function(err,response){
                        if(err){
                            console.log('err: ' + err);
                        }

                        console.log(response.insertId);
                        newUserMysql.id = response.insertId;
                        console.log(newUserMysql);

                        return done(null, newUserMysql.id);
                    });
                }
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form

            connection.query("SELECT * FROM `user` WHERE `username` = '" + username + "'",function(err,rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!( rows[0].password == password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                console.log('Login Successful');
                return done(null, rows[0]);

            });



        }));

    passport.use('ldap-login', new LdapStrategy({
                usernameField: 'username',
                passwordField: 'password',
                server: {
                    url: 'ldap://ldap.forumsys.com:389',
                    bindDn: "cn=read-only-admin,dc=example,dc=com",
                    bindCredentials: 'password',
                    searchBase: 'ou=mathematicians,dc=example,dc=com',
                    searchFilter: 'uid={{euclid}}'
                }
            },
            function (user, done) {
                console.log('preeti');
                return done(null, user);
            }
        ));

};
