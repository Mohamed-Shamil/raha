const collections = require('../config/collection')
var db = require('../config/connection')
const productHelpers = require('../helpers/product-helpers')
const {upload} = require("../public/javascripts/fileUpload")
const userHelpers = require("../helpers/user-helpers")
const orderHelpers = require('../helpers/order-helpers')

module.exports= { 

    addCouponPage:(req,res)=>{
        res.render('admin/add-coupon',{admin:true,adminlayout:true})
      },

    addCouponPost:(req,res)=>{
        adminHelpers.addCoupons(req.body).then((response)=>{
          console.log(req.body);
          res.redirect('/admin/add-coupon') 
        })
        
      },

    viewCoupon:async(req,res)=>{
        coupons = await userHelpers.getAllCoupons()
        res.render('admin/view-coupons',{adminlayout:true,admin:true,coupons})
      },

    deleteCoupon:(req,res)=>{
        adminHelpers.deleteCoupon(req.params.id).then(()=>{
          res.json({status:true})
      
        })
      },

    editCoupon:async(req,res)=>{
        let coupon = await adminHelpers.getCoupon(req.params.id)
          res.render('admin/edit-coupon',{admin:true,adminlayout:true,coupon})
      
      },

    editCouponPost:(req,res)=>{
        console.log(req.body);
        adminHelpers.updateCoupon(req.body).then(()=>{
          res.json({status:true})
      
        })
      }
}
