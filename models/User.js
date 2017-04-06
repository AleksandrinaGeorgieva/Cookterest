const mongoose = require('mongoose');
const Role = require('mongoose').model('Role');
const Recipe = require('mongoose').model('Recipe');
const encryption = require('./../utilities/encryption');

let userSchema = mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        fullName: {type: String, required: true},
        picture: {type: String, required: false, default: 'default.jpeg'},
        recipes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'}],
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
        salt: {type: String, required: true}
    }
);

userSchema.method ({
   authenticate: function (password) {
       let inputPasswordHash = encryption.hashPassword(password, this.salt);
       let isSamePasswordHash = inputPasswordHash === this.passwordHash;

       return isSamePasswordHash;
   },

    isAuthor: function (recipe){
       if(!recipe){
           return false;
       }

       let isAuthor = recipe.author.equals(this.id);
       return isAuthor;
    },

    isInRole: function (roleName) {
        return Role.findOne({name: roleName})
            .then(role => {
                if (!role) {
                    return false;
                }

                let isInRole = this.roles.indexOf(role.id) !== -1;
                return isInRole;
            })
    },

    prepareDelete: function (){
        for(let role of this.roles){
            Role.findById(role).then(role => {
                role.users.remove(this.id);
                role.save();
            });
        }

        let Recipe = mongoose.model('Recipe');
        for(let recipe of this.recipes){
            Recipe.findById(recipe).then(recipe => {
                recipe.prepareDelete();
                recipe.remove();
            });
        }
    },

    prepareInsert: function (){
        for(let role of this.roles){
            Role.findById(role).then(role => {
                role.users.push(this.id);
                role.save();
            });
        }
    },

    getRecipes: function (){
       return Recipe.find({author: this.id})
           .populate('author')
            .then(recipes => {
                return recipes;
            });
    },

    isAllowedToEditProfile: function(profileId){
        return profileId == this.id;
    }
});

userSchema.set('versionKey', false);

const User = mongoose.model('User', userSchema);
module.exports = User;
module.exports.seedAdmin = () => {
    let email = 'admin@admin.com';
    User.findOne({email: email})
        .then(admin => {
            if(!admin){
                Role.findOne({name: 'Admin'})
                    .then(role => {
                        let salt = encryption.generateSalt();
                        let passwordHash = encryption.hashPassword('admin', salt);

                        let roles = [];
                        roles.push(role.id);

                        let user = {
                            email: email,
                            passwordHash: passwordHash,
                            fullName: 'Admin',
                            recipes: [],
                            salt: salt,
                            roles: roles,
                            picture: 'default.jpeg'
                        };

                        User.create(user)
                            .then(user => {
                                role.users.push(user.id);
                                role.save(err => {
                                    if(err){
                                        console.log(err.message);
                                    }else{
                                        console.log('Admin seeded successfully!');
                                    }
                                });
                            });
                    });
            }
        });
};





