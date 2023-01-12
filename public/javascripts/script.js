function addToCart(proId,stock) {
    if(stock==0){
        Swal.fire({
icon: 'error',
title: 'Oops...',
text: 'out of stock!',

     })
     }else{
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
     
           
        
    })}
    
}


        function addToWishlist(pid,stock) {
            if(stock==0){
                Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'out of stock!',
        
             })
             }else{
            $.ajax({
                url: '/add-to-wishlist/' + pid,
                type: 'get', 
                success: (response) => {  
                    if (response.status) {
                        let count = $('#wishlist-count').html()
                        count = parseInt(count) + 1
                        $("#wishlist-count").html(count)
                    }
                }
            }).then((response)=>{
                if(response.status){  swal({
                title: "Success!",
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
        }


