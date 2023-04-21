

function addToCart(proId){
  let size = document.getElementById('selectedSize').value
  console.log(size)
 
    $.ajax({
      url:'/add-to-cart/'+proId,
      data:{size:size},
      method:'post',
      success:(response)=>{
        if(response.status){
            let count =$('#cart-count').html()
            count = parseInt(count)+1
            $("#cart-count").html(count)
            Toastify({
              text: "Added to Cart",
              className: "info",
              duration: 3000,
              gravity: "top", 
              position: "center",
              style: {
                background: "linear-gradient(to right, #6B061C,#FC1964)",
              }
            }).showToast();
        }
        else{
           //alert('limit reached')
           swal('Out of Stock', 'Product limit reached', 'warning', {
            button: "Ok",
       
          });
        }
      }
    })
 
   
  }
  