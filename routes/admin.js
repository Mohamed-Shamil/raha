var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var AdminHelpers = require('../helpers/admin-helpers')
const {upload, upload2, upload3}= require('../public/javascripts/fileUpload')
const {addproducts,addproductpost,viewProducts,editProduct,editProductPost,deleteProduct} = require('../controllers/adminProductController');
const {addCategory,addCategoryPost,viewCategories,deleteCategory,editCategory,editCategoryPost} = require('../controllers/adminCategoryController')
const {adminIndex, adminLogin,adminLogout, viewUser, userBlock, userUnblock} = require('../controllers/userController')
const {addBanner, banner, editBanner} = require('../controllers/bannerController')
const { viewOrder, sales, offer, viewOrderProducts } = require('../controllers/orderController')
const {addCouponPost, viewCoupon, editCoupon, editCouponPost, addCouponPage} = require('../controllers/couponController') 
const { getproducts, deleteproduct,viewCategory, viewBanner, deleteBanner,} = require('../helpers/product-helpers');
const { CATEGORY_COLLECTION } = require('../config/collection');
const userHelpers = require('../helpers/user-helpers');
const { Admin } = require('mongodb');
const adminHelpers = require('../helpers/admin-helpers');
const orderHelpers = require('../helpers/order-helpers');
const { log, logger } = require('handlebars');
const {order} = require('paypal-rest-sdk');
const { viewOrderdProducts, updateStatus, returnOrder } = require('../helpers/order-helpers');
const { addOffer, addCoupons, deleteCoupon } = require('../helpers/admin-helpers');

const admin = {
  email: 'admin@gmail.com',
  password : 12345
 
}

const verifyadmin = (req,res,next)=>{
  console.log(`${req.method} request made to ${req.url}`);
  if(req.session.adminLogin){
    next()
  }else{
    res.redirect('/admin')
  }
}



//<----------------------admin Login------------------->
router.post('/adminlogin',adminLogin)

//<-----------------------admin Logout--------------------->
router.get('/admin-logout',adminLogout)


//<-------------------admin home------------------------>
router.get('/',adminIndex);

//<---------------------view User---------------------------->
router.get('/viewuser',verifyadmin,viewUser)

router.route('/addproducts').
// <------------------------addproducts----------------------->
get(verifyadmin,addproducts)
// <--------------------add Products Post--------------------->
.post(upload.array('images'),addproductpost)

//<------------------------view Products---------------------->
router.get('/viewproducts',verifyadmin,viewProducts)
 
router.route('/addcategory')
//<------------------Add Category---------------------------->
.get(verifyadmin,addCategory)
//<--------------------Add Category Post--------------------->
.post(upload2.any('images'),addCategoryPost)

//<--------------------Add Banner Post--------------------->
router.post('/addbanner',upload3.any('images'),addBanner)

//<------------------------Edit Products---------------------->
router.get('/editproduct/:id',verifyadmin,editProduct)
//<------------------------Edit Products post---------------------->
router.post('/editproducts/:id',upload.array('images'),editProductPost)

//<------------------------delete Products---------------------->
router.delete('/deleteproduct/:id',deleteProduct)

// <---------------------view Categories-------------------->
router.get('/viewcategory',verifyadmin,viewCategories)

//<------------------------delete category---------------------->
router.delete('/deletecategory/:id',deleteCategory)

//<------------------------edit category---------------------->
router.get('/editcategory/:id',verifyadmin,editCategory)

//<------------------------delete category post---------------------->
router.post('/editcategory/:id',upload2.any('images'),editCategoryPost)

//<------------------------user Block---------------------->
router.get('/block/:id/:status',verifyadmin,userBlock)

//<------------------------user Unblock---------------------->
router.get('/unblock/:id',verifyadmin,userUnblock)

//<------------------------ add Banner page---------------------->
router.get('/add-banner',verifyadmin,banner)

//<------------------------ view Banner page---------------------->
router.get('/view-banners',verifyadmin,viewBanner)

//<------------------------ delete Banner ---------------------->
router.delete('/deletebanner/:id',verifyadmin,deleteBanner)

//<------------------------ view Order ---------------------->
router.get('/order',verifyadmin,viewOrder)

//<------------------------ view Order products---------------------->
router.get('/viewOrderProducts/:id',verifyadmin,viewOrderProducts)

//<------------------------ update Status---------------------->
router.post('/update-status',updateStatus)

//<-----------------------------sales page------------------------>
router.get('/sales',verifyadmin,sales)

//<---------------edit Banner----------------------------------->
router.get('/edit-banner/:id',verifyadmin,editBanner)

//<----------------------------offer Page------------------------>
router.get('/offer',verifyadmin,offer)

//<-----------------------add Offer---------------------------->
router.post('/add-offer',addOffer)

//<-----------------------add coupon---------------------------->
router.get('/add-coupon',verifyadmin,addCouponPage)

//<---------------------------add Coupon Post------------------->
router.post('/addcoupon',addCouponPost)

//<---------------------------view Coupon ------------------->
router.get('/view-coupons',verifyadmin,viewCoupon)

//<---------------------------delete Coupon ------------------->
router.delete('/deleteCoupon/:id',deleteCoupon)

//<---------------------------edit Coupon ------------------->
router.get('/editCoupon/:id',verifyadmin,editCoupon)

//<---------------------------edit Coupon Post------------------->
router.post('/editcoupon',verifyadmin,editCouponPost)

//<-----------------------return Order---------------------------->
router.get('/return-order',verifyadmin,returnOrder)
module.exports = router;
