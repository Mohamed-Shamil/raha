const collections = require('../config/collection')
var db = require('../config/connection')
const productHelpers = require('../helpers/product-helpers')
const {upload} = require("../public/javascripts/fileUpload")
const adminHelpers = require('../helpers/admin-helpers')

module.exports= { 
    addBanner: (req,res)=>{
  
        let banner = req.body;
        banner.img = req.files[0].filename;
      
        productHelpers.addBanner(banner).then(()=>{
         
          res.redirect('/admin/add-banner')
        })  
      },
    banner:(req,res)=>{
        console.log("add banner");
        res.render('admin/add-banner',{admin:true,adminlayout:true})
      },
      
    adminviewBanner: async(req,res)=>{
       let banner = await productHelpers.viewBanner()
          res.render('admin/view-banner',{admin:true,banner,adminlayout:true})
      
        
      },

    deleteBanner:(req,res)=>{
        productHelpers.deleteBanner(req.params.id).then((response)=>{
          res.json({status:true})
        })
        
      },

    editBanner:(req,res)=>{

        productHelpers.getBannerDetails(req.params.id).then((response)=>{
          // res.json(response)
        })
      }
}