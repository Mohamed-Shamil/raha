function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success:(response) => {
            if(response.status){
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $("#cart-count").html(count)
            }
            document.getElementById(cartId).style.display = 'none'
        }
    })
    .then((response)=>{
        if(response.status){  swal({
        title: "Success!",
        text: "You added product to the cart!",
        icon: "success",
    })}else{
        swal(
           {title: "Sorry!",
           text:"You have to SignIn!",
        
        } 
        )
    }
     
           
        
    })
    
}

function addToWishlist(proId){
    $.ajax({
        url:'/add-to-wishlist/'+ proId,
        method:'get',
        success:(response)=>{

        }
    })
}

function addToWishlist(proId) {
    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'get',
        success:(response) => {
            if(response.status){
                let count = $('#wishlist-count').html()
                count = parseInt(count)+1
                $("#wishlist-count").html(count)
            }
            document.getElementById(wishlistId).style.display = 'none'
        }
    })
    .then((response)=>{
        if(response.status){  swal({
        title: "Good job!",
        text: "You added product to the wishlist!",
        icon: "success",
    })}else{
        swal(
           {title: "Sorry!",
           text:"You have to SignIn!",
        
        } 
        )
    }
     
           
        
    })
    
}


        function addToWishlist(pid) {
            console.log(pid)
            $.ajax({
                url: '/add-to-wishlist/' + pid,
                type: 'get',
                success: (response) => {  
                    console.log("dddddddddddddddddddddddddddddddddddddd")
                    console.log(response);
                    if (response.status) {
                        let count = $('#wishlist-count').html()
                        count = parseInt(count) + 1
                        $("#wishlist-count").html(count)
                    }
                }
            })
        }


