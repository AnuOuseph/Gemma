
var express = require('express');
var router = express.Router();
var controller = require("../controllers/user-controller")
const upload = require("../utils/multer");
const authUser = require('../middlewares/user-middleware')

/* GET home page. */
router.get('/', controller.get)

//Authentication Routes
router.get('/login', controller.userLogin)
router.get('/signup',controller.userSignup)
router.post('/signup', controller.userSignupPost)
router.post("/login",controller.userLoginPost)
router.get('/logout',controller.userLogout)
router.get('/otp-login',controller.otpLogin);
router.post('/otp-login',controller.checkUser)
router.post('/otp-verify',controller.otpVerify)
router.get('/forgot-password',controller.forgotPassword)
router.get('/reset-password',controller.resetPassword)
router.post('/user-verify',controller.userVerify)
router.post('/reset-new-password',controller.resetNewPassword)

//Shop Routes
router.get('/user-shop', authUser.varifyLogin,controller.userShop);
router.get('/filter-category/:id', authUser.varifyLogin,controller.filterCategory)
router.post('/filter-price', authUser.varifyLogin,controller.filterPrice)
router.post('/category-filter-price', authUser.varifyLogin,controller.categoryFilterPrice)

//Contact Route
router.get('/contact', authUser.varifyLogin,controller.contact);

//Product Route
router.get('/product-details/:id', authUser.varifyLogin,controller.productDetails);

//Cart Route
router.get('/user-cart', authUser.varifyLogin,controller.userCart);
router.post('/add-to-cart/:id', authUser.varifyLogin,controller.addToCart);
router.post('/change-product-quantity',controller.changeProductQuantity);
router.post('/remove-product',controller.removeProduct);

//Profile Route
router.get('/user-profile', authUser.varifyLogin,controller.userProfile);
router.post('/user-profile', authUser.varifyLogin,controller.updateProfile);
router.post('/add-profile-image',authUser.varifyLogin, upload.single('profile'),controller.addProfileImage)

//Checkout Route
router.get('/checkout', authUser.varifyLogin,controller.checkout);
router.post('/checkout', authUser.varifyLogin,controller.checkoutPost);
router.get('/order-success', authUser.varifyLogin,controller.orderSuccess);

//Wishlist Route
router.get('/wishlist', authUser.varifyLogin,controller.wishlist);
router.post('/add-to-wishlist', authUser.varifyLogin,controller.addToWishlist);
router.post('/remove-wishlist', authUser.varifyLogin,controller.removeWishlist);

//Order Route
router.get('/user-order', authUser.varifyLogin,controller.userOrder);
router.get('/cancel-order/:id',authUser.varifyLogin,controller.cancelOrder)
router.get('/return-order/:id',authUser.varifyLogin,controller.returnOrder)
router.get('/view-order-product/:id', authUser.varifyLogin,controller.viewOrderProduct);

//Address Route
router.get('/user-address', authUser.varifyLogin,controller.userAddress);
router.post('/verify-payment',controller.verifyPayment)
router.post('/add-address',authUser.varifyLogin,controller.addAddress)
router.post('/add-check-address',authUser.varifyLogin,controller.addCheckAddress)
router.post('/edit-address/:id',authUser.varifyLogin,controller.editAddress)
router.get('/delete-address/:id',authUser.varifyLogin,controller.deleteAddress)

//Operations Route
router.get('/change-password',authUser.varifyLogin,controller.changePassword)
router.post('/change-password',authUser.varifyLogin,controller.changePasswordPost)
router.post('/new-password',authUser.varifyLogin,controller.newPassword)
router.get('/rewards',authUser.varifyLogin,controller.getRewards)
router.post('/coupon-redeem',authUser.varifyLogin,controller.CouponRedeem)
router.get('/low-high-sort',authUser.varifyLogin,controller.lowHighSort)
router.get('/high-low-sort',authUser.varifyLogin,controller.HighLowSort)
router.get('/low-high-sort-category',authUser.varifyLogin,controller.lowHighSortCategory)
router.get('/high-low-sort-category',authUser.varifyLogin,controller.highLowSortCategory)
router.post('/search',authUser.varifyLogin,controller.search)




module.exports = router;
