const mongoose = require('mongoose');

let recipeSchema = mongoose.Schema({
    title: {type: String, required:true},
    content: {type: String, required: true},
    author: {type:mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    category: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category'},
    date: {type: Date, default: Date.now()},
    ingredients: {type: Array, required:true},
    nutritions: {type: Object},
    directions: {type: String, required: true},
    prepTime: {type: Number},
    cookTime: {type: Number}
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
    },

    splitText: function (text, limit) {
        var lines = [];

        while (text.length > limit) {
            var chunk = text.substring(0, limit);
            var lastWhiteSpace = chunk.lastIndexOf(' ');

            if (lastWhiteSpace !== -1) limit = lastWhiteSpace;

            lines.push(chunk.substring(0, limit));
            text = text.substring(limit + 1);
        }

        lines.push(text);

        return lines;
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;