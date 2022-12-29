const collections = require('../config/collection')
var db = require('../config/connection')
const productHelpers = require('../helpers/product-helpers')
const {upload} = require("../public/javascripts/fileUpload")
const userHelpers = require("../helpers/user-helpers")
const adminHelpers = require('../helpers/admin-helpers');

const admin = {
    email: 'admin@gmail.com',
    password : 12345
   
  }
  

module.exports= { 

    adminIndex:async function(req, res, next) {

        console.log("admin login form");
        if(req.session.adminLogin){
          let dailySales=await adminHelpers.dailySalesReport()
        let monthlySales=await adminHelpers.monthlySalesReport()
        let yearlySales=await adminHelpers.yearlySalesReport()
          res.render('admin/admin-index',{admin:true,adminlayout:true,dailySales,monthlySales,yearlySales});
        }else{
          errMsg = req.session.Msg;
          res.render('admin/admin-login',{errMsg,adminlayout:true})
          req.session.Msg=''
      
        }
        
      },
    
    adminLogin:(req,res,next)=>{
        console.log("admin index opened");
        if(admin.email == req.body.email && admin.password ==req.body.password){
          req.session.adminLogin = true;
          res.redirect('/admin')
        }else{
          req.session.Msg ="invalid Username or Password"
          res.redirect('/admin')
          
        }
      
        
      },

    adminLogout:(req,res)=>{
        req.session.adminLogin=false
        res.redirect('/admin')
      },
    
    viewUser:async(req,res)=>{
        let viewUser =await userHelpers.viewuser()
        res.render('admin/view-user',{admin:true,viewUser,adminlayout:true})
      },

    userBlock:async(req,res)=>{
        let status
        if(req.params.status == "false")
        {
          status = false
        }
        else{
          status = true
        }
        await userHelpers.blockUser(req.params.id,status).then(()=>{
          res.redirect('/admin/viewuser')
          // res.json({status:true})
        })
       
        
      },
    
    userUnblock:async(req,res)=>{
        await userHelpers.unblockUser(req.params.id).then(()=>{
          res.redirect('/admin/viewuser')
        })
      
    }
}