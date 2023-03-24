function addToCart(proId){
    $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        if(response.status){
            let count =$('#cart-count').html()
            count = parseInt(count)+1
            $("#cart-count").html(count)
        }
      }
    })
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
   
  }
  