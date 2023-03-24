const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const collections = require('../config/collections');
const objectId = require('mongodb-legacy').ObjectId;
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_w5LFXl4hy4CQt2',
    key_secret: 'YKkvEfrV9IvQRFhgZJRxpLqi',
  });

module.exports={
    doSignUp:(userData)=>{
        console.log(userData);
        return new Promise(async(resolve,reject)=>{
            userData.userStatus = Boolean(userData.userStatus)
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async(data)=>{
                // resolve(data);
                dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId});
                resolve(dataDoc);
            })
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
                        console.log(user.userStatus);
                        if(user.userStatus){
                            response.user=user;
                            response.userName = user.name;
                            response.isBlocked = false;
                            resolve(response);
                        }
                        else{
                            console.log("Blocked");
                            response.isBlocked = true;
                            resolve(response);
                            // resolve({status:false});
                        }                                                                                                                                                     
                        // console.log("login successfull");
                    }else{
                        // console.log("login failed !!!");
                        resolve({status:false});
                    }
                });
            }else{
                console.log("user not found !!");
                resolve({status:false});
            }
        })
    },
    getAlluser:()=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).find().toArray();
            console.log(user);
            resolve(user);
        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
          db.get().collection(collections.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $set: { userStatus: false } })
            .then((response) => {
              resolve(response);
              console.log(response);
            });
        });
      },
      unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
          db.get().collection(collections.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $set: { userStatus: true } })
            .then((response) => {
              resolve(response);
              console.log(response);
            });
        });
      },
      addToCart : (proId,userId)=>{  
        let proObj={
            item: new objectId(proId),
            quantity:1
        }
        return new Promise (async (resolve,reject) =>{
            let userCart =await db.get().collection(collection.CART_COLLECTION).findOne({user: new objectId(userId)})
            if(userCart){
                let proExist = userCart.products.findIndex(product=> product.item == proId)
                console.log(proExist)
                if(proExist!= -1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId), 'products.item':new objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user: new objectId(userId)},
                {
                    $push:{products: proObj}
                }
                ).then((response)=>{
                    resolve()
                })
            }
            }else{
                let cartObj = {
                    user:new objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
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
            //console.log(cartItems[0].products)
            resolve(cartItems)
        })
    

      },
      getCartCount:(userId) =>{
        try{
            let count;
            let cart;
            return new Promise(async(resolve,reject)=>{
                cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
                    console.log("qhyugqutfwtyftvdgyrdr6")
                    console.log(cart)
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
      changeQuantity:(details)=>{
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
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
            db.get().collection(collection.CART_COLLECTION).updateOne({_id: new objectId(details.cart), 'products.item':new objectId(details.product)},
                    {
                        $inc:{'products.$.quantity':count}
                    }).then((response)=>{
                        resolve({status:true})
                    })
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
            // console.log(proId);
            db.get().collection(collection.USER_COLLECTION).findOne({_id:new objectId(userId)}).then((user)=>{
                resolve(user);
            })
        })
    },
    updateProfile:(userId,userDetails)=>{
        console.log(userDetails);
        console.log(userId)
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
            // console.log(total)
            try{
                console.log(total[0].total);
                resolve(total[0].total)
            }catch(err){
                console.log(err);
                resolve(0);
            }
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total)
            let status = order['payment-method'] === 'cod'?'placed':'pending'
            const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            let current_datetime = new Date()
            let formatted_date = current_datetime.getDate() + "-" + months[current_datetime.getMonth()] + "-" + current_datetime.getFullYear()
            console.log(formatted_date)
            let orderObj ={
                deliveryDetails:{
                    name:order.name,
                    phone:order.phone,
                    address:order.address,
                    pin:order.pin,
                    email:order.email,
                },
                userId:new objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:formatted_date
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION)
                .deleteOne({user:new objectId(order.userId)})
                //.then((response.ops[0]._id))
                    try{
                        resolve(response.insertedId)
                    }catch(err){
                        console.log(err);
                        resolve(0);
                    }
                //});
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            resolve(cart.products)
        })
    },
    getUserOrder: (userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:new objectId(userId)})
            .toArray()
            try{
                console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyy")
                resolve(orders)
                console.log(orders);
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
            console.log('MEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
            console.log(orderItems);
            resolve(orderItems)
        })
    },
    generateRazorpay:(orderId,total)=>{
       return new Promise((resolve,reject)=>{
            instance.orders.create({
            amount: total,
            currency: "INR",
            receipt: ""+orderId
        },
            // notes: {
            //     key1: "value3",
            //     key2: "value2"
            // }
            function(err,order){
                console.log("new order: ",order);
                resolve(order)
            }
            )
       })
    }
    
}