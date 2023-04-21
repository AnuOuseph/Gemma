const userHelpers = require('../models/user-helpers');

module.exports = {

    varifyLogin : async(req, res, next) => {
        if(req.session.loggedIn){
            await userHelpers.getUserDetails(req.session.user._id).then((user)=>{
                
                if(user.userStatus){
                    req.session.user = user;
                    next();
                }else{
                    // req.session.loggedIn=false;
                    // req.session.loginErr="YOU ARE BLOCKED!!";
                    // res.redirect('/login');
                    req.session.destroy();
                    res.redirect('/');
                }
                
            })
            
        }else{
            res.redirect('/');
        }
    }
    
}