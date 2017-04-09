const Recipe = require('mongoose').model('Recipe');
const Category = require('mongoose').model('Category');

module.exports = {
    view: (req, res) => {
        if(!req.isAuthenticated()){
            let returnUrl = '/cookbook/view';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Category.find({})
            .then(categories => {
                req.user.getRecipes()
                    .then(recipes => {
                        for(let i = 0; i < recipes.length; i++){
                            let currentCategory = categories
                                .find(x => x.id == recipes[i].category);
                            if(currentCategory){
                                if(!currentCategory.recipesData){
                                    currentCategory.recipesData = [];
                                }
                                currentCategory.recipesData.push(recipes[i]);
                            }
                        }

                        categories = categories
                            .filter(x => x.recipesData && x.recipesData.length > 0);
                        res.render('cookbook/view', {categories: categories});
                    })
            });
    }
};