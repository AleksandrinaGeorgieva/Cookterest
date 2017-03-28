const mongoose = require('mongoose');

let recipeSchema = mongoose.Schema({
    title: {type: String, required:true},
    content: {type: String, required: true},
    author: {type:mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    category: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category'},
    date: {type: Date, default: Date.now()}
});

recipeSchema.method({
    prepareInsert: function (){
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            user.recipes.push(this.id);
            user.save();
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            if(category){
                category.recipes.push(this.id);
                category.save();
            }
        })
    },

    prepareDelete: function (){
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            if(user){
                user.recipes.remove(this.id);
                user.save();
            }
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            if(category){
                category.recipes.remove(this.id);
                category.save();
            }
        })
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;