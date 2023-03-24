const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const userHelpers = require('../models/user-helpers');
const productHelpers=require('../models/product-helpers');
const cloudinary = require('../utils/cloudinary');
const upload = require("../utils/multer");
let userHeader;



module.exports = {
    get : async(req, res) => {
      let cartCount = null;
        let user = req.session.user;
        let userName = req.session.userName;
        console.log(userName);
        console.log(user)
        if(req.session.loggedIn){
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        }
        res.render("user/user-view",{user, userName,cartCount, userHeader:true});
    },
    userLogin : (req, res) =>{
        if(req.session.loggedIn){
            res.redirect('/');
          }else{
            res.render('user/user-login',{loginErr:req.session.loginErr});
            req.session.loginErr=false;
          }
    },
    userSignup : (req, res) =>{
        if(req.session.loggedIn==true){
            res.redirect('/');
          }else{
            res.render('user/user-signup');
          }
    },
    userSignupPost : (req,res) =>{
        userHelpers.doSignUp(req.body).then((response)=>{
            req.session.loggedIn=true;
            req.session.user=response;
            console.log(req.session.user);
            res.redirect('/');
          })
    },
    userLoginPost : (req, res) =>{
        userHelpers.doLogin(req.body).then((response)=>{
            if(response.status){
              if(!response.isBlocked){
                req.session.loggedIn=true;
                req.session.user=response.user;
                req.session.userName=response.userName
                res.redirect('/');
              }else{
                req.session.loginErr="YOU ARE BLOCKED!!";
                res.redirect('/login');
              }
              
            }else{
              req.session.loginErr="Invalid username or password";
              res.redirect('/login');
            }
          })
    },
    userLogout : (req,res) =>{
        req.session.destroy();
        res.redirect('/');
    },
    otpLogin : (req,res) =>{
      if(req.session.loggedIn){
          res.redirect('/');
      }else{
          res.render('user/otp-login');
      } 
  },
  userShop : async(req,res) =>{
    let cartCount = null;
        let user = req.session.user;
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let wishlist= await productHelpers.getWishStatus(req.session.user._id)
        productHelpers.getAllProducts().then((products)=>{
           productHelpers.getAllCategory().then((category)=>{
            for(let i=0;i<products.length;i++){
              products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            }
         res.render('user/user-shop',{user,products,wishlist,category,cartCount,userHeader:true});
          })
        })
  },
  filterCategory:async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    let products =await productHelpers.getFilterCategory(req.params.id)
    productHelpers.getAllCategory().then((category)=>{
    res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
    })
  },
  filterPrice:async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    let products = await productHelpers.getFilterPrice(req.body)
    productHelpers.getAllCategory().then((category)=>{
    res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
    })
  },
  contact : async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    res.render('user/contact',{user,cartCount,userHeader:true});
  },
  productDetails : async(req,res) =>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    let product = await productHelpers.getProductDetails(req.params.id)
    let rupee = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
    let proPrice = rupee.format(product.price)
      res.render('user/product-details',{user,product,proPrice,cartCount,userHeader:true});
  },
  userCart : async (req,res) =>{
    let cartCount = null;
    let user = req.session.user;
    let userId =req.session.user._id;
    let totalValue = 0;
    let products = await userHelpers.getCartProducts(req.session.user._id);
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    if(total>0){
      totalValue = total;
    }
    console.log(products)
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    res.render('user/user-cart',{user,userId,products,totalValue,cartCount,userHeader:true}); 
  },
  addToCart : (req,res) =>{
    try{
      console.log("api call")
      userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
        res.json({status:true})
      })
    }
    catch(err){
      console.log(err)
    }
  },
  changeProductQuantity : (req,res)=>{
    userHelpers.changeQuantity(req.body).then(async(response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
    console.log("quantity")
    })
  },
  removeProduct:(req,res)=>{
    userHelpers.removePro(req.body).then((response)=>{
      res.json(response)
    })
  },
  userProfile : async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let userData = await userHelpers.getUserDetails(req.session.user._id)
      if(userData){
        res.render('user/user-profile',{user,userData,cartCount,userHeader:true});
      }
    }
    catch(err){
      console.log(err);
    }
  },
  updateProfile : async(req,res)=>{
    console.log("arrived");
    user = await userHelpers.updateProfile(req.session.user._id,req.body)
    res.redirect('/user-profile');
  },
  checkout : async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let total = await userHelpers.getTotalAmount(req.session.user._id)
      let products = await userHelpers.getCartProducts(req.session.user._id);
      res.render('user/checkout',{user,total,products,cartCount,userHeader:true}); 
    }
    catch(err){
      console.log(err)
    }
  },
  checkoutPost: async(req,res)=>{
    let products = await userHelpers.getCartProductList(req.body.userId)
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      if(req.body['payment-method']==='cod'){
        res.json({codSuccess:true})
      }
      else{
        userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
        })
      }
    })
    console.log(req.body)
  },
  orderSuccess :async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    res.render('user/order-success',{user,cartCount,userHeader:true}); 
  },
  wishlist : async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    productHelpers.getWishlistProducts(req.session.user._id).then((wishItem)=>{
    res.render('user/wishlist',{user,wishItem,cartCount,userHeader:true});
    })
  },
  addToWishlist : async(req,res)=>{
    let user = req.session.user;
    console.log(req.params.id)
    console.log(req.session.user._id);
    await productHelpers.addToWishlist(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/user-shop');
    })
  },
  removeWishlist : async(req,res)=>{
    productHelpers.removeWish(req.body).then((response)=>{
    res.json(response)
    })
  },
  userOrder: async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    let orders = await userHelpers.getUserOrder(req.session.user._id)
    console.log(orders.date);
    res.render('user/user-order',{user,orders,cartCount,userHeader:true});
  },
  userAddress: async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    res.render('user/user-address',{user,cartCount,userHeader:true});
  },
  viewOrderProduct: async(req,res)=>{
    let cartCount = null;
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    let products = await userHelpers.getOrderProduct(req.params.id)
    let orders = await userHelpers.getUserOrder(req.session.user._id)
    console.log(orders);
    res.render('user/order-product-view',{user,products,orders,cartCount,userHeader:true});
  },
  verifyPayment: (req,res)=>{
    console.log(req.body);
  }
    
}
