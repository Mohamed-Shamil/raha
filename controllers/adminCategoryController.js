const collections = require('../config/collection')
var db = require('../config/connection')
const productHelpers = require('../helpers/product-helpers')
const {upload} = require("../public/javascripts/fileUpload")

module.exports= { 
    
    addCategory:(req,res)=>{
        res.render('admin/add-category',{admin:true})
      },

    addCategoryPost : (req,res)=>{

  
  
        let category = req.body;
        category.img = req.files[0].filename;
        
      
        productHelpers.addcategory(category).then((id)=>{
           
            res.redirect('/admin/addcategory')
      
        })
      
        
      },

      viewCategories : (req,res)=>{

        productHelpers.viewCategory().then((category)=>{
          res.render('admin/view-category',{admin:true,category,adminlayout:true})
        })
      
      
      },
      deleteCategory:(req,res)=>{

        productHelpers.deleteCategory(req.params.id).then(()=>{
          res.json({status:true})
        })
      },
      editCategory:async(req,res)=>{
        console.log("edit category page");
       let category= await productHelpers.editCategory(req.params.id)
          res.render('admin/edit-category',{admin:true,category,adminlayout:true})
        
      },
      editCategoryPost:(req,res)=>{
        console.log(req.params.id);
      
        productHelpers.editCategory(req.params.id).then((categorydetails)=>{
          console.log(categorydetails);
          if(req.files!=0){
            const files = req.files;
            let category =req.body
            category.img = files[0].filename
          }
          else{
            let category = req.body
            category.img = categorydetails.img
      
          }
          productHelpers.updateCategory(req.params.id,req.body).then(()=>{
      
            res.redirect('/admin/viewcategory')
          })
          
        })
        
       
        
      },
      
}