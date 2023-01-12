const collections = require('../config/collection')
var db = require('../config/connection')
const productHelpers = require('../helpers/product-helpers')
const {upload} = require("../public/javascripts/fileUpload")
const userHelpers = require("../helpers/user-helpers")
const orderHelpers = require('../helpers/order-helpers')
const adminHelpers = require('../helpers/admin-helpers')

module.exports= { 
    viewOrder:async(req,res)=>{
        let orders = await adminHelpers.getAllOrders()
        res.render('admin/view-orders',{admin:true,orders,adminlayout:true})
        
      },
    
      viewOrderProducts:async(req,res)=>{
        let viewProducts = await adminHelpers.adminViewOrderdProducts(req.params.id)
        let order = await adminHelpers.getOrder(req.params.id)
        let userId = order.userId
          res.render('admin/view-orderdProducts',{admin:true,userId,order,viewProducts,adminlayout:true})
        
        
      },

      adminUpdateStatus:(req,res)=>{
        orderHelpers.updatedStatus(req.body).then(()=>{
          res.json({status:true})
        })
        
      },
      
    sales:async(req,res)=>{
        let dailySales=await adminHelpers.dailySalesReport()
        let monthlySales=await adminHelpers.monthlySalesReport()
        let yearlySales=await adminHelpers.yearlySalesReport()
        res.render('admin/sales',{admin:true,dailySales,monthlySales,yearlySales,adminlayout:true})
      },

    offer:async(req,res)=>{
        product = await adminHelpers.showProducts()
           res.render('admin/offer',{admin:true,adminlayout:true,product})
         
       },

    addOffer:(req,res)=>{
      adminHelpers.addOffer(req.body).then(()=>{
        res.redirect('/admin/offer')
      })
    },  

    returnOrder:async(req,res)=>{  
        let returns = await orderHelpers.showReturnedProducts()
        res.render('admin/return',{admin:true,adminlayout:true,returns})
      }
} 