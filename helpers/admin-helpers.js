const { reject } = require('bcrypt/promises');
const { ObjectID, ObjectId } = require('bson');
const collection = require('../config/collection');
var db = require('../config/connection')

module.exports = {

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      // let order = await db.get().collection(collection.ORDER_COLLECTION).find().sort({time:-1}).toArray()

      let pipeline = [{
        $match: {
            "products.trackOrder": { $ne: "pending" }
        }
    },
    { $sort: { time: -1 } }];

    let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate(pipeline).toArray();
      resolve(order)
    })
  },
  adminViewOrderdProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

        {
          $match: { _id: ObjectID(orderId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity',
            status: '$products.trackOrder'
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
            product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray()

      resolve(orderItems)
    })

  },
  getOrder:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
     let order =await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectID(orderId)})

     resolve(order)
    })

  },
  
  dailySalesReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            status: { $ne: "pending" }
          }
        },
        {
          $group: {
            _id: "$date",
            dailySaleAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: -1
          }
        }

      ]).toArray().then((dailySales) => {
        let totalamount = 0
        dailySales.forEach(element => {
          totalamount += element.dailySaleAmount
        });
        dailySales.totalamount = totalamount
        resolve(dailySales)
      })
    })
  },
  monthlySalesReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            status: { $ne: "pending" }
          }
        },
        {
          $group: {
            _id: "$month",
            monthlySaleAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: -1
          }
        }

      ]).toArray().then((monthlySales) => {
        let totalamount = 0
        monthlySales.forEach(element => {
          totalamount += element.monthlySaleAmount
        });
        monthlySales.totalamount = totalamount
        resolve(monthlySales)
      })
    })
  },
  yearlySalesReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            status: { $ne: "pending" }
          }
        },
        {
          $group: {
            _id: "$year",
            yearlySaleAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: -1
          }
        }

      ]).toArray().then((yearlySales) => {
        let totalamount = 0
        yearlySales.forEach(element => {
          totalamount += element.yearlySaleAmount
        });
        yearlySales.totalamount = parseInt(totalamount)
        resolve(yearlySales)
      })
    })
  },
  dailySalesReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            status: { $ne: "pending" }
          }
        },
        {
          $group: {
            _id: "$date",
            dailySaleAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: -1
          }
        }

      ]).toArray().then((dailySales) => {
        let totalamount = 0
        dailySales.forEach(element => {
          totalamount += element.dailySaleAmount
        });
        dailySales.totalamount = totalamount
        resolve(dailySales)
      })
    })  
  },
  monthlySalesReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            status: { $ne: "pending" }
          }
        },
        {
          $group: {
            _id: "$month",
            monthlySaleAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: -1
          }
        }

      ]).toArray().then((monthlySales) => {
        let totalamount = 0
        monthlySales.forEach(element => {
          totalamount += element.monthlySaleAmount
        });
        monthlySales.totalamount = totalamount
        resolve(monthlySales)
      })
    })
  },
  yearlySalesReport: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            status: { $ne: "pending" }
          }
        },
        {
          $group: {
            _id: "$year",
            yearlySaleAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: -1
          }
        }

      ]).toArray().then((yearlySales) => {
        let totalamount = 0
        yearlySales.forEach(element => {
          totalamount += element.yearlySaleAmount
        });
        yearlySales.totalamount = totalamount
        resolve(yearlySales)
      })
    })
  },
  showProducts: () => {
    return new Promise(async (resolve, reject) => {
      product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(product)

    })
  },
  addOffer: (offerDetails) => {
    let percentage = parseInt(offerDetails.percentage);
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectID(offerDetails.proId) })
      let offerPrice = product.price - (product.price * percentage / 100)
       
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectID(offerDetails.proId) }, {
        $set: {
          oldPrice: product.price,
          price: parseInt(offerPrice),
          percentage: percentage
        }
      }).then(()=>{
        resolve()
      })
    })
  },
  addCoupons:(coupon)=>{
     coupon.percentage = parseInt(coupon.percentage)
     return new Promise((resolve,reject)=>{
     
      db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response)=>{
     
        resolve(response)
      })
     })
  },
  deleteCoupon:(couponId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(couponId)}).then(()=>{
        resolve()
      })
    })
  },
  getCoupon:(couponId)=>{
    return new Promise(async(resolve,reject)=>{
     let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:ObjectId(couponId)})
      resolve(coupon)
     })
  },
  updateCoupon:(coupon)=>{
    return new Promise((resolve,reject)=>{
       db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:ObjectId(coupon.couponId)},{
        $set:{
          couponName:coupon.couponName, 
          percentage:coupon.percentage
        }
      }).then(()=>{
        resolve()
      })
    })
  }

}