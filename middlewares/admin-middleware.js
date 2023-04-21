module.exports = {

    varifyLogin : (req, res, next) => {
        if(req.session.adminLoggedIn){
            next();
        }else{
            res.redirect('/admin/login');
        }
    }
    
}
