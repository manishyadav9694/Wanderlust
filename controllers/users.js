const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = (req, res, next) => {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    User.register(newUser, password, (err, user) => {
        if (err) {
            console.log("REGISTER ERROR:", err);
            req.flash("error", err.message);
            return res.redirect("/signup");
        }
        req.login(user, (err) => {
            if (err) {
                console.log("LOGIN ERROR:", err);
                req.flash("error", err.message);
                return res.redirect("/signup");
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    });
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};