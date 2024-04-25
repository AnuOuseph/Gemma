const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const collections = require('../config/collections');
const objectId = require('mongodb-legacy').ObjectId;
const Razorpay = require('razorpay');
const { log } = require('console');
var instance = new Razorpay({
    key_id: 'rzp_test_w5LFXl4hy4CQt2',
    key_secret: 'YKkvEfrV9IvQRFhgZJRxpLqi',
});

module.exports={
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.userStatus = Boolean(userData.userStatus)
            userData.password = await bcrypt.hash(userData.password, 10);
            let email = userData.email;
            let mobile = userData.phone;
            let regUser= await db.get().collection(collection.USER_COLLECTION).findOne({$or: [
                { email: email },
                { phone: mobile }
              ]})
            if(regUser){
                resolve({status:false})
            }else{
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async(data)=>{
                    dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId});
                    dataDoc.status=true;
                    resolve(dataDoc);
                })
            }
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){     
                        response.status=true; 
                        if(user.userStatus){
                            response.user=user;
                            response.userName = user.name;
                            response.isBlocked = false;
                            resolve(response);
                        }else{
                            response.isBlocked = true;
                            resolve(response);
                        }                                                                                                                                                     
                    }else{
                        resolve({status:false});
                    }
                });
            }else{
                resolve({status:false});
            }
        })
    },
    getAlluser:()=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).find().toArray();
            resolve(user);
        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $set: { userStatus: false } })
            .then((response) => {
              resolve(response);
            });
        });
    },
    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $set: { userStatus: true } })
            .then((response) => {
                resolve(response);
            });
        });
    },
    addToCart : (proId,userId,Size)=>{
        let size = Size.size  
        let proObj= {
            item: new objectId(proId),
            quantity:1,
            size:size
        }
        return new Promise (async (resolve,reject) =>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(proId)})
            let userCart =await db.get().collection(collection.CART_COLLECTION).findOne({user: new objectId(userId)})
            if(userCart){
                let cartproduct =userCart.products.find(product=> product.item == proId)
                let stock = product.productQuantity
                if(cartproduct){
                stock = product.productQuantity - cartproduct.quantity
                }else{
                    stock  = product.productQuantity - 0;
                }
                if(stock<=0){
                    resolve({status:false})
                }else{
                    let proExist = userCart.products.findIndex(product=> product.item == proId)
                    if(proExist!= -1){
                        db.get().collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId), 'products.item':new objectId(proId)},
                        {
                            $inc:{'products.$.quantity':1}
                        }).then(()=>{
                            resolve({status:true})
                        })
                    }else{
                        db.get().collection(collection.CART_COLLECTION).updateOne({user: new objectId(userId)},
                        {
                            $push:{products: proObj}
                        }
                        ).then((response)=>{
                            resolve({status:true})
                        })
                    }
                }
            }else{
                let cartObj = {
                    user:new objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve({status:true})
                })
            }
        })
    },
    getCartProducts : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user: new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                        size:'$products.size'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,size:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount:(userId) =>{
        try{
            let count;
            let cart;
            return new Promise(async(resolve,reject)=>{
                cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
                if(cart){
                    count = cart.products.length
                    resolve(count)
                }else{
                    resolve(0);
                }
            })
        }
        catch(err){
            console.log(err)
        }
    },
    getAllUserProducts:(currentPage)=>{
        const page = parseInt(currentPage);
        const limit = 6
        const skip = (page - 1) * limit;
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find()
            .limit(limit)
            .skip(skip)
            .toArray();
            resolve(products);
        })
    },
    getWishlistProducts : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{user: new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                
            ]).toArray()
            resolve(wishItems)
        })
    },
    getWishStatus:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishlist= await db.get().collection(collection.WISHLIST_COLLECTION).aggregate(
            [
                {
                    '$match': {
                        'user': new objectId(userId) 
                    }
                },
                {
                    $project:{
                        products:{$arrayElemAt:['$products',0]}
                    }
                }
            ])
            .toArray();
            try{
                resolve(wishlist[0].products.wishStatus)
            }catch(err){
                resolve(0)
            }
            
        })
    },
    getProductCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let productCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
            resolve(productCount);
        })
    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find()
            .toArray();
            resolve(category);
        })
    },
    changeQuantity:(details)=>{
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        return new Promise(async(resolve,reject)=>{
            if(details.count==-1 && details.quantity ==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id: new objectId(details.cart)},
                {
                    $pull:{products:{item: new objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(details.product)})
                let stock = product.productQuantity - (quantity + count)
                if(stock<0){
                    resolve({status:false})
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({_id: new objectId(details.cart), 'products.item':new objectId(details.product)},
                    {
                        $inc:{'products.$.quantity':count}
                    }).then((response)=>{
                        resolve({status:true})
                    })
                }
            }
        })
    },
    removePro:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id: new objectId(details.cart)},
            {
                $pull:{products:{item: new objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        })
    },
    getUserDetails:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:new objectId(userId)}).then((user)=>{
                resolve(user);
            })
        })
    },
    updateProfile:(userId,userDetails)=>{
        return new Promise(async(resolve,reject)=>{
           db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},
            {$set:{
                name: userDetails.name, 
                email: userDetails.email,
                phone: userDetails.phone
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user: new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}}
                    }
                } 
            ]).toArray()
            try{
                resolve(total[0].total)
            }catch(err){
                resolve(0);
            }
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise(async(resolve,reject)=>{
            order.total = Number(order.total);
            let UserDetails = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{
                        _id: new objectId(order.userId)
                    }
                },{
                    $unwind:{
                        path: "$address"
                    }
                },{
                    $match:{
                        "address._id": new objectId(order.address)
                    }
                }
            ]).toArray()
            let status = order['payment-method'] === 'cod'|| 'wallet' ?'placed':'pending'
            let orderObj ={
                deliveryDetails:{
                    name:UserDetails[0].address.name,
                    phone:UserDetails[0].address.phone,
                    address:UserDetails[0].address.address,
                    pin:UserDetails[0].address.pin,
                    email:UserDetails[0].address.email,
                },
                userId:new objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:order.total,
                status:status,
                date: new Date(),
                isShipped: Boolean(order.isShipped),
                isDelivered : Boolean(order.isDelivered),
                isPlaced: Boolean(order.isPlaced),
                isCancelled: Boolean(order.isCancelled),
                isReturned: Boolean(order.isReturned)
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                try{
                    resolve(response.insertedId)
                }catch(err){
                    resolve(0);
                }
            })
        })
    },
    emptyCart:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .deleteOne({user:new objectId(userId)})
        })
    },
    decrementProQuantity:(proId,quantity)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new objectId(proId)},
            {$inc: {productQuantity:-quantity}}
            ).then(()=>{
                resolve()
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            try{
                resolve(cart.products)
            }catch(err){
                resolve(0)
            }
           
        })
    },
    getUserOrder: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:new objectId(userId)})
            .toArray()
            try{
                resolve(orders)
            }
            catch(err){
                resolve(0)
            }
            
        })
    },
    getOrderProduct: (orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id: new objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                
            ]).toArray()
            resolve(orderItems)
        })
    },
    generateRazorpay:(orderId,total)=>{
       return new Promise((resolve,reject)=>{
            var options = {
                amount: total*100,
                currency: "INR",
                receipt: ""+orderId
            };
            instance.orders.create(options, function(err,order){
                if(err){
                    console.log(err);
                }else{   
                    resolve(order) 
                }
            });
        })
    },
    verifyPayment: (details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'YKkvEfrV9IvQRFhgZJRxpLqi');
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id: new objectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
    },
    addAddress:(address,userId)=>{
        return new Promise(async(resolve,reject)=>{
            address._id = new objectId()
            let userDetails =await db.get().collection(collection.USER_COLLECTION).findOne({_id: new objectId(userId)})
            if(userDetails.address){
                db.get().collection(collection.USER_COLLECTION).updateOne({_id: new objectId(userId)},
                {
                    $push:{address:address}
                }
                ).then((response)=>{
                    resolve(response)
                })
            }else{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},
                {$set:{
                    address:[address]
                }}).then((response)=>{
                    resolve(response);
                })
            }
        })
    },
    getAllAddress:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:new objectId(userId)}).then((address)=>{
                resolve(address.address);
            })
        })
    },
    addProfileImage:(userId,imageUrl)=>{
        return new Promise(async(resolve, reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $set: { profile: imageUrl } }).then((response)=>{
                resolve(response);
            })
        })
    },
    varifyPassword:(password,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id: new objectId(userId)});
            if(user){
                bcrypt.compare(password.password,user.password).then((status)=>{
                    if(status){     
                        response.status=true; 
                        resolve({status:true});
                    }else{
                        resolve({status:false});
                    }
                });
            }else{
                resolve({status:false});
            }
        })
    },
    updatePassword:(userId,password)=>{
        return new Promise(async(resolve,reject)=>{
            password.password = await bcrypt.hash(password.password, 10);
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},
            {$set:{
                password: password.password,     
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
    getAddress:async(userId,addressId,address)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({
                _id:new objectId(userId),
                address:{$elemMatch:{_id:new objectId(addressId)}}
            },
            {
                $set:{
                    'address.$.name' : address.name,
                    'address.$.email' : address.email,
                    'address.$.address' : address.address,
                    'address.$.state' : address.state,
                    'address.$.country' : address.country,
                    'address.$.pin' : address.pin,
                    'address.$.phone' : address.phone
                }
            }).then((response)=>{
                resolve(response);
            })
        })
    },
    deleteAddress:async(userId,addressId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne(
            {
                _id:new objectId(userId)},
            { 
                $pull:{address:{_id:new objectId(addressId)}}
            }
            ).then((response)=>{
                resolve(response);
            })
        })
    },
    checkUser:async(number)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let mobile = number.number
                mobile = mobile.replace("+91","")
                let user =await db.get().collection(collection.USER_COLLECTION).findOne({phone:mobile})
                resolve(user)
            })
        }
        catch(err){
            console.log(err);
        }   
    },
    findUser:(number)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let mobile = number.number
            mobile = mobile.replace("+91","")
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({phone:mobile});
            if(user){
                response.user=user;
                response.userName = user.name;
                response.isBlocked = false;
                resolve(response);
            }
            
        })
    },
    getAllRewards:()=>{
        return new Promise(async(resolve,reject)=>{
            let rewards = await db.get().collection(collections.COUPON_COLLECTION).find().toArray();
            resolve(rewards);
        })
    },
    redeemCoupon:(couponCode,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({code:couponCode.inputValue})
            if(coupon){
                coupon.isValid=true
                let expiry = new Date(coupon.expiry)
                let currentdate = new Date()
                if(currentdate <= expiry){
                    coupon.notExpired =true
                    let coupons = await db.get().collection(collection.USER_COLLECTION).findOne({_id: new objectId(userId),
                        coupons: {
                            $in: [coupon._id]
                        }
                    })
                    if(coupons){
                        resolve({usedCoupon:true,
                        message:"Used Coupon!.."})
                    }else{
                        resolve(coupon);
                    }
                }else{
                    resolve({notExpired:false,
                    message:"Coupon Expired!..."})
                }
            }else{
                resolve({isValid:false,
                message:"Invalid coupon!..."})
            }
        }) 
    },
    addUsedCoupons:(couponId,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: new objectId(userId)},{$push:{coupons:
                new objectId(couponId)
            }
        })
    })
    },
    getWalletAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id: new objectId(userId)})
            resolve(user.wallet)
        })
    },
    updateWallet:(userId,total)=>{
        return new Promise(async(resolve,reject)=>{
            let orderTotal = parseInt(total)
            let user = await db.get().collection(collection.USER_COLLECTION).updateOne({_id: new objectId(userId)},{ $inc: { wallet: -orderTotal } })
            resolve(user.wallet)
        })
    },
    getAllBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find()
            .toArray();
            resolve(banner);
        })
      },
    
}