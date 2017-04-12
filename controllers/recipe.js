const Recipe = require('mongoose').model('Recipe');
const Category = require('mongoose').model('Category');

module.exports = {
    createGet: (req, res) => {
        //res.render('recipe/create');
        if(!req.isAuthenticated()){
            let returnUrl = '/recipe/create';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Category.find({}).then(categories => {
            res.render('recipe/create', {categories: categories});
        });
    },

    createPost: (req, res) => {
        let recipeArgs = req.body;
        let errorMsg = false;

        if(!req.isAuthenticated()){
            errorMsg = 'You should be logged in to make recipes!'
        }else if(!recipeArgs.title){
            errorMsg = 'Invalid title!';
        }else if(!recipeArgs.content){
            errorMsg = 'Invalid content!';
        }else if(!recipeArgs.ingredients["0"]["name"]){
            errorMsg = 'Invalid ingredient\'s name!';
        }else if(!recipeArgs.ingredients["0"]["quantity"]){
            errorMsg = 'Invalid ingredient\'s quantity!';
        }else if(!recipeArgs.directions){
            errorMsg = 'Invalid directions!';
        }else if(!recipeArgs.prepTime){
            errorMsg = 'Invalid preparation time'
        }else if(!recipeArgs.cookTime){
            errorMsg = 'Invalid cooking time!';
        }

        if(errorMsg){
            res.render('recipe/create', {error: errorMsg});
            return;
        }

        recipeArgs.author = req.user.id;
        Recipe.create(recipeArgs)
            .then(recipe => {
                recipe.prepareInsert();
                res.redirect('/');
            });
    },
    details: (req, res) => {
        let id = req.params.id;

        Recipe.findById(id)
            .populate('author')
            .then(recipe => {
                if(!req.user){
                    res.render('recipe/details', {
                        recipe: recipe,
                        isUserAuthorized: false
                    });
                    return;
                }

                req.user.isInRole('Admin')
                    .then(isAdmin => {
                        let isUserAuthorized = isAdmin || req.user.isAuthor(recipe);
                        res.render('recipe/details',{
                            recipe: recipe,
                            isUserAuthorized: isUserAuthorized
                        });
                    });
            });
    },

    editGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = '/recipe/edit/${id}';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Recipe.findById(id)
            .then(recipe => {
                req.user.isInRole('Admin')
                    .then(isAdmin => {
                        if(!isAdmin && !req.user.isAuthor(recipe)){
                            res.redirect('/');
                            return;
                        }
                        Category.find({}).then(categories => {
                            recipe.categories = categories;

                            res.render('recipe/edit', recipe);
                        })
                    });

               // res.render('recipe/edit', recipe);
            });

    },

    editPost: (req, res) => {
        let id = req.params.id;

        let recipeArgs = req.body;

        let errorMsg = '';
        if(!recipeArgs.title){
            errorMsg = 'Recipe title cannot be empty!';
        }else if(!recipeArgs.content){
            errorMsg = 'Recipe content cannot be empty!';
        }

        if(errorMsg){
            res.render('recipe/edit', {error: errorMsg});
        }else{

            // Recipe.update({_id:id}, {$set: {title: recipeArgs.title, content: recipeArgs.content}})
            //     .then(updateStatus => {
            //         res.redirect('/');
            //         //res.redirect('/recipe/details/${id}');
            //     });
             Recipe.findById(id).populate('category').then(recipe => {
                 //res.redirect('/');
                if(recipe.category.id !== recipeArgs.category){
                    recipe.category.recipes.remove(recipe.id);
                    recipe.category.save();
                }

                recipe.category = recipeArgs.category;
                recipe.title = recipeArgs.title;
                recipe.content = recipeArgs.content;
                recipe.ingredients = recipeArgs.ingredients;
                recipe.nutritions = recipeArgs.nutritions;
                recipe.directions = recipeArgs.directions;
                recipe.prepTime = recipeArgs.prepTime;
                recipe.cookTime = recipeArgs.cookTime;

                recipe.save((err) => {

                    if(err){
                        console.log(err.message);
                    }

                    Category.findById(recipe.category).then(category => {
                        if(category.recipes.indexOf(recipe.id) === -1){
                            category.recipes.push(recipe.id);
                            category.save();
                        }
                    });
                    //res.redirect('/recipe/details/${id}');
                });
                 res.redirect('/');
             });
        }
    },

    deleteGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = '/recipe/delete/${id}';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Recipe.findById(id)
            .then(recipe => {
                req.user.isInRole('Admin')
                    .then(isAdmin => {
                        if(!isAdmin && !req.user.isAuthor(recipe)){
                            res.redirect('/');
                            return;
                        }
                    });

                res.render('recipe/delete', recipe);
            });
    },

    deletePost: (req, res) => {
        let id = req.params.id;
        Recipe.findOneAndRemove({_id: id})
            .populate('author')
            .then(recipe => {
                recipe.prepareDelete();
                res.redirect('/');
            })
    }
};