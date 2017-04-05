const User = require('mongoose').model('User');
const Role = require('mongoose').model('Role');
const encryption = require('./../utilities/encryption');

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost:(req, res) => {
        let registerArgs = req.body;

        User.findOne({email: registerArgs.email}).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'User with the same username exists!';
            } else if (registerArgs.password !== registerArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs)
            } else {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword(registerArgs.password, salt);

                let userObject = {
                    email: registerArgs.email,
                    passwordHash: passwordHash,
                    fullName: registerArgs.fullName,
                    salt: salt
                };

                let roles = [];
                Role.findOne({name: 'User'})
                    .then(role => {
                        roles.push(role.id);

                        userObject.roles = roles;

                        User.create(userObject).then(user => {
                            user.prepareInsert();
                            req.logIn(user, (err) => {
                                if (err) {
                                    registerArgs.error = err.message;
                                    res.render('user/register', registerArgs);
                                    return;
                                }

                                res.redirect('/');
                            });
                        });
                    });
            }
        })
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user ||!user.authenticate(loginArgs.password)) {
                let errorMsg = 'Either username or password is invalid!';
                loginArgs.error = errorMsg;
                res.render('user/login', loginArgs);
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/user/login', {error: err.message});
                    return;
                }

                let returnUrl = '/';
                if(req.session.returnUrl){
                    returnUrl = req.session.returnUrl;
                    delete req.session.returnUrl;
                }

                res.redirect(returnUrl);
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    },

    profileGet: (req, res) => {
        let id = req.params.id;

        User.findById(id).then(user => {
            res.render('user/view_profile', {user: user});
        });
    },

    editProfileGet: (req, res) => {
        let id = req.params.id;

        if(!req.user.isAllowedToEditProfile(id)){
            res.redirect('/');
            return;
        }

        User.findById(id).then(user => {
            res.render('user/edit_profile', {user: user});
        });
    },

    editProfilePost: (req, res) => {
        let id = req.params.id;
        let userArgs = req.body;

        User.findOne({email: userArgs.email, _id: {$ne: id}}).then(user => {
            let errorMsg = '';

            if(user){
                errorMsg = 'User with the same username exists!';
            }else if(!userArgs.fullName){
                errorMsg = 'Name cannot be null!';
            }else if(userArgs.password !== userArgs.confirmedPassword){
                errorMsg = 'Passwords do not match!';
            }

            if(errorMsg){
                userArgs.error = errorMsg;
                res.render(`/user/edit_profile/${id}`, userArgs);
            }else{
                User.findOne({_id: id}).then(user => {
                  //  user.email = userArgs.email;
                    user.fullName = userArgs.fullName;

                    let passwordHash = user.passwordHash;
                    if(userArgs.password){
                        passwordHash = encryption.hashPassword(userArgs.password, user.salt);
                    }

                    user.passwordHash = passwordHash;

                    user.save((err) => {
                        res.redirect('/');
                    });
                });
            }
        });
    }
};
