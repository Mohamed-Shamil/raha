const collection = require('../config/collection');
var db = require('../config/connection')
const { ObjectID } = require('bson');
const { response } = require('../app');
var db = require('../config/connection')
var objectId = require('mongodb').ObjectId

module.exports = {

    addToWishlist: async (proId, userId) => {
        
        let proObj = {
            item: objectId(proId),
            quantity: 1,
        }
 
        // let userWishlist = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
       

        return new Promise(async (resolve, reject) => {

            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userWishlist) {

                let proExist = userWishlist.products.findIndex(product => product.item == proId)

                if (proExist != -1) {

                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $pull: { products:proObj}
                        }).then(() => {
                            resolve()

                        })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectId(userId) }, {


                            $push: { products: proObj }


                        }
                        ).then((response) => {
                            resolve()
                        })
                }


            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartObj).then(() => {
                    console.log(cartObj);
                    resolve()
                })
            }
        })
    },
    
    viewWishlist : (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }
                }

            ]).toArray()
            resolve(wishlistItems)


        })
    },
    deletewishListProduct: (details) => {
            console.log(details);
        return new Promise((resolve, reject) => {

            db.get().collection(collection.WISHLIST_COLLECTION)
                .updateOne({ _id: objectId(details.wishlist) }, 
                
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },
}