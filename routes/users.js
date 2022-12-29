const express = require('express');
const { log } = require('handlebars');
const { response } = require('../app');
const orderHelpers = require('../helpers/order-helpers');
const productHelpers = require('../helpers/product-helpers');
// const userHelpers = require('../helpers/user-helpers');
const { usersignup , dosignup, userlogin } = require('../helpers/user-helpers');
const { route } = require('./admin');
const referral = require('referral-codes')
var router = express.Router();

const paypal = require('paypal-rest-sdk')


const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    
    next()
  }else{
    res.redirect('/login')
  }
}


const cartCount =async(req,res,next)=>{
  if(req.session.loggedIn){
   let cartCount = await userHelpers.getCartCount(req.session.user._id);
   res.locals.userLogin =   req.session.user

   res.locals.cartCount=cartCount
    next()
  }else{
    let cartCount=0;
    res.locals.cartCount=cartCount
    next()
    }

}
/* GET home page. */
const client = require("twilio")(process.env.twilioSID,process.env.twilioSecretKey);


let phone_no

router.get('/',async(req,res,next)=> {
//let userLogin = req.session.user  >>>>>this was chandes into just user!!!
  let userLogin =  req.session.user
  let cartCount = 0
  if(req.session.user){
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
   
   category = await productHelpers.viewCategory();
   products = await productHelpers.viewProducts();
   banners= await productHelpers.viewBanner();
   console.log(banners);
  
        res.render('index',{category,products,banners,cartCount,userLogin,userlayout:true});

  

 
});

router.route('/login')
.get((req,res)=>{
  
  if(req.session.loggedIn){
    res.redirect('/')
  }
  else{
    
  
  console.log( "login page opened");
  errMsg = req.session.msg
  res.render('login',{errMsg:req.session.msg,userlayout:true})
  req.session.msg = ''
  }
})  
.post((req,res)=>{
  
    userHelpers.userlogin(req.body).then((response)=>{
    
      if(response.status){
        req.session.user=response.user
        req.session.loggedIn=true
        console.log("login form submitted");
        res.redirect('/')
      }
      else if(response.userBlock)
      {
        req.session.msg = "Your Account is blocked"
        res.redirect('/login')
      }
      else{
        req.session.msg = "Invalid Username or Password"
        res.redirect('/login')
        
      }
     
    })
  
})

router.get('/logout',(req,res)=>{
req.session.destroy()
res.redirect('/')
})

router.get('/product/:id',async(req,res)=>{
  
  products = await productHelpers.viewOneProduct(req.params.id)
     res.render('products',{user:true,products,userlayout:true})

  });
  router.get('/show-product',cartCount,async(req,res)=>{
    
     let category = req.params.name
    // products = await productHelpers.viewProducts();//
    let page={}
    let userLogin =  req.session.user

    page.total=await productHelpers.getCountProducts()
    page.perpage=2
    page.pages=Math.ceil(page.total/page.perpage)
    page.pageno=(req.query.page==null)?1:parseInt(req.query.page)
    page.startFrom=(page.pageno -1)*page.perpage
    let products=await productHelpers.getproductsp(page)
    
    

    res.render('allProducts',{user:true,products,userlayout:true,category,page,userLogin  })
  })



router.route('/signup').get((req,res)=>{
  console.log("signup page opened");
  errMsg = req.session.msg
  res.render('signup',{userlayout:true,errMsg})
  req.session.msg = ''

})
.post((req,res)=>{
  
  userHelpers.dosignup(req.body).then((response)=>{
    if(response.userExist){
      req.session.msg = "User Already Exist"
      res.redirect('/signup')
    
    }else{
      
      res.redirect('/login')
    }
    
  })

})



router.post("/sendcode", (req, res) => {
userHelpers.otpUserVerify(req.body).then((response)=>{
  if(response.status){
    phone_no = parseInt(req.body.phone)
  
    client.verify
    .services('VA596b689b357641ce139d77f00b7b670e') // Change service ID
      .verifications.create({
        to: `+91${req.body.phone}`,
        channel:  "sms",
      })
      .then((data) => {
       
          req.session.user=response.user
          req.session.loggedIn=true
            res.redirect('/verifyOtp')

      });
  }else{
    
  
    res.redirect('/otpLogin')

  }

})
  
 
  });

  router.post("/verify", (req, res) => {
    
    
    client.verify
      .services('VA596b689b357641ce139d77f00b7b670e') // Change service ID
      .verificationChecks.create({
        to: `+91${phone_no}`,
        code: req.body.OTP,
      })
      .then((data) => {
        if (data.status === "approved") {
          
          req.session.loggedIn=true
          res.redirect('/')
        } else {
          res.status(400).send({
            message: "User is not Verified!!",
            data,
          });
         
        }
      });
  });
  
router.get('/otpLogin',(req, res)=>{
 
  res.render('otplogin',{userlayout:true})
 
})

router.get('/verifyOtp',(req,res)=>{
  res.render('otpverify',{userlayout:true})
})
router.post('/verifyOtp',(req,res)=>{
  res.render('otpverify',{userlayout:true})
})


router.post('/submitotp',(req,res)=>{

  res.redirect('/')
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
   
    res.json({status:true})
  })
 
})

router.get('/cart',verifyLogin,cartCount,async(req,res)=>{
  User = req.session.user
  let products =await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('cart',{user:true,userlogin:req.session.user._id,products, User,totalValue,userlayout:true})
})

router.post('/change-product-quantity',(req,res)=>{ 
 userHelpers.changeProductQuantity(req.body).then(async(response)=>{
 response.total = await userHelpers.getTotalAmount(req.session.user._id)
    res.json(response)
  })
})

router.post('/remove-product',(req,res)=>{
  userHelpers.removeProduct(req.body).then((response)=>{
    res.json(response)
  })
})

router.get('/checkout',verifyLogin,cartCount,async(req,res)=>{ 
  let formAddress = await userHelpers.getAddressToForm(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  let address = await userHelpers.getAlladdress(req.session.user._id)
  let coupon = await userHelpers.getCoupon()
  let wallet = await userHelpers.getWalletDetails(req.session.user._id)

  
  res.render('checkout',{total,user:req.session.user,address,formAddress,coupon,wallet,userlayout:true}) 
})

router.post('/place-order',verifyLogin,async(req,res)=>{

  let products = await userHelpers.getCartProductList(req.body.userId)
  if(req.body.newTotal>1){
    totalPrice= req.body.newTotal

  }else{
     totalPrice = await userHelpers.getTotalAmount(req.session.user._id)
  }
  

   userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']=='COD'){
      res.json({codSuccess:true})
    }else if(req.body['payment-method']=='ONLINE') {
      userHelpers.generateRazorPay(orderId,totalPrice).then((response)=>{
        response.online=true
        res.json(response)
        //res.json(response)
      })
    }else if (req.body['payment-method']=='Wallet'){
      orderHelpers.walletMoney(totalPrice,req.session.user._id)
    }else {
      userHelpers.generatePaypal(orderId,totalPrice).then((link)=>{
        res.json(link)
      })
    }
    
   })
 })
 router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [{
        amount: {
            currency: "USD",
            total: "25.00"
        }
    }]
  };

// Obtains the transaction details from paypal
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.redirect('/success')
    }
});
});

router.post('/add-address',(req,res)=>{
   userHelpers.addAddress(req.body).then((response)=>{
    res.redirect('/checkout') 
  })
   
})

router.get('/get-address-details/:id',async(req,res)=>{


  let address = await userHelpers.getAddressToForm(req.params.id)
  res.json(address)
})

router.get('/my-account',verifyLogin,cartCount,async(req,res)=>{
  let orders = await orderHelpers.getOrderDetails(req.session.user._id)
  let address = await userHelpers.getAddress(req.session.user._id)
  let user = await userHelpers.getUserDetails(req.session.user._id)
  let wallet = await userHelpers.getWalletDetails(req.session.user._id)
  
  let usr=req.session.user._id
  
  console.log("my account opens here");
     res.render('myAccount',{user:true,orders,address,user,usr,userlayout:true,wallet})
})
router.get('/view-ordered-products/:id',verifyLogin,cartCount,async(req,res)=>{
     let products = await orderHelpers.viewOrderdProducts(req.params.id)
     
  res.render('viewOrderdProducts',{user:true,products,userlayout:true})
})
router.post('/verify-payment',(req,res)=>{
 
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment successfull");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log("payment Failed");
    res.json({status:false,errMsg:''})
  })
})


  

router.delete('/delete-address/:id',(req,res)=>{
  userHelpers.deleteAddress(req.params.id).then(()=>{
    res.json()
  })
})

router.post('/addAddress',(req,res)=>{
 
  userHelpers.addAddress(req.body).then(()=>{

   res.redirect('/my-account')
 })
  
})
router.post('/update-status',(req,res)=>{
  orderHelpers.changeStatus(req.body,req.session.user._id).then(()=>{ 
    res.json({status:true})
  })
})

router.get("/request-page/:id/:orderId",cartCount,verifyLogin,async(req,res)=>{

  let prod = await orderHelpers.returnProducts(req.params.orderId,req.params.id)
  let order = await orderHelpers.returnOrder(req.params.orderId)
  let user = req.session.user
  let productid = prod[0]
  res.render('return-page',{user:true,userlayout:true,order,user,prod,productid})
})

router.post('/update-return-request',(req,res)=>{
  console.log(req.body);

  orderHelpers.updateRequest(req.body).then(()=>{
      console.log("hiiiiiiiiiiiiiiiii");
    res.json({status:true})
  })
})

router.get('/get-address/:id',async(req,res)=>{
  let address = await userHelpers.getOneAddressToForm(req.params.id)
  res.json(address)
})

 router.post('/edit-address-details',(req,res)=>{

  userHelpers.editAddress(req.body).then(()=>{
    res.json({status:true})
  })
 })

 router.get('/order-success',cartCount,(req,res)=>{
  res.render('successPage',{user:true,userlayout:true})
 })
 
 router.get('/view-category-pro/:categoryName',cartCount,async(req,res)=>{
  
   showCategory = await productHelpers.viewProCategory(req.params.categoryName)
  
   console.log(showCategory);
     res.render('product-category',{user:true,showCategory,userlayout:true})

 
 })

 router.get('/get-coupon/:id',async(req,res)=>{
  let coupon = await userHelpers.getOneCoupon(req.params.id)
    
  res.json(coupon)
  
 })

 router.post('/sumbit-coupon',async(req,res)=>{

 let coupon = await userHelpers.checkCoupon(req.body)
 console.log(coupon);
        res.json(coupon)

 })

 router.get('/add-to-wishlist/:id',(req,res)=>{ 
    userHelpers.addTowishlist(req.params.id)
  //////////////////////////
 })

 router.get('/search-products',(req,res)=>{
    productHelpers.searchProduct
  
 })

 router.post('/search',async(req,res)=>{
  
  searchDetails = await productHelpers.searchProduct(req.body)

    res.render('searchProducts',{user:true,userlayout:true,searchDetails})

 })

 router.post('/edit-password',(req,res)=>{
  userHelpers.editUserPassword(req.body).then((response)=>{
    res.json(response)
  })
})
module.exports = router;
