import {settings, select} from '../settings.js';

class AmountWidget {
  constructor(element){
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    //console.log(thisWidget.input.value);
    thisWidget.initAction();
      
    // console.log('AmountWidget' , thisWidget);
    //console.log('constructor arguments' , element);
  }

  getElements(element){
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
          
    //Add validation//
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      //settings.amountWidget.defaultValue = newValue;
      thisWidget.value = newValue;
        
      console.log('thisWidget.value' , thisWidget.value);
      //console.log('newValue' , newValue);
    } 
    thisWidget.input.value = thisWidget.value;
      
    console.log('thisWidget.input.value' , thisWidget.input.value);
    //console.log(thisWidget);
    /*else if (newValue < settings.amountWidget.defaultMin) {
        thisWidget.value = settings.amountWidget.defaultMin;
      } else if (newValue > settings.amountWidget.defaultMax) {
        thisWidget.value = settings.amountWidget.defaultMax;
      } else {
        thisWidget.value = newValue;
      }*/
      
    //thisWidget.input.value = settings.amountWidget.defaultValue;
    /*  thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });*/
    thisWidget.announce();
    //console.log('thisWidget.value:' , thisWidget.value);
  }

  initAction(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.input.value);
      console.log('test');
    });      
      
    thisWidget.linkDecrease.addEventListener('click' , function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click' , function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
  announce(){
    const thisWidget = this;
  
    const event = new CustomEvent('updated' , {
      bubbles: true});
    thisWidget.element.dispatchEvent(event);
  }
    
}
export default AmountWidget;