
var express = require('express');
var router = express.Router();
var controller = require("../controllers/user-controller")
const upload = require("../utils/multer");
const authUser = require('../middlewares/user-middleware')

/* GET home page. */
router.get('/', controller.get)

router.get('/login', controller.userLogin)

router.get('/signup',controller.userSignup)

router.post('/signup', controller.userSignupPost)

router.post("/login",controller.userLoginPost)

router.get('/logout',controller.userLogout)

router.get('/otp-login',controller.otpLogin);

router.get('/user-shop', authUser.varifyLogin,controller.userShop);

router.get('/filter-category/:id', authUser.varifyLogin,controller.filterCategory)

router.post('/filter-price', authUser.varifyLogin,controller.filterPrice)

router.get('/contact', authUser.varifyLogin,controller.contact);

router.get('/product-details/:id', authUser.varifyLogin,controller.productDetails);

router.get('/user-cart', authUser.varifyLogin,controller.userCart);

router.get('/add-to-cart/:id', authUser.varifyLogin,controller.addToCart);

router.post('/change-product-quantity',controller.changeProductQuantity);

router.post('/remove-product',controller.removeProduct);

router.get('/user-profile', authUser.varifyLogin,controller.userProfile);

router.post('/user-profile', authUser.varifyLogin,controller.updateProfile);

router.get('/checkout', authUser.varifyLogin,controller.checkout);

router.post('/checkout', authUser.varifyLogin,controller.checkoutPost);

router.get('/order-success', authUser.varifyLogin,controller.orderSuccess);

router.get('/wishlist', authUser.varifyLogin,controller.wishlist);

router.get('/add-to-wishlist/:id', authUser.varifyLogin,controller.addToWishlist);

router.post('/remove-wishlist', authUser.varifyLogin,controller.removeWishlist);

router.get('/user-order', authUser.varifyLogin,controller.userOrder);

router.get('/view-order-product/:id', authUser.varifyLogin,controller.viewOrderProduct);

router.get('/user-address', authUser.varifyLogin,controller.userAddress);

router.post('/verify-payment',controller.verifyPayment)




module.exports = router;
