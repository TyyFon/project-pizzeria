import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initAction();
      
    // console.log('AmountWidget' , thisWidget);
    //console.log('constructor arguments' , element);
  }

  getElements(){
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    //console.log('thisWidget.dom.linkIncrease' , thisWidget.dom.linkIncrease);
    //console.log('thisWidget.value:' , thisWidget.value);
  }

  /*setValue(value){
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
          
    //Add validation//
    if(thisWidget.value !== newValue && !isNaN(newValue) && thisWidget.isValid(value)) {
      //settings.amountWidget.defaultValue = newValue;
      thisWidget.value = newValue;
        
      //console.log('thisWidget.value' , thisWidget.value);
      //console.log('newValue' , newValue);
      thisWidget.announce();
    } 
    thisWidget.renderValue();
      
   
    //console.log('thisWidget.value:' , thisWidget);
  }*/

  isValid(value){
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initAction(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.dom.input.value);
      //console.log('test');
    });      
      
    thisWidget.dom.linkDecrease.addEventListener('click' , function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click' , function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
 
    
}
export default AmountWidget;