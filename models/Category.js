const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    recipes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'}]
});

categorySchema.method({
    prepareDelete: function (){
        let Recipe = mongoose.model('Recipe');
        for(let recipe of this.recipes){
            Recipe.findById(recipe).then(recipe => {
                recipe.prepareDelete();
                recipe.remove();
            })
        }
    }
});

categorySchema.set('versionKey', false);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;