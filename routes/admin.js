var express = require('express');
var router = express.Router();
var controller = require("../controllers/admin-controller");
const upload = require("../utils/multer");
const authAdmin= require('../middlewares/admin-middleware')



/* GET users listing. */
router.get('/login',controller.get)

router.post('/login', controller.post)

router.get('/', authAdmin.varifyLogin, controller.dashboard)

router.get('/logout', controller.logout)

router.get('/product-view', authAdmin.varifyLogin, controller.productView)

router.get('/add-products', authAdmin.varifyLogin, controller.addProducts)

router.post('/add-products', authAdmin.varifyLogin, upload.array("image",4),controller.addProductsPost)

router.get('/edit-products/:id', authAdmin.varifyLogin, controller.editProduct)

router.post('/edit-products/:id', authAdmin.varifyLogin, upload.array("image",4),controller.editProductPost)

router.get('/unlist-product/:id', authAdmin.varifyLogin, controller.unlistProduct)

router.get('/list-product/:id', authAdmin.varifyLogin, controller.listProduct)

router.get('/user-details', authAdmin.varifyLogin, controller.userView)

router.get('/add-user', authAdmin.varifyLogin, controller.addUser)

router.post('/add-user', authAdmin.varifyLogin, controller.addUserPost)

router.get('/block-user/:id', controller.blockUser)

router.get('/unblock-user/:id', controller.unblockUser)

router.get('/category-view', authAdmin.varifyLogin, controller.categoryView)

router.get('/add-category', authAdmin.varifyLogin, controller.addCategory)

router.post('/add-category', authAdmin.varifyLogin, controller.addCategoryPost)

router.get('/edit-category/:id',authAdmin.varifyLogin,controller.editCategory)

router.post('/edit-category/:id',authAdmin.varifyLogin,controller.editCategoryPost)

router.get('/unlist-category/:id', authAdmin.varifyLogin, controller.unlistCategory)

router.get('/list-category/:id', authAdmin.varifyLogin, controller.listCategory)

router.get('/banner-view', authAdmin.varifyLogin, controller.bannerView)

router.get('/add-banner',authAdmin.varifyLogin,controller.addBanner)

router.post('/add-banner',authAdmin.varifyLogin,upload.single('image'),controller.addBannerPost)

router.get('/activate-banner/:id',authAdmin.varifyLogin,controller.activateBanner)

router.get('/order-view',authAdmin.varifyLogin,controller.orderView)

router.get('/order-details/:id', authAdmin.varifyLogin,controller.orderDetails)

router.get('/cancel-order/:id',authAdmin.varifyLogin, controller.cancelOrder)

router.get('/return-order/:id',authAdmin.varifyLogin,controller.returnOrder)

router.get('/order-shipped/:id',authAdmin.varifyLogin,controller.orderShipped)

router.get('/order-delivered/:id',authAdmin.varifyLogin,controller.orderDelivered)

router.get('/coupon-view',authAdmin.varifyLogin,controller.couponView)

router.get('/add-coupon',authAdmin.varifyLogin,controller.addCoupon)

router.post('/add-coupon',authAdmin.varifyLogin,controller.addCouponPost)

router.get('/edit-coupon/:id',authAdmin.varifyLogin,controller.editCoupon)

router.post('/edit-coupon/:id',authAdmin.varifyLogin,controller.editCouponPost)

router.get('/delete-coupon/:id',authAdmin.varifyLogin,controller.deleteCoupon)

router.get('/chart-details',authAdmin.varifyLogin,controller.chartDetails)

router.get('/sales-report',authAdmin.varifyLogin,controller.salesReport)

router.post('/filter-sales',authAdmin.varifyLogin,controller.filterSales)


module.exports = router;