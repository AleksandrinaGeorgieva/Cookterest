const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const recipeController = require('./../controllers/recipe');
const adminController = require('./../controllers/admin/admin');
const cookBookController = require('./../controllers/cookbook');

module.exports = (app) => {
    app.get('/', homeController.index);
    app.get('/category/:id', homeController.listCategoryRecipes);

    app.get('/user/view_profile/:id', userController.profileGet);
    app.get('/user/edit_profile/:id', userController.editProfileGet);

    app.post('/user/edit_profile/:id', userController.editProfilePost);
    app.post('/user/upload_photo/:id', userController.uploadPhoto);

    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/recipe/create', recipeController.createGet);
    app.post('/recipe/create', recipeController.createPost);

    app.get('/recipe/details/:id', recipeController.details);
    app.post('/recipe/details/:id', recipeController.addToFavourites);

    app.get('/recipe/upload_photo/:id', recipeController.uploadPhotoGet);
    app.post('/recipe/upload_photo/:id', recipeController.uploadPhoto);

    app.get('/recipe/edit/:id', recipeController.editGet);
    app.post('/recipe/edit/:id', recipeController.editPost);

    app.get('/recipe/delete/:id', recipeController.deleteGet);
    app.post('/recipe/delete/:id', recipeController.deletePost);

    app.get('/cookbook/view', cookBookController.view);

    app.get('/user/logout', userController.logout);

    app.use((req, res, next) => {
        if(req.isAuthenticated()){
            req.user.isInRole('Admin').then(isAdmin => {
                if(isAdmin){
                    next();
                }else{
                    res.redirect('/');
                }
            });
        }else{
            res.redirect('/user/login');
        }
    });

    app.get('/admin/user/all', adminController.user.all);

    app.get('/admin/user/edit/:id', adminController.user.editGet);
    app.post('/admin/user/edit/:id', adminController.user.editPost);

    app.get('/admin/user/delete/:id', adminController.user.deleteGet);
    app.post('/admin/user/delete/:id', adminController.user.deletePost);

    app.get('/admin/category/all', adminController.category.all);

    app.get('/admin/category/create', adminController.category.createGet);
    app.post('/admin/category/create', adminController.category.createPost);

    app.get('/admin/category/edit/:id', adminController.category.editGet);
    app.post('/admin/category/edit/:id', adminController.category.editPost);

    app.get('/admin/category/delete/:id', adminController.category.deleteGet);
    app.post('/admin/category/delete/:id', adminController.category.deletePost);
};

