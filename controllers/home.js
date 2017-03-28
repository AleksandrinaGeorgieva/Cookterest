const mongoose = require('mongoose');
const Recipe = mongoose.model('Recipe');
const User = mongoose.model('User');
const Category = mongoose.model('Category');

module.exports = {
  index: (req, res) => {
      Category.find({})
          .then(categories => {
              res.render('home/index', {categories: categories});
          });
  },

    listCategoryRecipes: (req, res) => {
      let id = req.params.id;

      Category.findById(id).populate('recipes').then(category => {
          User.populate(category.recipes, {path: 'author'}, (err) => {
              if(err){
                  console.log(err.message);
              }

              res.render('home/recipe', {recipes: category.recipes});
          });
      })
    }
};