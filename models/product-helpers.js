const db = require('../config/connection');
const collection = require('../config/collections');
const { ObjectId } = require('mongodb-legacy');
const objectId = require('mongodb-legacy').ObjectId;

module.exports={
    addProduct:(product,callback)=>{
        console.log(product);
        product.productStatus = Boolean(product.productStatus)
        product.price = parseInt(product.price)
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
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
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
    getProductDetails:(proId)=>{
        console.log("jhuegfuyey");
        console.log(proId);
        return new Promise(async(resolve,reject)=>{
            
             console.log(proId);
           let product= await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
            [
                {
                  '$match': {
                    '_id': new ObjectId(proId)
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
            console.log(product[0].category_details[0]);
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
      let fprice = parseInt(price.fprice)
      console.log(fprice);
      return new Promise(async(resolve,reject)=>{
        let product= await db.get().collection(collection.PRODUCT_COLLECTION).find( { price: { $lte: fprice } } )
        .toArray();
          try{
            console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmm");
            console.log(product);
            resolve(product)
           }catch(err){
            resolve(0)
           }
     })
    },
    updateProduct:(proDetails,proId)=>{
        return new Promise((resolve,reject)=>{
            proDetails.price=parseInt(proDetails.price)
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proId)},
            {$set:{
                name: proDetails.name,
                category: proDetails.category, 
                description:proDetails.description,
                price: proDetails.price
            }}).then((response)=>{
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
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((response)=>{
                resolve(response);
            })
        })
        
    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find()
            .toArray();
            resolve(category);
        })
    },
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
        item: new objectId(proId),
        wishStatus: Boolean(true)
       }
      return new Promise (async (resolve,reject) =>{
        let wishlist =await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user: new objectId(userId)})
        console.log(wishlist);
        if(wishlist){
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user: new objectId(userId)},
            {
                $push:{products: productObj}
            }
            ).then((response)=>{
              try{
                resolve(response)
              }catch(err){
                resolve(0)
              }
                
            })
        }
        else{
          let wishObj = {
            user:new objectId(userId),
            products:[productObj]
         }
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response)=>{
              try{
                resolve(response)
                console.log(response);
              }catch(err){
                resolve(0)
              }
            }) 
        }
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
        //console.log(cartItems[0].products)
        resolve(wishItems)
    })
    },
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
    getWishStatus:(userId)=>{
      return new Promise(async(resolve,reject)=>{
          // console.log(proId);
            console.log(userId);
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
             ]
           )
           .toArray();
           try{
            console.log(wishlist);
            resolve(wishlist[0].products.wishStatus)
           }catch(err){
            resolve(0)
           }
           
       })
  },
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
    }
}