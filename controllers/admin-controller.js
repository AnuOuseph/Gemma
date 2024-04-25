const db = require('../config/connection');
const collection = require('../config/collections');
const userHelpers = require('../models/user-helpers');
const productHelpers = require('../models/product-helpers');
const cloudinary = require('../utils/cloudinary');
const upload = require("../utils/multer");
const bcrypt = require('bcrypt');
var slugify = require('slugify')

module.exports = {
    get : (req, res) =>{
        if(req.session.adminLoggedIn){ 
            res.redirect('/admin');
          }else{
            res.render('admin/login',{adminLoginErr:req.session.adminLoginErr});
            req.session.adminLoginErr=false;
          }
    },
    post : async(req, res) =>{
        let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminEmail:req.body.email});
        if(req.body.email==user.adminEmail&&req.body.password==user.adminPassword){
            req.session.admin=req.body.email;
            req.session.adminLoggedIn=true;
            req.session.adminName=user.adminName;
            res.redirect('/admin');
        }else{
            req.session.adminLoginErr="Invalid username or password";
            res.redirect('/admin/login'); 
        }

    },
    dashboard : async(req, res) =>{
        let currentDate =new Date();
        let dailySaleAmount =0
        let weeklySaleAmount =0
        let monthlySaleAmount =0
        let dailySale =await productHelpers.dailysales(currentDate)
        let weeklySale =await productHelpers.weeklysales(currentDate)
        let monthlySale =await productHelpers.monthlysales(currentDate)
        for(let i=0;i<dailySale.length;i++){
            dailySaleAmount += dailySale[i].totalAmount
          }
          dailySaleAmount = dailySaleAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
          for(let i=0;i<weeklySale.length;i++){
            weeklySaleAmount += weeklySale[i].totalAmount
          }
          weeklySaleAmount = weeklySaleAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
          for(let i=0;i<monthlySale.length;i++){
            monthlySaleAmount += monthlySale[i].totalAmount
          }
          monthlySaleAmount = monthlySaleAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        res.render('admin/admin-view',{admin:true,dailySaleAmount,weeklySaleAmount,monthlySaleAmount, adminName:req.session.adminName});
    },
    logout : (req, res) => {
        req.session.adminLoggedIn=false;
        res.redirect('/admin/login');
    },
    productView : (req,res) =>{
        productHelpers.getAllProducts().then((products)=>{
            res.render('admin/product-view',{admin:true,products,adminName:req.session.adminName});
        }) 
    },
    addProducts : (req,res) =>{
        userHelpers.getAllCategory().then((category)=>{
        res.render('admin/add-products', {admin:true,category, adminName:req.session.adminName});
        })
    },
    addProductsPost : async (req,res) =>{
        try{
            var imgUrlList = []
            for(var i=0;i<req.files.length;i++){
                var filePath = req.files[i].path;
                const result = await cloudinary.uploader.upload(filePath);
                imgUrlList.push(result.url)
            } 
            const slug = slugify(req.body.name)
            req.body.slug = slug
            productHelpers.addProduct(req.body,async (id)=>{
                if(imgUrlList !== 0){
                    productHelpers.addProductImage(id,imgUrlList).then((response)=>{
                    })
                } 
            })     
        }catch(err){
            console.log(err)
        }
        finally{
            res.redirect('/admin/add-products');
        }  
    },
    editProduct :async(req,res) =>{
        let product = await productHelpers.getProductDetails(req.params.id);
        userHelpers.getAllCategory().then((category)=>{
        res.render('admin/edit-products',{product,admin:true , category,adminName:req.session.adminName});  
        })
    },
    editProductPost : async(req,res) =>{
        try{
            var imgUrlList = []
            for(var i=0;i<req.files.length;i++){
                var filePath = req.files[i].path;
                const result = await cloudinary.uploader.upload(filePath);
                imgUrlList.push(result.url)
            }
            productHelpers.updateProduct(req.body,req.params.id).then(()=>{
                if(imgUrlList.length !== 0){
                    productHelpers.addProductImage(req.params.id,imgUrlList).then((response)=>{
                    })
                } 
            })     
        }catch(err){
            console.log(err)
        }
        finally{
            res.redirect('/admin/product-view');
        }
    },
    unlistProduct : (req,res) =>{
        try{
        let proId = req.params.id;
        productHelpers.unlistProduct(proId).then((response) =>{
            res.redirect('/admin/product-view');
        })
        }catch(err){
            console.log(err)
        }
    },
    listProduct : (req,res) =>{
        try{
        let proId = req.params.id;
        productHelpers.listProduct(proId).then((response) =>{
            res.redirect('/admin/product-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    userView : (req,res) =>{
        userHelpers.getAlluser().then((user)=>{
            res.render('admin/user-details', {admin:true, user, adminName:req.session.adminName});
        })
    },
    addUser : (req,res) =>{
        res.render('admin/add-user', {admin:true , adminName:req.session.adminName});
    },
    addUserPost : (req,res) =>{
        try{
        userHelpers.doSignUp(req.body).then((response)=>{
            if(response){
                res.redirect('/admin/user-details');
            }
        })
        }catch(err){
            console.log(err);
        }
    },
    blockUser : (req, res) =>{
        try{
        let userId = req.params.id;
        userHelpers.blockUser(userId).then((response) =>{
            res.redirect('/admin/user-details');
        })
        }catch(err){
            console.log(err);
        }
    },
    unblockUser : (req,res)=>{
        try{
        let userId = req.params.id;
        userHelpers.unblockUser(userId).then((response) =>{
            res.redirect('/admin/user-details');
        })
        }catch(err){
            console.log(err);
        }
    },
    categoryView:(req,res)=>{
        userHelpers.getAllCategory().then((category)=>{
            res.render('admin/category-view', {admin:true,category, adminName:req.session.adminName});
        })
    },
    addCategory : (req,res) =>{
        res.render('admin/add-category', {admin:true , adminName:req.session.adminName, err:req.session.ErrMessage});
        req.session.ErrMessage =false
    },
    addCategoryPost: (req,res)=>{
        try{
        const slugCategory = slugify(req.body.category)
        req.body.slugCategory = slugCategory
        productHelpers.addCategory(req.body).then((response)=>{
            if(response.categoryExist){
                req.session.ErrMessage = response.message
                res.redirect('/admin/add-category')
            }
            else{
            res.redirect('/admin/add-category')
            }
        })
        }catch(err){
            console.log(err);
        }
    },
    editCategory:(req,res)=>{
        productHelpers.getCategory(req.params.id).then((category)=>{
            res.render('admin/edit-category', {admin:true ,category, adminName:req.session.adminName, err:req.session.catErrMessage})
        })
       
    },
    editCategoryPost:(req,res)=>{
        try{
        productHelpers.updateCategory(req.params.id,req.body).then((response)=>{
            if(response.categoryExist){
                req.session.catErrMessage = response.message
                res.redirect('back')
            }
            else{
                res.redirect('/admin/category-view')
            }
        })
        }catch(err){
            console.log(err);
        }
    },
    unlistCategory: (req,res)=>{
        try{
        let categoryId = req.params.id;
        productHelpers.unlistCategory(categoryId).then((response) =>{
            res.redirect('/admin/category-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    listCategory: (req,res)=>{
        try{
        let categoryId = req.params.id;
        productHelpers.listCategory(categoryId).then((response) =>{
            res.redirect('/admin/category-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    bannerView : (req,res) =>{
        productHelpers.getAllBanner().then((banners)=>{
        res.render('admin/banner-view', {admin:true,banners, adminName:req.session.adminName});
        })
    },
    addBanner: (req,res)=>{
        res.render('admin/add-banner', {admin:true, adminName:req.session.adminName});
    },
    addBannerPost:async(req,res)=>{
        try{
            const result = await cloudinary.uploader.upload(req.file.path); 
            productHelpers.addBanner(req.body,async (id)=>{
                if(result.url !== 0){
                    productHelpers.addBannerImage(id,result.url).then((response)=>{
                    })
                } 
            })     
        }catch(err){
            console.log(err)
        }
        finally{
            res.redirect('/admin/add-banner');
        }  
    },
    activateBanner:(req,res)=>{
        try{
        let bannerId = req.params.id;
        productHelpers.activateBanner(bannerId).then((response) =>{
            res.redirect('/admin/banner-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    orderView :(req,res)=>{
        productHelpers.getAllOrders().then((orders)=>{
            res.render('admin/order-view', {admin:true,orders, adminName:req.session.adminName});
        })
    },
    orderDetails: async(req,res)=>{
     let details = await productHelpers.getOrderDetails(req.params.id)
        let products = await userHelpers.getOrderProduct(req.params.id)
        res.render('admin/order-details',{admin:true,products,details,adminName:req.session.adminName})  
    },
    cancelOrder: (req,res)=>{
        try{
        let orderId = req.params.id;
        productHelpers.cancelOrder(orderId).then((response) =>{
            res.redirect('/admin/order-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    returnOrder: (req,res)=>{
        try{
        let orderId = req.params.id;
        let userId = req.session.user._id
        productHelpers.returnOrder(orderId,userId).then((response) =>{
            res.redirect('/admin/order-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    orderShipped: (req,res)=>{
        try{
        let orderId = req.params.id;
        productHelpers.orderShipped(orderId).then((response) =>{
            res.redirect('/admin/order-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    orderDelivered: (req,res)=>{
        try{
        let orderId = req.params.id;
        let today = new Date()
        productHelpers.orderDelivered(orderId,today).then((response) =>{
            res.redirect('/admin/order-view');
        })
        }catch(err){
            console.log(err);
        }
    },
    couponView: (req,res)=>{
        productHelpers.getAllCoupons().then((coupons)=>{
        res.render('admin/coupon-view', {admin:true,coupons, adminName:req.session.adminName});
        })
    },
    addCoupon: (req,res)=>{
        res.render('admin/add-coupon', {admin:true, adminName:req.session.adminName,Err:req.session.couponErr});
        req.session.couponErr = false;
    },
    addCouponPost:(req,res)=>{
        try{
        productHelpers.addCoupon(req.body).then((response)=>{
            if(response.status){
                res.redirect('/admin/add-coupon')
            }else{
                req.session.couponErr = "Coupon Already Exist!!"
                res.redirect('/admin/add-coupon')
            }
        })
        }catch(err){
            console.log(err);
        }
    },
    editCoupon:(req,res)=>{
        productHelpers.getCoupon(req.params.id).then((coupon)=>{
            res.render('admin/edit-coupon', {admin:true ,coupon, adminName:req.session.adminName, err:req.session.couponErrMessage})
        })
       
    },
    editCouponPost:(req,res)=>{
        try{
            productHelpers.updateCoupon(req.params.id,req.body).then((response)=>{
            if(response.couponExist){
                req.session.couponErrMessage = response.message
                res.redirect('back')
            }
            else{
                res.redirect('/admin/coupon-view')
            }
        })
        }catch(err){
            console.log(err);
        }
    },
    deleteCoupon:(req,res)=>{
        try{
            let couponId = req.params.id;
            productHelpers.deleteCoupon(couponId).then((response) =>{
                res.redirect('/admin/coupon-view');
            })
        }catch(err){
                console.log(err);
        }
    },
    salesReport:(req,res)=>{
        productHelpers.getAllSales().then((orders)=>{
        const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        for(let i=0;i<orders.length;i++){
         orders[i].date = orders[i].date.getDate() + "-" + months[orders[i].date.getMonth()] + "-" + orders[i].date.getFullYear()
        }
        res.render('admin/sales', {admin:true,orders,adminName:req.session.adminName});
        })
    },
    filterSales:async(req,res)=>{
        let fromDate =new Date(req.body.fromDate);
        let toDate=new Date(req.body.toDate);
        
        let sales = await productHelpers.getFilterSales(fromDate,toDate)
        const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        for(let i=0;i<sales.length;i++){
            sales[i].date = sales[i].date.getDate() + "-" + months[sales[i].date.getMonth()] + "-" + sales[i].date.getFullYear()
          }
        res.render('admin/filter-sales',{admin:true,sales,adminName:req.session.adminName})
    },
    chartDetails : async(req, res) =>{
        let delivers = await productHelpers.deliverGraph();
        let orderStatus = await productHelpers.ordersGraph();
        res.json({delivers, orderStatus});
    }
}