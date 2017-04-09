const mongoose = require('mongoose');
const Recipe = mongoose.model('Recipe');
const User = mongoose.model('User');
const Category = mongoose.model('Category');

module.exports = {
  index: (req, res) => {
      Category.find({})
          .then(categories => {
              //add most recent recipes
              Recipe.find({})
                  .sort( { date: 'desc' } )
                  .limit(12)
                  .then(recipes => {
                      res.render('home/index', {categories: categories, recipesData: recipes});
                  });


          });
  },

    listCategoryRecipes: (req, res) => {
      let id = req.params.id;

      Category.findById(id).populate('recipes').then(category => {
          User.populate(category.recipes, {path: 'author'}, (err) => {
              if(err){
                  console.log(err.message);
              }

              res.render('home/recipe', {recipesData: category.recipes, category: category});
          });
      })
    }
};