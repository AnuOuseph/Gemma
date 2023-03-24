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

router.get('/unlist-category/:id', authAdmin.varifyLogin, controller.unlistCategory)

router.get('/list-category/:id', authAdmin.varifyLogin, controller.listCategory)

router.get('/banner-view', authAdmin.varifyLogin, controller.bannerView)

router.get('/order-view',authAdmin.varifyLogin,controller.orderView)


module.exports = router;