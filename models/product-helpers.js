const db = require('../config/connection');
const collection = require('../config/collections');
const { ObjectId } = require('mongodb-legacy');
const { default: slugify } = require('slugify');
// const { log } = require('handlebars');
// const { productDetails } = require('../controllers/user-controller');

const objectId = require('mongodb-legacy').ObjectId;


module.exports={
    addProduct:(product,callback)=>{
        console.log(product);
        product.productStatus = Boolean(product.productStatus)
        product.subPrice = parseInt(product.subPrice)
        product.productOffer = parseInt(product.productOffer)
        product.productDiscount = parseInt(product.productDiscount)
        let offer = (product.subPrice*product.productOffer)/100;
        product.price=parseInt(product.subPrice-offer)
        product.category= new objectId(product.category)
        return new Promise(async(resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                callback(data.insertedId);
                resolve(data);
            })
        })
        
    },
    addProductImage: (proId,imgUrl)=>{
        return new Promise(async(resolve, reject)=>{
            console.log(imgUrl)
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proId)},{ $set: { image: imgUrl } }).then((response)=>{
                resolve(response);
            })
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION)
            .aggregate([
                {
                    $lookup:{
                        from:collection.CATEGORY_COLLECTION,
                        localField:'category',
                        foreignField:'_id',
                        as:'categoryDetails'
                    }
                }
            ])
            .toArray();
            resolve(products);
        })
    },
    // getAllUserProducts:(currentPage)=>{
    //   const page = parseInt(currentPage);
    //   const limit = 6
    //   const skip = (page - 1) * limit;
    //     return new Promise(async(resolve,reject)=>{
    //         let products = await db.get().collection(collection.PRODUCT_COLLECTION).find()
    //         .limit(limit)
    //         .skip(skip)
    //         .toArray();
    //         resolve(products);
    //     })
    // },
    // getProductCount:()=>{
    //   return new Promise(async(resolve,reject)=>{
    //     let productCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
    //     console.log(productCount);
    //     resolve(productCount);
    // })
    // },
    getProductDetails:(proId)=>{
        console.log("jhuegfuyey");
        console.log(proId);
        return new Promise(async(resolve,reject)=>{
            
             console.log(proId);
           let product= await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
            [
                {
                  '$match': {
                    'slug': proId
                  }
                }, {
                  '$lookup': {
                    'from': 'category', 
                    'localField': 'category', 
                    'foreignField': '_id', 
                    'as': 'category_details'
                  }
                }
              ]
            )
            .toArray();
            console.log(product[0]);
            //console.log(product[0].category_details[0]);
            resolve(product[0])
        })
    },
    getFilterCategory:(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            // console.log(proId);
              console.log(categoryId);
            let product= await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
             [
                 {
                   '$match': {
                     'category': new objectId(categoryId)
                   }
                 }
               ]
             )
             .toArray();
             try{
              console.log(product);
              resolve(product)
             }catch(err){
              resolve(0)
             }
             
         })
    },
    getFilterPrice:(price)=>{
      console.log("heloooooooooooooooooooo",price);
      let lprice = parseInt(price.lowerprice)
      let uprice = parseInt(price.upperprice)
      console.log( price.lowerprice);
      return new Promise(async(resolve,reject)=>{
        let product= await db.get().collection(collection.PRODUCT_COLLECTION).find( { price: { $gte: lprice, $lte: uprice } } )
        .toArray();
          try{
            resolve(product)
           }catch(err){
            resolve(0)
           }
     })

    },
    categoryGetFilterPrice:(price,categoryId)=>{
      console.log("heloooooooooooooooooooo",price);
      let lprice = parseInt(price.lowerprice)
      let uprice = parseInt(price.upperprice)
      console.log( price.lowerprice);
      return new Promise(async(resolve,reject)=>{
        let product= await db.get().collection(collection.PRODUCT_COLLECTION).find({
          $and: [
            { category: new objectId(categoryId) },
            {price: { $gte: lprice, $lte: uprice } }
          ]
        })
        .toArray();
          try{
            resolve(product)
           }catch(err){
            resolve(0)
           }
     })

    },
    updateProduct:(proDetails,proId)=>{
      console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
      console.log(proDetails.category);
      console.log(proId);
        return new Promise((resolve,reject)=>{
            proDetails.price=parseInt(proDetails.price)
            proDetails.productQuantity=parseInt(proDetails.productQuantity)
            proDetails.productOffer=parseInt(proDetails.productOffer)
            proDetails.category=new objectId(proDetails.category)
            console.log(proDetails.category);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({slug:proId},
            {$set:{
                name: proDetails.name,
                category: proDetails.category, 
                description:proDetails.description,
                price: proDetails.price,
                metal:proDetails.metal,
                productQuantity:proDetails.productQuantity,
                productOffer:proDetails.productOffer,
                slug: slugify(proDetails.name)
            }}).then((response)=>{
                console.log(response);
                resolve(response);
            })
        })
    },
    unlistProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            console.log(proId);
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proId)},{ $set: { productStatus: false } })
            .then((response) => {
              resolve(response);
              console.log(response);
            });
        });
      },
      listProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            console.log(proId);
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proId)},{ $set: { productStatus: true } })
            .then((response) => {
              resolve(response);
              console.log(response);
            });
        });
      },
      addCategory:(category)=>{
        console.log(category);
        category.categoryStatus = Boolean(category.categoryStatus)
        return new Promise(async(resolve, reject)=>{
            let categoryexist = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:category.category})
            if(categoryexist){
                resolve({categoryExist:true,
                message:"Category already exists!"})
                console.log("category exist");
            }else{
              db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((response)=>{
                resolve({categoryExist:false});
            })
          }  
        })
        
    },
    getCategory:(categoryId)=>{
      return new Promise(async(resolve, reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).findOne({slugCategory:categoryId}).then((response)=>{
            resolve(response);
        })
      })
    },
    updateCategory:(categoryId,categoryName)=>{
      return new Promise(async(resolve, reject)=>{
        let categoryexist = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:categoryName.category})
            if(categoryexist){
                resolve({categoryExist:true,
                message:"Category already exists!"})
                console.log("category exist");
            }else{
              console.log("hereeeeeeeeeeeeeeeeeeeeeeeee");
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({slugCategory:categoryId},
                  {$set:{ category:categoryName.category,slugCategory:slugify(categoryName.category)}}).then((response)=>{
                  console.log("nppppppppppppppppppppppp");
                  console.log(response);
                    resolve(response);
                  })
        }
      })
    },
    // getAllCategory:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let category = await db.get().collection(collection.CATEGORY_COLLECTION).find()
    //         .toArray();
    //         resolve(category);
    //     })
    // },
    unlistCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            console.log(categoryId);
          db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:new objectId(categoryId)},{ $set: { categoryStatus: false } })
            .then((response) => {
              resolve(response);
              console.log(response);
            });
        });
      },
    listCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
        console.log(categoryId);
        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:new objectId(categoryId)},{ $set: { categoryStatus: true } })
        .then((response) => {
            resolve(response);
            console.log(response);
        });
      });
    },
    addToWishlist: (proId,userId)=>{

      let productObj={
        item: new objectId(proId.wishlist) 
       }
      return new Promise (async (resolve,reject) =>{
        let wishlist =await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user: new objectId(userId)})
        console.log(wishlist);
        if(wishlist){

            let proExist = wishlist.products.findIndex(product=> product.item == proId.wishlist)
                console.log(proExist)
                if(proExist!= -1){
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:new objectId(userId), 'products.item':new objectId(proId.wishlist)},
                    {
                      $pull:{products:{item: new objectId(proId.wishlist)}}
                    }).then(()=>{
                        console.log("removwed from wishlist");
                        resolve({addProduct:false})
                    })
                }else{
                db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user: new objectId(userId)},
                {
                  $push:{products: productObj}
              }
              ).then(()=>{
                  resolve({addProduct:true})    
              })
            }
        }
        else{
          let wishObj = {
            user:new objectId(userId),
            products:[productObj]
         }
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response)=>{
              try{
                resolve({addProduct:true})
                console.log(response);
              }catch(err){
                resolve(0)
              }
            }) 
        }
    })
    },
    // getWishlistProducts : (userId)=>{
    //   return new Promise(async(resolve,reject)=>{
    //     let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
    //         {
    //             $match:{user: new objectId(userId)}
    //         },
    //         {
    //             $unwind:'$products'
    //         },
    //         {
    //             $project:{
    //                 item:'$products.item'
    //             }
    //         },
    //         {
    //             $lookup:{
    //                 from:collection.PRODUCT_COLLECTION,
    //                 localField:'item',
    //                 foreignField:'_id',
    //                 as:'product'
    //             }
    //         },
    //         {
    //             $project:{
    //                 item:1,product:{$arrayElemAt:['$product',0]}
    //             }
    //         }
            
    //     ]).toArray()
    //     //console.log(cartItems[0].products)
    //     resolve(wishItems)
    // })
    // },
    removeWish:(details)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({_id: new objectId(details.wishlist)},
            {
                $pull:{products:{item: new objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
    })
    },
  //   getWishStatus:(userId)=>{
  //     return new Promise(async(resolve,reject)=>{
  //         // console.log(proId);
  //           console.log(userId);
  //         let wishlist= await db.get().collection(collection.WISHLIST_COLLECTION).aggregate(
  //          [
  //              {
  //                '$match': {
  //                  'user': new objectId(userId) 
  //                }
  //              },
  //              {
  //               $project:{
  //                   products:{$arrayElemAt:['$products',0]}
  //               }
  //            }
  //            ]
  //          )
  //          .toArray();
  //          try{
  //           console.log(wishlist);
  //           resolve(wishlist[0].products.wishStatus)
  //          }catch(err){
  //           resolve(0)
  //          }
           
  //      })
  // },
  getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $lookup:{
                from:collection.USER_COLLECTION,
                localField:'userId',
                foreignField:'_id',
                as:'userDetails'
            }
        }
      ])
      .toArray();
      resolve(orders);
      })
    },
  getOrderDetails:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
      let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id: new objectId(orderId)})
      console.log('MEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
      try{
        console.log(orderDetails);
        resolve(orderDetails)
      }catch(err){
        resolve(0)
      }
      
    })
  },
  cancelOrder:(orderId,userId)=>{
    return new Promise(async (resolve, reject) => {
      console.log(orderId);
      let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:new objectId(orderId)})
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},{ $set: { status: 'Cancelled', isCancelled: true } })
      .then((response) => {
        if(order.paymentMethod === "wallet" || order.paymentMethod === "ONLINE"){
          let user = db.get().collection(collection.USER_COLLECTION).findOne({_id:new objectId(userId)})
          if(user.wallet){
          db.get().collection(collection.USER_COLLECTION).updateOne({_id: new objectId(userId)},{$inc:{wallet:order.totalAmount}})
          }else{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: new objectId(userId)},{$set:{wallet:order.totalAmount}})
          }
        }
          resolve(response);
          console.log(response);
      });
    });
  },
  returnOrder:(orderId,userId)=>{
    return new Promise(async (resolve, reject) => {
      console.log(orderId);
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},{ $set: { status: 'Returned', isRequested:false, isReturned:true } })
      .then((response) => {
          resolve(response);
          console.log(response);
      });
      let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:new objectId(orderId)})
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:new objectId(userId)})
      if(user.wallet){
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $inc: { wallet: order.totalAmount } })
      }else{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},{$set:{wallet:order.totalAmount}})
      }
    });
  },
  requestReturn:(orderId)=>{
    return new Promise(async (resolve, reject) => {
      console.log(orderId);
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},{ $set: { status: 'Requested', isDelivered:false, isRequested:true } })
      .then((response) => {
          resolve(response);
          console.log(response);
      });
    });
  },
  orderShipped:(orderId)=>{
    return new Promise(async (resolve, reject) => {
      console.log(orderId);
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},{ $set: { status: 'Shipped',isPlaced: false, isShipped: true } })
      .then((response) => {
          resolve(response);
          console.log(response);
      });
    });
  },
  orderDelivered:(orderId,today)=>{
    return new Promise(async (resolve, reject) => {
      console.log(orderId);
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},
      { $set: {
         status: 'Delivered', 
         isShipped: false, 
         isDelivered: true,
         delivery:today } 
        })
      .then((response) => {
          resolve(response);
          console.log(response);
      });
    });
  },
  addCoupon:(coupon)=>{
    console.log(coupon);
    coupon.discount = parseInt(coupon.discount)
    coupon.minAmount = parseInt(coupon.minAmount)
    let couponCode = coupon.code;
    let couponName = coupon.name;
    return new Promise(async(resolve, reject)=>{
        let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({$or: [
          { name: couponName },
          { code: couponCode }
        ]})
        if(couponExist){
          resolve({status:false})
        }else{
        db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response)=>{
            response.status = true;
            resolve(response);
        })
      }
    })  
  },
  getCoupon:(couponId)=>{
    return new Promise(async(resolve, reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).findOne({_id:new objectId(couponId)}).then((response)=>{
          resolve(response);
      })
    })
  },
  updateCoupon:(couponId,Details)=>{
    return new Promise(async(resolve, reject)=>{
      // let couponexist = await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:new objectId(couponId)})
      //     if(couponexist.name == Details.name){
      //         resolve({couponExist:true,
      //         message:"Coupon name already exists!"})
      //         console.log("coupon exist");
      //     }else{
            Details.discount = parseInt(Details.discount)
            Details.minAmount = parseInt(Details.minAmount)
            console.log("hereeeeeeeeeeeeeeeeeeeeeeeee");
              db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:new objectId(couponId)},

                {$set:{
                        discount:Details.discount,
                        expiry:Details.expiry,
                        minAmount:Details.minAmount
                      }
              }).then((response)=>{
                console.log("nppppppppppppppppppppppp");
                console.log(response);
                  resolve(response);
                })
      
    })
  },
  deleteCoupon:(couponId)=>{
    return new Promise(async(resolve,reject)=>{
       db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id: new objectId(couponId)}).then((response)=>{
        resolve(response);
       })
      
  })
  },
  getAllCoupons:()=>{
    return new Promise(async(resolve,reject)=>{
      let coupons = await db.get().collection(collection.COUPON_COLLECTION).find()
      .toArray();
      resolve(coupons);
  })
  },
  addBanner:(banner,callback)=>{
    return new Promise(async(resolve, reject)=>{
      banner.bannerStatus = Boolean(banner.bannerStatus)
      db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data)=>{
          callback(data.insertedId);
          resolve(data);
      })
  })
  },
  addBannerImage: (bannerId,imgUrl)=>{
    return new Promise(async(resolve, reject)=>{
        console.log(imgUrl)
        db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:new objectId(bannerId)},{ $set: { image: imgUrl } }).then((response)=>{
            resolve(response);
        })
    })
  },
  activateBanner:(bannerId)=>{
    return new Promise(async(resolve, reject)=>{
      console.log(bannerId)
      db.get().collection(collection.BANNER_COLLECTION).updateMany({},{ $set: { bannerStatus : false } }).then((response)=>{
      //     resolve(response);
      // })
          db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:new objectId(bannerId)},{ $set: { bannerStatus : true } }).then((response)=>{
            resolve(response)
          })
      })
    })
  },
  getAllBanner:()=>{
    return new Promise(async(resolve,reject)=>{
        let banner = await db.get().collection(collection.BANNER_COLLECTION).find()
        .toArray();
        resolve(banner);
    })
  },
  getFilterSales:(fromDate,toDate)=>{
    return new Promise(async(resolve,reject)=>{
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          // '$match': {
          //   'date': {
          //      $gte: fromDate, 
          //      $lte: toDate 
          //     } 
          // }
           $match: { $and: [ { 'date':{$gte: fromDate, $lte: toDate} }, { 'isDelivered': true } ] } 
        },
        {
            $lookup:{
                from:collection.USER_COLLECTION,
                localField:'userId',
                foreignField:'_id',
                as:'userDetails'
            }
        }
      ])
      // let orders= await db.get().collection(collection.ORDER_COLLECTION).find( { date: { $gte: fromDate, $lte: toDate } } )
       .toArray();
        try{
          console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmm");
          console.log(orders);
          resolve(orders)
         }catch(err){
          resolve(0)
         }
   })
  },
  getAllSales:()=>{
    return new Promise(async(resolve,reject)=>{
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          '$match': {
            'isDelivered': true 
          }
        },
        {
            $lookup:{
                from:collection.USER_COLLECTION,
                localField:'userId',
                foreignField:'_id',
                as:'userDetails'
            }
        }
      ])
      .toArray();
      resolve(orders);
      })
    },
    getLowToHigh:()=>{
      return new Promise(async(resolve,reject)=>{
        var sort = { price: 1 };
        let product= await db.get().collection(collection.PRODUCT_COLLECTION).find().sort(sort)
        .toArray();
          try{
            resolve(product)
            console.log("noooooooooooooooooooooooo");
            console.log(product);
           }catch(err){
            resolve(0)
           }
     })
    },
    getLowToHighCategory:(categoryId)=>{
      return new Promise(async(resolve,reject)=>{
        var sort = { price: 1 };
        let product= await db.get().collection(collection.PRODUCT_COLLECTION).find({category: new objectId(categoryId)}).sort(sort)
        .toArray();
          try{
            resolve(product)
            console.log("noooooooooooooooooooooooo");
            console.log(product);
           }catch(err){
            resolve(0)
           }
     })
    },
    getHighToLowCategory:(categoryId)=>{
      return new Promise(async(resolve,reject)=>{
        var sort = { price: -1 };
        let product= await db.get().collection(collection.PRODUCT_COLLECTION).find({category: new objectId(categoryId)}).sort(sort)
        .toArray();
          try{
            resolve(product)
            console.log("noooooooooooooooooooooooo");
            console.log(product);
           }catch(err){
            resolve(0)
           }
     })
    },
    getHighLow:()=>{
      return new Promise(async(resolve,reject)=>{
        var sort = { price: -1 };
        let product= await db.get().collection(collection.PRODUCT_COLLECTION).find().sort(sort)
        .toArray();
          try{
            resolve(product)
            console.log("noooooooooooooooooooooooo");
            console.log(product);
           }catch(err){
            resolve(0)
           }
     })
    },
    dailysales:(today)=>{
      //console.log(today);
      return new Promise(async(resolve,reject)=>{
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        let orders = await db.get().collection(collection.ORDER_COLLECTION).find({delivery:{ $gte: startOfDay, $lt: endOfDay },isDelivered: true}).toArray()
          //console.log(orders)
          resolve(orders)
        // let orders= await db.get().collection(collection.ORDER_COLLECTION).find( { date: { $gte: fromDate, $lte: toDate } } )
        
          
     })
    },
    weeklysales:(today)=>{
      //console.log(today);
      return new Promise(async(resolve,reject)=>{
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()-7);
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        let orders = await db.get().collection(collection.ORDER_COLLECTION).find({date:{ $gte: startOfWeek, $lt: endOfWeek },isDelivered: true}).toArray()
          //console.log(orders)
          resolve(orders)
        // let orders= await db.get().collection(collection.ORDER_COLLECTION).find( { date: { $gte: fromDate, $lte: toDate } } )
        
          
     })
    },
    monthlysales:(startOfMonth)=>{
      console.log(startOfMonth);
      return new Promise(async(resolve,reject)=>{
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        let endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        let orders = await db.get().collection(collection.ORDER_COLLECTION).find({date:{ $gte: startOfMonth, $lt: endOfMonth },isDelivered: true}).toArray()
          console.log(orders)
          resolve(orders)
        
          
     })
    },
    searchProducts:(search)=>{
      return new Promise(async(resolve,reject)=>{
        // let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({name:{$regex: new RegExp(search.searchKey,'i')}}).toArray()
        // console.log("heeeeeeeeeeeeeeeeeee");
        // console.log(products);
        // resolve(products)
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
          {
            $lookup:{
                from:collection.CATEGORY_COLLECTION,
                localField:'category',
                foreignField:'_id',
                as:'categoryDetails'
            }
        },
        {
                $unwind:'$categoryDetails'
        },
        {
          '$match': {
            $or: [
              { name: {$regex: new RegExp(search.searchKey,'i')} },
              { 'categoryDetails.category': {$regex: new RegExp(search.searchKey,'i')} }
            ]
          }
        }
        ]).toArray()
        console.log("heeeeeeeeeeeeeeeeeee");
        console.log(products);
        resolve(products)
      })
    },
    getPopularproducts:()=>{
      return new Promise(async(resolve,reject)=>{
        let popular = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(6).sort({_id:-1}).toArray()
        resolve(popular)
      })
    },
    deliverGraph : () =>{
      return new Promise(async(resolve, reject) =>{
        let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              isDelivered: true
            }
          },{
            $group: {
              _id: { $month: "$date" },
              count: { $sum: 1 }
            }
          }
        ]).toArray();
        resolve(result);
      })
    },

    ordersGraph : () =>{
      return new Promise(async(resolve, reject) =>{
        let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } } 
        ]).toArray();
        resolve(result);
      })

    }
}