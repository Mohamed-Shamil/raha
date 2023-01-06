const collection = require('../config/collection');
var db = require('../config/connection')
const bcrypt = require('bcrypt');
const { ObjectID } = require('bson');
const { response } = require('../app');
const { WALLET_COLLECTION } = require('../config/collection');
const { order } = require('paypal-rest-sdk');
const { reject } = require('bcrypt/promises');
var objectId = require('mongodb').ObjectId

module.exports = {
    getOrderDetails: (userId) => {

        return new Promise(async (resolve, reject) => {

       

            let pipeline = [{
                $match: {
                    userId: objectId(userId),
                    "products.trackOrder": { $ne: "pending" }
                }
            },
            { $sort: { time: -1 } }];

            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate(pipeline).toArray();
            resolve(order)
        })

    },

    viewOrderdProducts: (orderId) => {

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: 1,
                        paymentMethod: 1,
                        deliveryDetails: 1,
                        totalPrice: 1,
                        status: 1,
                        orderStatus: 1,
                        date: 1,


                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$products.trackOrder',
                        offerPrice: '$products.offerPrice'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        status: 1,
                        offerPrice: 1,
                        paymentMethod: 1,
                        deliveryDetails: 1,
                        totalPrice: 1,
                        date: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(orderItems)

        })
    },
    updatedStatus: (details) => {
        return new Promise((resolve, reject) => {
            let status = details.status
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(details.orderId), 'products.item': objectId(details.proId) }, {
                $set: {
                    'products.$.trackOrder': status
                }
            }).then(async (response) => {
                if (details.quantity) {
                    let stock = parseInt(details.quantity);
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(details.proId) }, {
                        $inc: { stock: stock }
                    })
                }
               
                orderData = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(details.orderId), 'products.item': objectId(details.proId) })
                
                let pay = orderData.paymentMethod
               
                
                if (pay != 'COD') {
                    let orderitems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: { _id: objectId(details.orderId) }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                item: '$products.item',
                                price: '$products.price',
                                offerPrice: '$products.offerPrice',
                                coupon: '$products.coupon',
                                couponPercentage: '$products.couponPercentage'
                            }
                        },
                        {
                            $match: { item: objectId(details.proId) }
                        },
                        {
                            $project: {
                                item: 1,
                                price: 1,
                                offerPrice: 1,
                                coupon: 1,
                                couponPercentage: 1

                            }
                        }
                    ]).toArray()

                    couponPercentage = orderitems[0].couponPercentage
                    if (couponPercentage > 1) {

                        let userwallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(details.userId) })
                        let price = orderitems[0].offerPrice
                        let balance = userwallet.balance + price
                        let transactions = {
                            credit: orderitems[0].offerPrice,
                            debit: 0,
                            date: new Date(),
                            message: " Canceled Order Amount"
                        }
                        let updateWallet = await db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: objectId(details.userId) }, {
                            $set: {
                                balance: balance
                            },

                            $push: {
                                transactions: transactions
                            }

                        }
                        )
                    } else {

                        let userwallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(details.userId) })
                        let price = orderitems[0].price
                        let balance = userwallet.balance + price
                        let transactions = {
                            credit: orderitems[0].price,
                            debit: 0,
                            date: new Date(),
                            message: "Canceled Order Amount"
                        }
                        let updateWallet = await db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: objectId(details.userId) }, {
                            $set: {
                                balance: balance
                            },

                            $push: {
                                transactions: transactions
                            }

                        }
                        )
                    }

                }
                resolve(response)
            })
        })
    },
    changeStatus: (details, userId) => {

        return new Promise((resolve, reject) => {
            let status = 'canceled'

            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(details.orderId), 'products.item': objectId(details.proId) }, {
                $set: {
                    'products.$.trackOrder': status
                }

            }).then(async (response) => {

                // let stock = parseInt(details.quantity) ;
                // db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(details.proId)},{
                //    $inc:{stock:stock}
                // }).then((response)=>{
                //     resolve()
                // })
                orderData = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(details.orderId), 'products.item': objectId(details.proId) })
                let pay = orderData.paymentMethod

                if (pay != 'COD') {

                    let orderitems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: { _id: objectId(details.orderId) }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                item: '$products.item',
                                price: '$products.price',
                                offerPrice: '$products.offerPrice',
                                coupon: '$products.coupon',
                                couponPercentage: '$products.couponPercentage'
                            }
                        },
                        {
                            $match: { item: objectId(details.proId) }
                        },
                        {
                            $project: {
                                item: 1,
                                price: 1,
                                offerPrice: 1,
                                coupon: 1,
                                couponPercentage: 1

                            }
                        }
                    ]).toArray()

                    console.log(orderitems);
                    couponPercentage = orderitems[0].couponPercentage
                    if (couponPercentage > 1) {

                        let userwallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(userId) })
                        let price = orderitems[0].offerPrice
                        let balance = userwallet.balance + price
                        let transactions = {
                            credit: orderitems[0].offerPrice,
                            date: new Date(),
                            message: "Order Canceled Refund"
                        }
                        let updateWallet = await db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: objectId(userId) }, {
                            $set: {
                                balance: balance
                            },

                            $push: {
                                transactions: transactions
                            }

                        }
                        )
                    } else {

                        let userwallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(userId) })
                        let price = orderitems[0].price
                        let balance = userwallet.balance + price
                        let transactions = {
                            credit: orderitems[0].price,
                            date: new Date(),
                            message: "Order Canceled Refund"
                        }
                        let updateWallet = await db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: objectId(userId) }, {
                            $set: {
                                balance: balance
                            },

                            $push: {
                                transactions: transactions
                            }

                        }
                        )
                    }

                }




                resolve(response)
            })
        })
    }, updateRequest: (details) => {
        return new Promise((resolve, reject) => {

            let status = 'return requested'
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(details.orderId), 'products.item': objectId(details.proId) }, {
                $set: {
                    'products.$.trackOrder': status
                }

            }).then(() => {
                resolve(response)
            })

        })
    },
    returnProducts: (orderId, proId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $match: { 'products.item': objectId(proId) }
                }, {
                    $project: {
                        item: '$products.item',
                        price: '$products.price',
                        offerPrice: '$products.offerPrice',
                        coupon: '$products.coupon',
                        couponPercentage: '$products.couponPercentage',
                        quantity: '$products.quantity'
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
                    $unwind: '$product'
                }
            ]).toArray()
            resolve(product)
        })
    },
    returnOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            resolve(order)
        })
    },
    showReturnedProducts: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {
                    $match: { 'products.trackOrder': "return requested" }
                },
                {
                    $project: {
                        item: '$products.item',
                        price: '$products.price',
                        offerPrice: '$products.offerPrice',
                        coupon: '$products.coupon',
                        couponPercentage: '$products.couponPercentage',
                        quantity: '$products.quantity',
                        deliveryDetails: 1,
                        paymentMethod: 1,
                        date: 1


                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        status: 1,
                        offerPrice: 1,
                        paymentMethod: 1,
                        deliveryDetails: 1,
                        totalPrice: 1,
                        date: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()

            resolve(order)

        })
    },

    walletMoney: (totalAmount, user) => {
        let DateAndTime = new Date()
        return new Promise(async (resolve, reject) => {

            let money = await db.get().collection(collection.WALLET_COLLECTION).findOne({ _id: ObjectID(user) })
            let walletBalance = money.balance
            refferalData = {
                amount: totalAmount,
                date: DateAndTime.getDate() + '/' + (DateAndTime.getMonth() + 1) + '/' + DateAndTime.getFullYear(),
                time: DateAndTime.getHours() + ':' + (DateAndTime.getMinutes() + 1) + ':' + DateAndTime.getSeconds(),
                status: "Debited",
                message: "Purchase Amount",
            };
            let checkUpdate = await db.get().collection(collection.WALLET_COLLECTION).updateOne({ _id: ObjectID(user) }, {
                $inc: {
                    balance: -totalAmount
                },
                $push: {
                    Transactions: refferalData,
                }
            })
            resolve(checkUpdate)
        })
    },


}