const collection = require('../config/collection');
var db = require('../config/connection')
const bcrypt = require('bcrypt');
const { ObjectID } = require('bson');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { resolve } = require('path');
const { log } = require('console');
const referral = require('referral-codes')
const dotenv = require('dotenv').config();
var instance = new Razorpay({
    key_id: process.env.razorPayKeyId,
    key_secret: process.env.razorPaySecretKey,
});

const paypal = require('paypal-rest-sdk');
const { helpers } = require('handlebars');
const adminHelpers = require('./admin-helpers');
const { WALLET_COLLECTION } = require('../config/collection');
paypal.configure({
    mode: 'sandbox', //sandbox or live
    client_id: process.env.payPalClientId,
    client_secret: process.env.payPalClientSecret
});

module.exports = {

    dosignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData)
            let response = {}
            console.log(userData);
            userCount = await db.get().collection(collection.USER_COLLECTION).count({ email: userData.email })
            phoneCount = await db.get().collection(collection.USER_COLLECTION).count({ phone: userData.phone })
            if (userCount != 0 || phoneCount != 0) {

                response.status = false
                response.userExist = true;
                resolve(response)
            } else {

                if (userData.referral.length > 0) {

                    let referrals = await db.get().collection(collection.USER_COLLECTION).findOne({ userReferal: userData.referral })
                    console.log(referrals);
                    if (referrals) {
                        let refuser = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(referrals._id) })
                        console.log(refuser);
                        let balance = refuser.balance + 100;
                        let transactions = {
                            credit: 100,
                            debit: 0,
                            date: new Date(),
                            message: "Refferral Bonus"
                        }
                        let update = await db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: objectId(referrals._id) }, {
                            $set: {
                                balance: balance
                            },

                            $push: {
                                transactions: transactions
                            }

                        }
                        )
                        console.log(update);

                        response.status = true;
                        userReferal = referral.generate({
                            prefix: 'RaHa-',
                            postfix: '-2022',
                        });

                        userData.userReferal = userReferal[0]
                        console.log(userData.userReferal)
                        bcrypt.hash(userData.password, 10, (err, hash) => {
                            console.log(userData.password)
                            userData.password = hash
                            userData.status = true
                            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (response) => {
                                let transactions = {
                                    credit: 50,
                                    debit: 0,
                                    date: new Date(),
                                    message: "Refferral Bonus"
                                }
                                let wallets = {
                                    user: response.insertedId,
                                    balance: 50,
                                    transactions: [transactions]
                                }
                                let wallet = await db.get().collection(collection.WALLET_COLLECTION).insertOne(wallets)
                                // walletHelpers.userWallet(data.insertedId)
                                // walletHelpers.addWalletAmount(data.insertedId)  
                                resolve(response.insertedId)
                            }).catch((err) => {
                                reject(err)
                            })
                            console.log(err, hash)
                        })

                    } else {
                        response.message = "Invalid Referral",
                            resolve(response)
                    }
                } else {
                    response.status = true;
                    userReferal = referral.generate({
                        prefix: 'RAHA-',
                        postfix: '-2022',
                    });

                    userData.userReferal = userReferal[0]
                    console.log(userData.userReferal)
                    bcrypt.hash(userData.password, 10, (err, hash) => {
                        console.log(userData.password)
                        userData.password = hash
                        userData.status = true
                        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (response) => {

                            let wallets = {
                                user: response.insertedId,
                                balance: 0,
                                transactions: []
                            }
                            let wallet = await db.get().collection(collection.WALLET_COLLECTION).insertOne(wallets)
                            //    walletHelpers.userWallet(data.insertedId)
                            //    walletHelpers.addWalletAmount(data.insertedId)  
                            resolve(response.insertedId)
                        }).catch((err) => {
                            reject(err)
                        })
                        console.log(err, hash)
                    })

                }


            }
        })


    },
    userlogin: (userData) => {
        // console.log(userData);
        return new Promise(async (resolve, reject) => {
            let status

            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {

                    if (status && user.status) {

                        if (user.status) {
                            console.log("success");
                            response.status = true
                            response.user = user
                            resolve(response)
                        }

                        // console.log(status);

                    }
                    else if (status && user.status == false) {

                        response.userBlock = true
                        resolve(response)
                    }
                    else {
                        console.log("login failed")
                        response.status = false
                        resolve(response)
                    }

                })
            }
            else {
                console.log("login failed error")
                response.status = false
                resolve(response)
            }

        })



    },
    viewuser: () => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find().toArray().then((userData) => {
                resolve(userData)
            })
        })

    },

    blockUser: (userId, status) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    status: status
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let unblock = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectID(userId) }, {
                $set:
                {
                    status: true

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    OTPUserVerify: () => {
        return new Promise(async (resolve, reject) => {
            user = await db.get().collection(collection.USER_COLLECTION).findOne().then(() => {

            })

        })

    },
    otpUserVerify: (otp) => {
        return new Promise(async (resolve, reject) => {

            let status
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: otp.phone })

            if (user) {

                console.log("success");
                response.status = true
                response.user = user
                resolve(response)

            }
            else {
                console.log("login failed")
                response.status = false
                resolve({ status: false })
            }
        })
    },
    addToCart: async (proId, userId) => {

        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })

        let prices = product.price
        let proObj = {
            item: objectId(proId),
            quantity: 1,
            price: parseInt(prices)
        }

        return new Promise(async (resolve, reject) => {

            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {

                let proExist = userCart.products.findIndex(product => product.item == proId)

                if (proExist != -1) {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()

                        })
                        .then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
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
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
                    resolve()
                })
            }
        })
    },

    getCartProducts: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        price: '$products.price'



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
                        quantity: 1,
                        price: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }
                }

            ]).toArray()
            resolve(cartItems)


        })
    },
    getCartCount: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {

            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (cart) {

                count = await cart.products.length
            }
            resolve(count)

        })
    },

    changeProductQuantity: (details) => {
        console.log(details);
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {

            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        })
                    .then((response) => {

                        resolve({ removeProduct: true })

                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).
                    then((response) => {

                        resolve({ status: true })
                    })
            }

        })
    },
    removeProduct: (removeDetails) => {

        return new Promise(async (resolve, reject) => {
            let removeCartItems = db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(removeDetails.cart) },
                {
                    $pull: { products: { item: objectId(removeDetails.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
        })

    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {


            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        price: '$products.price'

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
                        quantity: 1,
                        price: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }

            ]).toArray()
            if (total[0] != null) {
                resolve(total[0].total)
            } else {
                let total = 0
                resolve(total)
            }

        })
    },

    placeOrder: (order, products, total) => {

        return new Promise((resolve, reject) => {
            const d = new Date()


            let status = order['payment-method'] == 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    firstName: order.firstName,
                    lastName: order.lastName,
                    country: order.country,
                    mobile: order.phone,
                    address: order.address,
                    pincode: order.pincode,
                    email: order.email,
                    city: order.city,
                    state: order.state

                },
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                status: status,
                date: new Date().toDateString(),
                time: d.getTime()


            }
            products.forEach(element => {
                element.trackOrder = status
            })



            if (order.percentage) {
                let off = (40 * parseInt(order.percentage)) / 100

                products.forEach(element => {
                    element.couponPercentage = parseInt(order.percentage),
                        element.coupon = order.coupon
                })

                products.forEach(element => {
                    element.offerPrice = Math.round(parseInt(element.price) - parseInt(element.price) * off / 100)
                })
            }


            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                products.forEach(element => {
                    let stock = parseInt(- element.quantity)
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element.item) }, {
                        $inc: { stock: stock }
                    })
                })


                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) }).then(() => {
                    resolve(response.insertedId)
                    console.log("order created");
                })
            })
        })
    },
    generateRazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {

            var options = {
                amount: parseInt(total) * 100,
                currency: "INR",
                receipt: "" + orderId
            }
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err)
                } else {
                    resolve(order)
                }

            })
        })
    }

    ,
    getCartProductList: (userId) => {

        return new Promise(async (resolve, reject) => {

            let cart = await db.get().collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) })

            resolve(cart.products)


        })
    },
    addAddress: (userAddress) => {
        return new Promise(async (resolve, reject) => {
            userAddress.userId = objectId(userAddress.userId)
            await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(userAddress).then(() => {
                resolve()
            })


        })
    },
    getAlladdress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
            resolve(address)

        })
    },
    getAddressToForm: (addressId) => {
        return new Promise(async (resolve, reject) => {
            let formAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(addressId) })
            resolve(formAddress)

        })
    },

    getOneAddressToForm: (userId) => {
        return new Promise(async (resolve, reject) => {
            let formAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(userId) })
            resolve(formAddress)

        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', process.env.verifyPaymentHmac)

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')

            if (hmac == details['payment[razorpay_signature]']) {
                resolve()

            } else {
                reject()
            }
        })
    },

    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            const order = db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        'products.$[].trackOrder': 'placed'
                    }
                })
                .then(() => {
                    resolve(order)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    },




    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
            console.log(address);
            resolve(address)

        })
    },
    deleteAddress: (addressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: objectId(addressId) }).then(() => {
                resolve()
            })
        })
    }
    ,
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })

            resolve(user)

        })
    },
    editAddress: (details) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ _id: objectId(details.addressId) }, {
                $set: {
                    firstName: details.firstName,
                    lastName: details.lastName,
                    country: details.country,
                    address: details.address,
                    city: details.city,
                    state: details.state,
                    pincode: details.pincode,
                    email: details.email

                }
            })
            resolve(address)
        })
    },
    generatePaypal: (orderId, total) => {
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                intent: "sale",
                payer: {
                    "payment_method": "paypal"
                },
                redirect_urls: {
                    return_url: "http://localhost:3000/order-success",
                    cancel_url: "http://localhost:3000/cancel"
                },
                transactions: [{
                    item_list: {
                        items: [{
                            name: "Red Sox Hat",
                            sku: "001",
                            price: "25.00",
                            currency: "USD",
                            quantity: 1
                        }]
                    },
                    amount: {
                        currency: "USD",
                        total: '25.00'
                    },
                    description: "Hat for the best team ever"
                }]
            }
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            resolve(payment.links[i].href);
                            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                                _id: objectId(orderId)
                            },
                                {
                                    $set: {
                                        status: "placed"
                                    }
                                })

                        }
                    }
                }
            });

        })

    },
    getCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()

            resolve(coupon)
        })
    },
    getOneCoupon: (couponId) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ _id: objectId(couponId) })
            resolve(coupon)

        })
    },
    checkCoupon: (couponDetails) => {
        console.log(couponDetails);
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponName: couponDetails.coupon })

            resolve(coupon)


        })
    },

    getWalletDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(userId) })
            console.log(wallet);
            resolve(wallet)
        })
    },

    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()

            resolve(coupon)

        })

    }, editUserPassword: (details) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(details.userId) })

            if (user) {

                bcrypt.compare(details.oldPassword, user.password).then(async (person) => {
                    console.log(person)
                    if (person) {
                        if (details.newPassword == details.rePassword) {
                            details.newPassword = await bcrypt.hash(details.newPassword, 10)
                            console.log("asdsasssaaaaaaa");
                            console.log(details.newPassword);
                            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.userId) }, {
                                $set: {
                                    password: details.newPassword


                                }
                            }).then((response) => {

                                response.status = true;
                                response.message = ""
                                resolve({ status: true })
                            })
                        } else {
                            response.status = false;
                            response.message = "password does not match !"
                            resolve(response)
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Entered password is wrong !"
                        resolve(response)

                    }
                })
            }
            else {
                response.status = false;
                response.message = "something went wrong !"
                resolve(response)
            }


        })
    }

}


