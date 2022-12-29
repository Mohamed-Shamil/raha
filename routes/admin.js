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

//<-------------------admin home------------------------>
router.get('/',adminIndex);

//<----------------------admin Login------------------->
router.post('/adminlogin',adminLogin)

//<-----------------------admin Logout--------------------->
router.get('/admin-logout',adminLogout)

//<---------------------view User---------------------------->
router.get('/viewuser',viewUser)

router.route('/addproducts').
// <------------------------addproducts----------------------->
get(addproducts)
// <--------------------add Products Post--------------------->
.post(upload.array('images'),addproductpost)

//<------------------------view Products---------------------->
router.get('/viewproducts',viewProducts)
 
router.route('/addcategory')
//<------------------Add Category---------------------------->
.get(addCategory)
//<--------------------Add Category Post--------------------->
.post(upload2.any('images'),addCategoryPost)

//<--------------------Add Banner Post--------------------->
router.post('/addbanner',upload3.any('images'),addBanner)

//<------------------------Edit Products---------------------->
router.get('/editproduct/:id',editProduct)
//<------------------------Edit Products post---------------------->
router.post('/editproducts/:id',upload.array('images'),editProductPost)

//<------------------------delete Products---------------------->
router.delete('/deleteproduct/:id',deleteProduct)

// <---------------------view Categories-------------------->
router.get('/viewcategory',viewCategories)

//<------------------------delete category---------------------->
router.delete('/deletecategory/:id',deleteCategory)

//<------------------------edit category---------------------->
router.get('/editcategory/:id',editCategory)

//<------------------------delete category post---------------------->
router.post('/editcategory/:id',upload2.any('images'),editCategoryPost)

//<------------------------user Block---------------------->
router.get('/block/:id/:status',userBlock)

//<------------------------user Unblock---------------------->
router.get('/unblock/:id',userUnblock)

//<------------------------ add Banner page---------------------->
router.get('/add-banner',banner)

//<------------------------ view Banner page---------------------->
router.get('/view-banners',viewBanner)

//<------------------------ delete Banner ---------------------->
router.delete('/deletebanner/:id',deleteBanner)

//<------------------------ view Order ---------------------->
router.get('/order',viewOrder)

//<------------------------ view Order products---------------------->
router.get('/viewOrderProducts/:id',viewOrderProducts)

//<------------------------ update Status---------------------->
router.post('/update-status',updateStatus)

//<-----------------------------sales page------------------------>
router.get('/sales',sales)

//<---------------edit Banner----------------------------------->
router.get('/edit-banner/:id',editBanner)

//<----------------------------offer Page------------------------>
router.get('/offer',offer)

//<-----------------------add Offer---------------------------->
router.post('/add-offer',addOffer)

//<-----------------------add coupon---------------------------->
router.get('/add-coupon',addCouponPage)

//<---------------------------add Coupon Post------------------->
router.post('/addcoupon',addCouponPost)

//<---------------------------view Coupon ------------------->
router.get('/view-coupons',viewCoupon)

//<---------------------------delete Coupon ------------------->
router.delete('/deleteCoupon/:id',deleteCoupon)

//<---------------------------edit Coupon ------------------->
router.get('/editCoupon/:id',editCoupon)

//<---------------------------edit Coupon Post------------------->
router.post('/editcoupon',editCouponPost)

//<-----------------------return Order---------------------------->
router.get('/return-order',returnOrder)
module.exports = router;
