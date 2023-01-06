const { log } = require('handlebars');
const { response } = require('../app');
const collection = require('../config/collection');
var db = require('../config/connection')
var objectId = require('mongodb').ObjectId


module.exports={
    addProducts: (product)=>{
       let time= new Date().getTime()
       product.price = parseInt(product.price)
       product.offerPrice = parseInt(product.offerPrice)
       product.stock = parseInt(product.stock)
       product.time = time
        console.log(product)
        return new Promise(async (resolve,reject)=>{
            try{
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                    console.log(data);
                    resolve(data.InsertedId)
                })
    
            }catch(error){
                console.log(error);
                reject(error)
            }
            
        })  
    },

    getproducts: ()=>{
        return new Promise(async(resolve,reject)=>{
            try{
              let product =  db.get().collection(collection.PRODUCT_COLLECTION).find().sort({time:-1}).toArray() 
                    resolve(product) 
                    
               
            }catch(error){
                console.log(error);
                reject(error)
            }
            



        } )
    },

    deleteproduct:(productId)=>{
        return new Promise(async(resolve,reject)=>{

            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)}).then(()=>{
                resolve()
            })
        })
    },
    updateproduct:(productId,product)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{$set:{
                name:product.name,
                price:parseInt(product.price),
                category:product.category,
                stock:parseInt(product.stock),
                discription:product.discription,
                img: product.img
            }
            
            }).then((PRODUCT)=>{
                resolve(PRODUCT)
            })
        })
    },

    editproduct:(productId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    addcategory: (category)=>{
            console.log(category);
            let time = new Date().getTime()
            category.time = time
            return new Promise(async(resolve,reject)=>{

                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
                    console.log(data + "this is category data");
                    resolve(data.InsertedId)
                })
            })
        },

    viewCategory : ()=>{
        return new Promise(async(resolve,reject)=>{
          const category =  await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({time:-1}).toArray();

          resolve(category)
            
        })
    }
    , 
    viewProducts : ()=>{
        return new Promise(async(resolve,reject)=>{
          products =  await db.get().collection(collection.PRODUCT_COLLECTION).find({}).sort({time:-1}).toArray();
          resolve(products)
            
        })
    }
    ,getCountProducts:()=>{
        return new Promise(async(resolve, reject) => {
          let count=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
          resolve(count.length)
        })
       },
       getproductsp:(limit)=>{
       
        return new Promise(async(resolve, reject) => {
          let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(limit.startFrom).limit(limit.perpage).toArray()
          resolve(product)
        })
       },
    viewOneProduct : (proId)=>{
        return new Promise(async(resolve,reject)=>{
          product =  await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((response)=>{
          
          resolve(response)
          });
         
            
        })
    }
    ,
    

    deleteCategory: (catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then(()=>{
                resolve()
            })
        })
    },

        editCategory : (catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((response)=>{
                    resolve(response)
            })
        })
    },
    updateCategory : (catId,category)=>{

        return new Promise ((resolve,reject)=>{

            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{$set:{

                categoryName:category.categoryName,
                discription : category.discription,
                img: category.img
                
            }

            }).then((response)=>{
                 resolve(response)
            })

        })
    },
    updateBanner:(banner)=>{
       
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(banner._id)},{
                banner:banner.banner,
                discription:banner.discription,
                img:banner.img
            }).then((response)=>{
       
                resolve()
            })
        })

    },
    addBanner : (banner)=>{
        banner.time = new Date().getTime()
        return new Promise(async(resolve,reject)=>{
             banner = await db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((banner)=>{
                
                resolve(banner)
            })
            
        })
    }
    ,

    viewBanner : ()=>{
        return new Promise(async(resolve,reject)=>{
           
           let banner = await db.get().collection(collection.BANNER_COLLECTION).find().sort({time:-1}).toArray()
            resolve(banner)
        })
    },
    getBannerDetails:(bannerId)=>{
        return new Promise(async(resolve,reject)=>{
            let banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerId)})
                console.log(banner);
                resolve(banner)
        
        })
    },
    deleteBanner:(bannerId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(bannerId)}).then((response)=>{
                resolve()
            })
        })
    },
    viewProCategory:(catgry)=>{
       
        return new Promise(async(resolve,reject)=>{
           let category=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:catgry}).toArray()
           resolve(category)
        })
    },
    searchProduct:(searchDetails)=>{
        searchName = searchDetails.search
        return new Promise(async(resolve,reject)=>{
           let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({name:{$regex:searchName,$options:'i'}}).toArray()
            
           resolve(product)
        })
    }
}