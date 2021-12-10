import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();
    thisBooking.selectedTable = [];


  }
  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeats: [
        settings.db.repeatParam,
        endDateParam,
      ],
     
    };
    //console.log('getData params' , params);

    const urls = {
      booking:         settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent:   settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
      eventsRepeats:   settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeats.join('&'),
    };
    //console.log(urls);
    
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeats),
    ])
      .then(function (allResponse){
        const bookingResponse = allResponse[0];
        const eventsCurrenResponse = allResponse[1];
        const eventsRepeatsResponse = allResponse[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrenResponse.json(),
          eventsRepeatsResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeats]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeats);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeats);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeats){
    const thisBooking = this;
    thisBooking.booked = {};
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    
    for(let item of eventsRepeats){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }
 
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

   
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    //if(typeof thisBooking.booked[date][startHour] == 'undefined'){
    //  thisBooking.booked[date] = [];
    //}
   
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      
      thisBooking.booked[date][hourBlock].push(table);
    }
    //console.log('thisBooking.booked' , thisBooking.booked);
  }

  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    //console.log(thisBooking.hourPicker , thisBooking.hourPicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    
    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    for (let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(element);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables= thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);
    thisBooking.dom.phone = thisBooking.dom.form.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.form.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.form.querySelectorAll(select.booking.starters);
  }

  initWidget(){
    const thisBooking = this;
    
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    //thisBooking.dom.peopleAmount.addEventListener('updated', function(){
    //});
    
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    //thisBooking.dom.hoursAmount.addEventListener('updated', function(){
    //});

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    //thisBooking.dom.datePicker.addEventListener('updated', function(){
    //  thisBooking.DatePicker();
    //});

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    //thisBooking.dom.hourPicker.addEventListener('updated',function(){
    //  thisBooking.HourPicker();
    //});

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click',function(event){
      thisBooking.initTables(event);
    });
    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initTables(event){
    event.preventDefault();
    const thisBooking = this;
    const element = event.target;
    const clickedTable = element.classList.contains(classNames.booking.table);
    const bookedTable = element.classList.contains(classNames.booking.tableBooked);
    const selectedTable = element.classList.contains(classNames.booking.tableSelected);

    if (clickedTable && !bookedTable) {
      thisBooking.removeTableSelection();
      if(!selectedTable){
        event.target.classList.toggle(classNames.booking.tableSlected);
        thisBooking.tableSelected = parseInt(
          element.getAttribute('data-table')
          
        );
      }
    }
  }
  removeTableSelection(){
    const thisBooking = this;
    for(const table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);

    }
    thisBooking.selectedTable = [];
  }  
  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    if(thisBooking.tableSelected != null){
      if(thisBooking.tableSelected.length == 0) {
        thisBooking.tableSelected = null;
      }
    }
    let payload = {};
    payload.date = thisBooking.datePicker.value;
    payload.hour = thisBooking.hourPicker.value;
    payload.table = thisBooking.tableSelected;
    payload.duration = thisBooking.hoursAmount.value;
    payload.peopleAmount = thisBooking.peopleAmount.value;
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;
    payload.starters = [];
    for (let starter of thisBooking.dom.starters){
      if(starter.checked){
        payload.starters.push(starter.value);
      }
    }
    thisBooking.send(url, payload);

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);


  }
  send(url, payload){
    const options = {
      method: 'POST',
      headers:{
        'Content-type': 'application/json'
      },
      body: JSON.stringify(payload),
    };
    fetch(url,options);
    console.log(url,options);
  }
}



export default Booking;