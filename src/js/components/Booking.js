import {templates, select, settings} from '../settings.js';
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
    console.log(urls);
    
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
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeats);
      });
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
  }

  initWidget(){
    const thisBooking = this;
    
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
    });
    
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.DatePicker();
    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated',function(){
      thisBooking.HourPicker();
    });
  }

}
export default Booking;