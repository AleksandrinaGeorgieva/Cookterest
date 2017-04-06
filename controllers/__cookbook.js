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

        req.user.getRecipes()
            .then(recipes => {
                recipes = recipes.map(function(recipe){
                    let directions = recipe.directions,
                        pageSize = 500;
                    /* find a smarter way to do the splitting of the content */
                    // let pages = directions.match(new RegExp('.{1,' + pageSize + '}\s', 'g'))
                    //         /* sometimes having \s in the end breaks the splitting. */
                    //     || directions.match(new RegExp('.{1,' + pageSize + '}', 'g'))
                    //     || [];
                    let pages = recipe.splitText(directions, pageSize);
                    recipe.directionsPages = [];
                    for(let i = 0; i < pages.length; i+=2){
                        recipe.directionsPages.push({
                            left: pages[i],
                            right: pages[i + 1]
                        });
                    }
                    return recipe;
                });

            res.render('cookbook/view', {recipes: recipes});
        });
    }
};