import {settings, classNames, select, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initAction();
    //console.log('new Cart:' , thisCart);
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }
  initAction(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click' , function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated' , function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove' , function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit' , function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDom = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDom);
    thisCart.products.push(new CartProduct(menuProduct , generatedDom));
    //console.log('thisCart.product' , thisCart.product);
    thisCart.update();
  }
  update(){
    const thisCart = this;
    thisCart.deliveryFee = 0;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(const product of thisCart.products){
      thisCart.totalNumber = thisCart.totalNumber + parseInt(product.amount);
      //console.log('thisCart.totalNumber:' , thisCart.totalNumber , 'product.amount:' , typeof product.amount);
      //.log('product.amount:' , product.amount , '; thisCart.totalNumber:' , thisCart.totalNumber);
      thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
    }
    if(thisCart.totalNumber !== 0){
      thisCart.deliveryFee =settings.cart.defaultDeliveryFee;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    for (const totalPrice of thisCart.dom.totalPrice) {
      totalPrice.innerHTML = thisCart.totalPrice;

    }
  }
  remove(cartProduct) {
    const thisCart = this;
    cartProduct.dom.wrapper.remove();
    const removeProduct = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(removeProduct, 1);
    this.update();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      adress: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse' , parsedResponse);
      });
  }
}

export default Cart;