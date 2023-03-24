module.exports = {

    varifyLogin : (req, res, next) => {
        if(req.session.loggedIn){
            next();
        }else{
            res.redirect('/');
        }
    }
    
}