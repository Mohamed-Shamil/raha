const collections = require('../config/collection')
var db = require('../config/connection')
const productHelpers = require('../helpers/product-helpers')
const {upload} = require("../public/javascripts/fileUpload")

module.exports= { 
    
    addproducts :async (req,res)=>{
    console.log("heerere");
    let category = await productHelpers.viewCategory()
      res.render('admin/add-products',{admin:true,category})
    
    },

  addproductpost : (req,res)=>{
    
    const files = req.files
    
  
    const fileName = files.map((file)=>{
      return file.filename
    })
    console.log(req.body);
    let product = req.body;
    product.img = fileName;
    

    productHelpers.addProducts(product).then((id)=>{
        console.log(req.body);
        res.redirect('/admin/addproducts')

    })

    const products = req.body
    product.img = fileName
  
  },

    viewProducts :async (req,res)=>{
       let product= await productHelpers.getproducts()
       let category = await  productHelpers.editCategory()
        console.log(category);
        console.log(product);
        res.render('admin/view-products',{admin:true,product,category,adminlayout:true})
     
        
      },
    
    editProduct :async(req,res)=>{
      let product =await productHelpers.editproduct(req.params.id)
      let category = await productHelpers.viewCategory()
     
        res.render('admin/editproducts',{admin:true,product,category})
      
      
    },

    editProductPost:(req,res)=>{
  
      let product
      // console.log(req.body);
      productHelpers.editproduct(req.params.id).then((PRODUCT)=>{
       
         if(req.files!=0){
         
          const files= req.files
          const fileName = files.map((file)=>{
            return file.filename
          })
          product=req.body
          product.img = fileName
        }else
        {
          product = req.body;
          product.img = PRODUCT.img
        }
        console.log(product);
    
        productHelpers.updateproduct(req.params.id,product).then(()=>{
      
          
          res.redirect('/admin/viewproducts')
        })
      })
      
    },
    deleteProduct:(req,res)=>{

      productHelpers.deleteproduct(req.params.id).then(()=>{
        res.json({status:true})
      })
      
    }

        }

  