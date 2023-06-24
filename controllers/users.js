const User = require('../models/user');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body.user;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', `Welcome to YelpCamp ${user.username}`);
      res.redirect('/campgrounds');
    });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/register');
  }
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = (req, res) => {
  req.flash('success', `Welcome back ${req.body.username}!!`);
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', `Goodbye :(`);
  res.redirect('/campgrounds');
};

module.exports.renderForgotP = (req, res) => {
  res.render('users/forgotP');
};

module.exports.forgotPassword = (req, res, next) => {
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgotP');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      const mailOptions = {
        to: user.email,
        from: 'Yelp Camp',
        subject: 'Password Reset',
        text:
          'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' +
          req.headers.host +
          '/reset/' +
          token +
          '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n',
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        console.log('mail sent');
        req.flash(
          'success',
          'An email has been sent to ' +
            user.email +
            ' with further instructions.'
        );
        done(err, 'done');
      });
    },
  ], (err) => {
    if (err) return next(err);
    res.redirect('/forgotP');
  });
};

module.exports.renderReset = (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    (err, user) => {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgotP');
      }
      res.render('users/reset', { token: req.params.token });
    }
  );
};

module.exports.resetPassword = (req, res) => {
  async.waterfall([
    (done) => {
      User.findOne(
        {
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: Date.now() },
        },
        (err, user) => {
          if (!user) {
            req.flash(
              'error',
              'Password reset token is invalid or has expired.'
            );
            return res.redirect('back');
          }
          if (req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, (err) => {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save((err) => {
                req.logIn(user, (err) => {
                  done(err, user);
                });
              });
            });
          } else {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('back');
          }
        }
      );
    },
    (user, done) => {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      const mailOptions = {
        to: user.email,
        from: 'Yelp Camp',
        subject: 'Your password has been changed',
        text:
          'Hello,\n\n' +
          'This is a confirmation that the password for your account ' +
          user.email +
          ' has just been changed.\n',
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    },
  ], (err) => {
    res.redirect('/campgrounds');
  });
};
