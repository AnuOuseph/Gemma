const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const userHelpers = require('../models/user-helpers');
const productHelpers=require('../models/product-helpers');
const cloudinary = require('../utils/cloudinary');
const upload = require("../utils/multer");
var sharp = require('sharp');
const { log } = require('handlebars');
let userHeader;

module.exports = {
  get : async(req, res) => {
    try{
    let cartCount = null;
      let user = req.session.user;
      let userName = req.session.userName;
      if(req.session.loggedIn){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      }
      let banners = await userHelpers.getAllBanner()
      let popularProducts = await productHelpers.getPopularproducts()
      let latestProducts = await productHelpers.getLatestProducts()
      res.render("user/user-view",{user,banners,popularProducts,latestProducts,userName,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userLogin : (req, res) =>{
    try{
      if(req.session.loggedIn){
        res.redirect('/');
      }else{
        res.render('user/user-login',{loginErr:req.session.loginErr});
        req.session.loginErr=false;
      }
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userSignup : (req, res) =>{
    try{
      if(req.session.loggedIn==true){
        res.redirect('/');
      }else{
        res.render('user/user-signup',{signupErr:req.session.signupErr});
      }
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userSignupPost : (req,res) =>{
    try{
      userHelpers.doSignUp(req.body).then((response)=>{
        if(response.status){
          req.session.loggedIn=true;
          req.session.user=response;
          res.redirect('/');
        }else{
          req.session.signupErr="ALREADY REGISTERED!!";
          res.redirect('/signup')
        }
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userLoginPost : (req, res) =>{
    try{
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
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userLogout : (req,res) =>{
      req.session.loggedIn=false
      req.session.user=false;
      res.redirect('/');
  },
  otpLogin : (req,res) =>{
    try{
      if(req.session.loggedIn){
          res.redirect('/');
      }else{
          res.render('user/otp-login');
      } 
    }catch(err){
      res.render('user/err',{err})
    }
  },
  checkUser:(req,res)=>{
    try{
    userHelpers.checkUser(req.body).then((response)=>{
      res.json(response)
    })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  otpVerify:(req,res)=>{
    try{
      userHelpers.findUser(req.body).then((response)=>{
        req.session.loggedIn=true;
        req.session.user=response.user;
        req.session.userName=response.userName
        res.json({
          status:true
        })
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  forgotPassword : (req,res) =>{
    try{
      if(req.session.loggedIn){
        res.redirect('/');
      }else{
        res.render('user/forgot-password');
      }
    }catch(err){
      res.render('user/err',{err})
    } 
  },
  resetPassword : (req,res) =>{
    try{
      res.render('user/reset-password');
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userVerify:(req,res)=>{
    try{
      userHelpers.findUser(req.body).then((response)=>{
        req.session.user=response.user;
        req.session.userName=response.userName
        req.session.user._id = response.user._id
        res.json({
          status:true
        })
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  resetNewPassword:async(req,res)=>{
    try{
      password = await userHelpers.updatePassword(req.session.user._id,req.body)
      req.session.destroy();
      res.redirect('/');
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userShop : async(req,res) =>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let currentPage = req.query.page || 1;
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      let wishlist= await userHelpers.getWishStatus(req.session.user._id);
      let totalCount = await userHelpers.getProductCount()
      userHelpers.getAllUserProducts(currentPage).then((products)=>{
        userHelpers.getAllCategory().then((category)=>{
          for(let i=0;i<products.length;i++){
            products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
          }
        res.render('user/user-shop',{user,products,currentPage,totalCount,wishlist,category,cartCount,userHeader:true});
        })
      })
    }catch(err){
      console.log(err);
    }
  },
  filterCategory:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products =await productHelpers.getFilterCategory(req.params.id)
      req.session.categoryId = req.params.id;
      userHelpers.getAllCategory().then((category)=>{
        for(let i=0;i<products.length;i++){
          products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
        res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  filterPrice:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products = await productHelpers.getFilterPrice(req.body)
      userHelpers.getAllCategory().then((category)=>{
        for(let i=0;i<products.length;i++){
          products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
        res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  categoryFilterPrice:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let categoryId = req.session.categoryId;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products = await productHelpers.categoryGetFilterPrice(req.body,categoryId)
      userHelpers.getAllCategory().then((category)=>{
        for(let i=0;i<products.length;i++){
          products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
      res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  contact : async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      res.render('user/contact',{user,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  productDetails : async(req,res) =>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let product = await productHelpers.getProductDetails(req.params.id)
      let similarProducts = await productHelpers.getSimilarProducts(req.params.id)
      let rupee = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
      let proPrice = rupee.format(product.price)
      res.render('user/product-details',{user,product,proPrice,similarProducts,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userCart : async (req,res) =>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let userId =req.session.user._id;
      let totalValue = 0;
      let cartEmpty = Boolean(false)
      let products = await userHelpers.getCartProducts(req.session.user._id);
      let total = await userHelpers.getTotalAmount(req.session.user._id);
      if(total>0){
        totalValue = total;
      }
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      if(cartCount==0){
        cartEmpty = Boolean(true)
      }
      let wallet = await userHelpers.getWalletAmount(req.session.user._id)
      res.render('user/user-cart',{user,userId,products,wallet,cartEmpty,totalValue,cartCount,userHeader:true,Err:req.session.checkoutErr});
      req.session.checkoutErr = false; 
    }catch(err){
      res.render('user/err',{err})
    }
  },
  addToCart : (req,res) =>{
    try{
      userHelpers.addToCart(req.params.id,req.session.user._id,req.body).then((response)=>{
        res.json(response)
      })
    }
    catch(err){
      console.log(err)
    }
  },
  changeProductQuantity : async(req,res)=>{
    try{
      userHelpers.changeQuantity(req.body).then(async(response)=>{
      response.total = await userHelpers.getTotalAmount(req.body.user)
      res.json(response)
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  removeProduct:(req,res)=>{
    try{
      userHelpers.removePro(req.body).then((response)=>{
      res.json(response)
    })
    }catch(err){
      res.render('user/err',{err})
    }
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
    try{
      user = await userHelpers.updateProfile(req.session.user._id,req.body)
      res.redirect('/user-profile');
    }catch(err){
      res.render('user/err',{err})
    }
  },
  addProfileImage:async(req,res)=>{
    try{
      let userId= req.session.user._id;   
      const result = await cloudinary.uploader.upload(req.file.path); 
      if(result.url !== 0){
        userHelpers.addProfileImage(userId,result.url).then((response)=>{
        })
      }      
    }catch(err){
      console.log(err)
    }
    finally{
      res.redirect('/user-profile');
    }
  },
  checkout : async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let outOfStock = false;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let total = await userHelpers.getTotalAmount(req.session.user._id)
      let address = await userHelpers.getAllAddress(req.session.user._id)
      let products = await userHelpers.getCartProducts(req.session.user._id);
      for(let i=0;i<products.length;i++){
        if(products[i].product.productQuantity == 0){
          outOfStock = true;
        }
      }
      let wallet = await userHelpers.getWalletAmount(req.session.user._id)
      for(let i=0;i<products.length;i++){
        if(products[i].product.productQuantity == 0){
          products.splice(i, 1);
        }
      }
      let coupons = await productHelpers.getAllCoupons()
      if(outOfStock){
        req.session.checkoutErr = "Product is out of stock";
      res.redirect('/user-cart')
      }else{
      res.render('user/checkout',{user,total,coupons,wallet,address,products,cartCount,userHeader:true});
      } 
    }
    catch(err){
      console.log(err)
    }
  },
  checkoutPost: async(req,res)=>{
    try{
      let products = await userHelpers.getCartProductList(req.body.userId)
      let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
      let grandTotal = req.body.total
      userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
        req.session.orderId = orderId
        if(req.body['payment-method']==='cod'){
          for(let i=0;i<products.length;i++){
            userHelpers.decrementProQuantity(products[i].item,products[i].quantity)
          }
          let emptycart = userHelpers.emptyCart(req.session.user._id)
          let couponUsed = userHelpers.addUsedCoupons(req.session.couponId,req.session.user._id)
          res.json({codSuccess:true})
        }
        else if(req.body['payment-method']==='wallet'){
          for(let i=0;i<products.length;i++){
            userHelpers.decrementProQuantity(products[i].item,products[i].quantity)
          }
          let emptycart = userHelpers.emptyCart(req.session.user._id)
          let couponUsed = userHelpers.addUsedCoupons(req.session.couponId,req.session.user._id)
          let wallet = userHelpers.updateWallet(req.session.user._id,grandTotal)
          res.json({walletSuccess:true})
        }
        else{
          userHelpers.generateRazorpay(orderId,grandTotal).then((response)=>{
            res.json(response)
          })
        }
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  orderSuccess :async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let orderId = req.session.orderId;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let orderDetails = await productHelpers.getOrderDetails(orderId)
      const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      let date = orderDetails.date.getDate() + "-" + months[orderDetails.date.getMonth()] + "-" + orderDetails.date.getFullYear()
      res.render('user/order-success',{user,cartCount,orderDetails,date,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    } 
  },
  wishlist : async(req,res)=>{
    try{
      let cartCount = null;
      let wishCount = Boolean(false)
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let wishItem = await userHelpers.getWishlistProducts(req.session.user._id)
        if(wishItem.length == 0){
          wishCount = Boolean(true)
        }
      res.render('user/wishlist',{user,wishCount,wishItem,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  addToWishlist : async(req,res)=>{
    try{
      let user = req.session.user;
      await productHelpers.addToWishlist(req.body,req.session.user._id).then((response)=>{
        res.json(response)
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  removeWishlist : async(req,res)=>{
    try{
      productHelpers.removeWish(req.body).then((response)=>{
        res.json(response)
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userOrder: async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let current = new Date()
      let orderEmpty = Boolean(false)
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let orders = await userHelpers.getUserOrder(req.session.user._id,current)
      const deliveryDate = orders.delivery; 
      if(orders.length == 0){
        orderEmpty = Boolean(true)
      }
      const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      for(let i=0;i<orders.length;i++){
        orders[i].date = orders[i].date.getDate() + "-" + months[orders[i].date.getMonth()] + "-" + orders[i].date.getFullYear()
      }
      res.render('user/user-order',{user,orders,orderEmpty,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  cancelOrder:(req,res)=>{
    try{
      let orderId = req.params.id;
      let userId = req.session.user._id
      productHelpers.cancelOrder(orderId,userId).then((response) =>{
        res.redirect('/user-order');
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  returnOrder:(req,res)=>{
    try{
      let orderId = req.params.id;
      productHelpers.requestReturn(orderId).then((response) =>{
        res.redirect('/user-order');
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  userAddress: async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let address = await userHelpers.getAllAddress(req.session.user._id)
      res.render('user/user-address',{user,address,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  viewOrderProduct: async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products = await userHelpers.getOrderProduct(req.params.id)
      let orders = await userHelpers.getUserOrder(req.session.user._id)
      res.render('user/order-product-view',{user,products,orders,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  verifyPayment: async(req,res)=>{
    let products = await userHelpers.getCartProductList(req.session.user._id)
    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        for(let i=0;i<products.length;i++){
          userHelpers.decrementProQuantity(products[i].item,products[i].quantity)
         }
         let emptycart = userHelpers.emptyCart(req.session.user._id)
         let couponUsed = userHelpers.addUsedCoupons(req.session.couponId,req.session.user._id)
        res.json({status:true})
      })
    }).catch((err)=>{
      res.json({status:false})
    })
  },
  addAddress:async(req,res)=>{
    try{
      let user = req.session.user;
      let cartCount = null;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let address = await userHelpers.addAddress(req.body,req.session.user._id)
      res.redirect('/user-address');
    }catch(err){
      res.render('user/err',{err})
    }
  },
  addCheckAddress:async(req,res)=>{
    try{
      let user = req.session.user;
      let cartCount = null;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let address = await userHelpers.addAddress(req.body,req.session.user._id)
      res.redirect('/checkout');
    }catch(err){
      res.render('user/err',{err})
    }
  },
  editAddress:async(req,res)=>{
    try{
      userHelpers.getAddress(req.session.user._id,req.params.id,req.body).then(()=>{
        res.redirect('/user-address')
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  deleteAddress:async(req,res)=>{
    try{
      userHelpers.deleteAddress(req.session.user._id,req.params.id).then((response)=>{
        res.redirect('/user-address')
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  changePassword:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      res.render('user/change-password',{user,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  changePasswordPost:async(req,res)=>{
    try{
      let user = req.session.user;
      let cartCount = null;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      userHelpers.varifyPassword(req.body,req.session.user._id).then((response)=>{
        if(response.status){ 
          res.render('user/new-password',{user,cartCount,userHeader:true});
        }else{
          req.session.loginErr="Incorrect Password";
          res.redirect('/change-password');
        }
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  newPassword:async(req,res)=>{
    try{
      password = await userHelpers.updatePassword(req.session.user._id,req.body)
      req.session.destroy();
      res.redirect('/');
    }catch(err){
      res.render('user/err',{err})
    }
  },
  getRewards:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let rewards = await userHelpers.getAllRewards()
      res.render('user/user-rewards',{user,rewards,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  },
  CouponRedeem:async(req,res)=>{
    try{
      userHelpers.redeemCoupon(req.body,req.session.user._id).then((response)=>{
        req.session.couponId = response._id
        res.json(response)
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  lowHighSort:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products =await productHelpers.getLowToHigh()
      userHelpers.getAllCategory().then((category)=>{
        for(let i=0;i<products.length;i++){
          products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
        res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  lowHighSortCategory:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let categoryId = req.session.categoryId
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products =await productHelpers.getLowToHighCategory(categoryId)
      userHelpers.getAllCategory().then((category)=>{
        for(let i=0;i<products.length;i++){
          products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
        res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  highLowSortCategory:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      let categoryId = req.session.categoryId
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products =await productHelpers.getHighToLowCategory(categoryId)
      userHelpers.getAllCategory().then((category)=>{
        for(let i=0;i<products.length;i++){
          products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
      res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  HighLowSort :async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products =await productHelpers.getHighLow()
      userHelpers.getAllCategory().then((category)=>{
        for(let i=0;i<products.length;i++){
          products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
        res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
      })
    }catch(err){
      res.render('user/err',{err})
    }
  },
  search:async(req,res)=>{
    try{
      let cartCount = null;
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      let category = await userHelpers.getAllCategory()
      let products = await productHelpers.searchProducts(req.body)
      res.render('user/filter-category',{user,products,category,cartCount,userHeader:true});
    }catch(err){
      res.render('user/err',{err})
    }
  }

}
