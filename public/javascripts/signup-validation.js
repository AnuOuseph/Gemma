var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var phoneError = document.getElementById('phone-error');
var passwordError = document.getElementById('password-error');
var passwordError2 = document.getElementById('password-error2');
var submitError = document.getElementById('submit-error');
var priceError = document.getElementById('price-error');
var pinError = document.getElementById('pin-error');

function validateName(){                                 
  var name = document.getElementById('name').value;
  if(name.length == 0){
    nameError.innerHTML = 'Name is required';
    return false;
  }
  if(!name.match(/^[A-Za-z]+ [A-Za-z]+$/)) {
      nameError.innerHTML = 'Write full name';
      return false;
  }
  nameError.innerHTML = '';
      return true;
}
function validatePrice(){
  var pr = document.getElementById('price').value;
  var price = parseInt(pr)
  if(price == 0){
    priceError.innerHTML = 'price Cannot be zero';
    return false;
  }
  if(price<0){
    priceError.innerHTML = 'Price cannot be a negative value';
    return false;
  }
  priceError.innerHTML='';
  return true;
}

function validateEmail(){
  var email = document.getElementById('email').value;
  if(email.length==0){
      emailError.innerHTML = 'Email is required';
      return false;
  }
  if(!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)){
    emailError.innerHTML = 'Email invalid';
    return false;
  }
  emailError.innerHTML = '';
  return true;
}

function validatePassword(){
  var password = document.getElementById('password').value;
  // var passChecker = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  var passChecker = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if(password.match(passChecker)){
    passwordError.innerHTML = '';
    return true;
  }else{
    passwordError.innerHTML = 'Minimum 8 character,1 numeric digit, 1 uppercase and 1 lowercase';
    return false;
  }
}

function validatePhone(){
  var phone = document.getElementById('phone').value;
  var phoneChecker = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if(phone.match(phoneChecker)){
    phoneError.innerHTML = '';
    return true;
  }else{
    phoneError.innerHTML = 'Invalid phone number';
    return false;
  }
}

function validatePin(){
  var pin = document.getElementById('pin').value;
  var pinChecker = /^\d{6}$/;
  if(pin.match(pinChecker)){
    pinError.innerHTML = '';
    return true;
  }else{
    pinError.innerHTML = 'Invalid pincode';
    return false;
  }
}

function validatePassword2(){
  var password = document.getElementById('password').value;
  var password2 = document.getElementById('password2').value;
  // var passChecker = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  if(password === password2){
    passwordError2.innerHTML = '';
    return true;
  }else{
    passwordError2.innerHTML = "Password Doesn't match";
    return false;
  }
}

function validateForm(){
  if(!validateName() || !validateEmail() || !validatePassword() || !validatePassword2() || !validatePhone()){
    submitError.style.display='flex';
    submitError.style.justifyContent='center';
    submitError.innerHTML = 'Please fix all errors to submit';
    setTimeout(()=>{
      submitError.style.display='none';
    },3000);
    return false;
  }
}
