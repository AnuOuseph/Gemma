const db = require('../config/connection');
const collection = require('../config/collections');
const userHelpers = require('../models/user-helpers');
const productHelpers = require('../models/product-helpers');
const cloudinary = require('../utils/cloudinary');
const upload = require("../utils/multer");
const bcrypt = require('bcrypt');

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
        console.log(req.body.email)
        let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminEmail:req.body.email});
        if(req.body.email==user.adminEmail&&req.body.password==user.adminPassword){
            req.session.admin=req.body.email;
            req.session.adminLoggedIn=true;
            req.session.adminName=user.adminName;
            console.log(req.session.adminName);
            res.redirect('/admin');
        }else{
            req.session.adminLoginErr="Invalid username or password";
            res.redirect('/admin/login'); 
        }

    },
    dashboard : (req, res) =>{
        console.log(req.session.adminName);
        res.render('admin/admin-view',{admin:true, adminName:req.session.adminName});
    },
    logout : (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    },
    productView : (req,res) =>{
        productHelpers.getAllProducts().then((products)=>{
            console.log(products)
            res.render('admin/product-view',{admin:true,products,adminName:req.session.adminName});
        }) 
    },
    addProducts : (req,res) =>{
        productHelpers.getAllCategory().then((category)=>{
        res.render('admin/add-products', {admin:true,category, adminName:req.session.adminName});
        })
    },
    addProductsPost : async (req,res) =>{
        console.log("hy")
        try{
            console.log("hello")
            //productHelpers.addProduct(req.body,async (id)=>{
            console.log("wel")
            var imgUrlList = []
            for(var i=0;i<req.files.length;i++){
                var filePath = req.files[i].path;
                const result = await cloudinary.uploader.upload(filePath);
                imgUrlList.push(result.url)
               // console.log(result); 
            }
            productHelpers.addProduct(req.body,async (id)=>{
                if(imgUrlList !== 0){
                    productHelpers.addProductImage(id,imgUrlList).then((response)=>{
                     console.log(response)
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
        res.render('admin/edit-products',{product,admin:true ,adminName:req.session.adminName});  
    },
    editProductPost : async(req,res) =>{
        try{
            console.log(req.files);
            console.log(req.body);
            var imgUrlList = []
            for(var i=0;i<req.files.length;i++){
                var filePath = req.files[i].path;
                console.log(`filepath ${filePath}`)
                const result = await cloudinary.uploader.upload(filePath);
                imgUrlList.push(result.url)
                console.log(`imagurllist :   ${imgUrlList}`);
               // console.log(result); 
            }
            productHelpers.updateProduct(req.body,req.params.id).then(()=>{
                if(imgUrlList.length !== 0){
                    productHelpers.addProductImage(req.params.id,imgUrlList).then((response)=>{
                        console.log(response)
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
        let proId = req.params.id;
        console.log((proId));
        productHelpers.unlistProduct(proId).then((response) =>{
            res.redirect('/admin/product-view');
        })
    },
    listProduct : (req,res) =>{
        let proId = req.params.id;
        console.log((proId));
        productHelpers.listProduct(proId).then((response) =>{
            res.redirect('/admin/product-view');
        })
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
        userHelpers.doSignUp(req.body).then((response)=>{
            console.log(response)
            if(response){
                res.redirect('/admin/user-details');
            }
        })
    },
    blockUser : (req, res) =>{
        let userId = req.params.id;
        console.log((userId));
        userHelpers.blockUser(userId).then((response) =>{
            res.redirect('/admin/user-details');
        })
    },
    unblockUser : (req,res)=>{
        let userId = req.params.id;
        console.log((userId));
        userHelpers.unblockUser(userId).then((response) =>{
            res.redirect('/admin/user-details');
        })
    },
    categoryView:(req,res)=>{
        productHelpers.getAllCategory().then((category)=>{
            res.render('admin/category-view', {admin:true,category, adminName:req.session.adminName});
        })
    },
    addCategory : (req,res) =>{
        res.render('admin/add-category', {admin:true , adminName:req.session.adminName});
    },
    addCategoryPost: (req,res)=>{
        productHelpers.addCategory(req.body).then((response)=>{
            console.log(response);
            res.redirect('/admin/add-category')
        })
    },
    unlistCategory: (req,res)=>{
        let categoryId = req.params.id;
        console.log((categoryId));
        productHelpers.unlistCategory(categoryId).then((response) =>{
            res.redirect('/admin/category-view');
        })
    },
    listCategory: (req,res)=>{
        let categoryId = req.params.id;
        console.log((categoryId));
        productHelpers.listCategory(categoryId).then((response) =>{
            res.redirect('/admin/category-view');
        })
    },
    bannerView : (req,res) =>{
        res.render('admin/user-details', {admin:true, user, adminName:req.session.adminName});
    },
    orderView :(req,res)=>{
        productHelpers.getAllOrders().then((orders)=>{
            console.log(orders)
            res.render('admin/order-view', {admin:true,orders, adminName:req.session.adminName});
        })
    }
    
}