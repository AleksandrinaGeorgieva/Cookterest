const Recipe = require('mongoose').model('Recipe');

module.exports = {
    view: (req, res) => {
        //res.render('recipe/create');
        if(!req.isAuthenticated()){
            let returnUrl = '/cookbook/view';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        req.user.getRecipes().then(recipes => {
            res.render('cookbook/view', {recipes: recipes});
        });
    }
};