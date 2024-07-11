let eventDay;
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let firstMonthDay;
let Trampolines;
let Calendar = null;
let isEventDrop = false;
let modalPopulated = false;
let isCancelButtonClicked = false;
let today = new Date();
today.setHours(0, 0, 0, 0);
today.setHours(today.getHours() + 3);
today = today.toISOString().split('T')[0];

let Variables = {
    orderFormInput: [
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity',
        'customerDeliveryPostCode', 'customerDeliveryAddress', 'customerDeliveryTime'
    ],
    client: {},
    clientAddress: {},
    clientTime: {},
    getOrderFormInputs: function () {
        let values = {};
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
        });

        values.trampolines = Trampolines;

        // Add client and address details
        values.customerName = this.client.name;
        values.customerSurname = this.client.surname;
        values.customerPhoneNumber = this.client.phone;
        values.customerEmail = this.client.email;
        values.customerDeliveryCity = this.clientAddress.address_town;
        values.customerDeliveryPostCode = this.clientAddress.address_postcode;
        values.customerDeliveryAddress = this.clientAddress.address_street;
        values.customerDeliveryTime = this.clientTime.delivery_time;

        return values;
    },
    getTrampolines: function () {
        return Trampolines;
    },
    setClientDetails: function (client) {
        this.client = client;
        $('#orderForm input[name="customerName"]').val(client.name);
        $('#orderForm input[name="customerSurname"]').val(client.surname);
        $('#orderForm input[name="customerPhoneNumber"]').val(client.phone);
        $('#orderForm input[name="customerEmail"]').val(client.email);
    },
    setClientAddressDetails: function (address) {
        this.clientAddress = address;
        $('#orderForm input[name="customerDeliveryCity"]').val(address.address_town);
        $('#orderForm input[name="customerDeliveryPostCode"]').val(address.address_postcode);
        $('#orderForm input[name="customerDeliveryAddress"]').val(address.address_street);
    },
    setDeliveryTimeDetails: function (time) {
        this.clientTime = time;
        $('#orderForm input[name="customerDeliveryTime"]').val(time.delivery_time);
    },
    getDeliveryTime: function () {
        return this.clientTime.delivery_time;
    },
    populateOrderFormValues: function () {
        return {
            customerName: this.client.name,
            customerSurname: this.client.surname,
            customerPhoneNumber: this.client.phone,
            customerEmail: this.client.email,
            customerDeliveryCity: this.clientAddress.address_town,
            customerDeliveryPostCode: this.clientAddress.address_postcode,
            customerDeliveryAddress: this.clientAddress.address_street,
            trampolines: this.getTrampolines()
        };
    }
};

let CalendarFunctions = {
    Calendar: {
        initialize: function (InitialDate) {
            this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
                initialDate: InitialDate,
                locale: 'lt',
                editable: true,
                selectable: true,
                validRange: {
                    start: today,
                },
                eventDrop: function (dropInfo) {
                    isEventDrop = true;
                    let droppedDate = dropInfo.event.start;
                    let currentMonth = this.getDate().getMonth();
                    let droppedMonth = droppedDate.getMonth();
                    if (droppedMonth < currentMonth) {
                        this.prev();
                    } else if (droppedMonth > currentMonth) {
                        this.next();
                    }
                    isEventDrop = false;
                },
                dayMaxEvents: true,
                events: [],
                datesSet: function (info) {
                    let CalendarView = info.view;
                    let firstDayMonth = new Date(CalendarView.currentStart);
                    let firstCalendarVisibleDate = new Date(info.start);
                    let lastCalendarVisibleDate = new Date(info.end);
                    firstDayMonth.setUTCHours(firstDayMonth.getUTCHours() + 3);
                    firstCalendarVisibleDate.setUTCHours(firstCalendarVisibleDate.getUTCHours() + 3);
                    lastCalendarVisibleDate.setUTCHours(lastCalendarVisibleDate.getUTCHours() + 3);
                    firstMonthDay = firstDayMonth.toISOString().split('T')[0];
                    firstVisibleDayOnCalendar = firstCalendarVisibleDate.toISOString().split('T')[0];
                    lastVisibleDayOnCalendar = lastCalendarVisibleDate.toISOString().split('T')[0];
                    if (!isCancelButtonClicked && modalPopulated) {
                        CalendarFunctions.updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement();
                    }
                    isEventDrop = false;
                    isCancelButtonClicked = false;
                },
                eventAllow: function (dropInfo, draggedEvent) {
                    let CouldBeDropped = true;
                    let dropStart = new Date(dropInfo.startStr);
                    let dropEnd = new Date(dropInfo.endStr);
                    let draggedEndMinusOneHour = new Date(draggedEvent.endStr);
                    let dropEndMinusOneHour = new Date(dropInfo.endStr);
                    dropEndMinusOneHour.setDate(dropEndMinusOneHour.getDate() - 1);
                    draggedEndMinusOneHour.setDate(draggedEndMinusOneHour.getDate() - 1);
                    dropEndMinusOneHour.setUTCHours(dropEndMinusOneHour.getUTCHours() + 3);
                    draggedEndMinusOneHour.setUTCHours(draggedEndMinusOneHour.getUTCHours() + 3);
                    let dropEndForDisplay = dropEndMinusOneHour.toISOString().split('T')[0];
                    let draggedEndForDisplay = draggedEndMinusOneHour.toISOString().split('T')[0];

                    Occupied.forEach(function (Occupation) {
                        let OccupationStart = new Date(Occupation.start);
                        let OccupationEnd = new Date(Occupation.end);
                        if ((dropStart >= OccupationStart && dropStart < OccupationEnd) ||
                            (dropEnd > OccupationStart && dropEnd <= OccupationEnd) ||
                            (dropStart <= OccupationStart && dropEnd >= OccupationEnd)) {
                            CouldBeDropped = false;
                            return false;
                        }
                    });
                    if (CouldBeDropped) {
                        Trampolines.forEach(function (Trampoline) {
                            draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline) {
                                if (Trampoline.id === AffectedTrampoline.id) {
                                    Trampoline.rental_start = dropInfo.startStr;
                                    Trampoline.rental_end = dropInfo.endStr;
                                    TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement();
                                }
                            });
                        });
                    } else {
                        Trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = draggedEvent.startStr;
                            Trampoline.rental_end = draggedEvent.endStr;
                            TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement();
                        });
                    }
                    return CouldBeDropped;
                },
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                },
            });
            this.calendar.render();
            TrampolineOrder.UpdateOrder.getDataForModal();
        },
        goToInitialDates: function () {
            this.calendar.gotoDate(eventDay);
        },
    },
    addEvent: function (EventsToAdd) {
        EventsToAdd.forEach(function (Event) {
            CalendarFunctions.Calendar.calendar.addEvent(Event);
        });
    },
    updateEvents: function (firstVisibleDay, lastVisibleDay, firstMonthDay, hasFailedUpdate = false) {
        $('#overlay').css('display', 'flex');
        $.ajax({
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            url: '/orders/public/order/private_calendar/get',
            method: 'POST',
            data: {
                order_id: Order_id,
                first_visible_day: firstVisibleDay,
                last_visible_day: lastVisibleDay,
                first_month_day: firstMonthDay
            },
        }).done((response) => {
            $('#overlay').hide();
            if (response.status) {
                Occupied = response.Occupied;
                this.Calendar.calendar.removeAllEvents();
                this.addEvent(response.Occupied);
                this.addEvent(response.Availability);
                Trampolines = response.Trampolines;
            }
        });
    },
};

let TrampolineOrder = {
    init: function () {
        $('#thankYouDiv').html(view);
        this.UpdateOrder.init();
        this.CancelOrderModal.init()
        Variables.setClientDetails(Client);
        Variables.setClientAddressDetails(ClientAddress);
        Variables.setDeliveryTimeDetails(DeliveryTime);
    },
    UpdateOrder: {
        OccupiedWhenCancelled: '',
        EventWhenCancelled: '',
        init: function () {
            this.Event.init();
            this.getInitialDatesCalendar();
        },
        getInitialDatesCalendar: function () {
            $('#overlay').css('display', 'flex');
            $.ajax({
                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                dataType: 'json',
                method: "GET",
                url: "/orders/public/order/getCalendarInitial",
                data: {
                    order_id: Order_id,
                }
            }).done((response) => {
                $('#overlay').hide();
                if (response.status) {
                    CalendarFunctions.Calendar.initialize(response.Dates.CalendarInitial);
                } else {
                    console.error("Failed to fetch data: ", response.message);
                }
            }).fail((jqXHR) => {
                $('#overlay').hide();
                Orders.Modals.updateOrder.element.hide();
                let errorMessage = 'An error occurred';
                if (jqXHR.responseJSON) {
                    errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseJSON.message;
                } else if (jqXHR.responseText) {
                    errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseText;
                }
                $('#failedAlertMessage').text(errorMessage);
                $('#failedAlert').show().css('display', 'flex');
            });
        },
        getDataForModal: function () {
            $('#overlay').css('display', 'flex');
            $.ajax({
                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                dataType: 'json',
                method: "GET",
                url: "/orders/public/order/getOrderUpdateData",
                data: {
                    order_id: Order_id,
                    target_start_date: firstVisibleDayOnCalendar,
                    target_end_date: lastVisibleDayOnCalendar
                }
            }).done((response) => {
                $('#overlay').hide();
                if (response.status) {
                    this.OccupiedWhenCancelled = response.Occupied;
                    this.EventWhenCancelled = response.Events;
                    eventDay = response.Events[0].start;
                    Occupied = response.Occupied;
                    Trampolines = response.Trampolines;
                    CalendarFunctions.addEvent(response.Occupied);
                    CalendarFunctions.addEvent(response.Events);
                    modalPopulated = true;
                }
                if (!response.status){
                    // CalendarFunctions.Calendar.goToInitialDates();
                    // CalendarFunctions.Calendar.calendar.removeAllEvents();
                    // CalendarFunctions.addEvent(TrampolineOrder.UpdateOrder.OccupiedWhenCancelled);
                    // CalendarFunctions.addEvent(TrampolineOrder.UpdateOrder.EventWhenCancelled);
                }
            }).fail((jqXHR) => {
                $('#overlay').hide();
                Orders.Modals.updateOrder.element.hide();
                let errorMessage = 'An error occurred';
                if (jqXHR.responseJSON) {
                    errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseJSON.message;
                } else if (jqXHR.responseText) {
                    errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseText;
                }
                $('#failedAlertMessage').text(errorMessage);
                $('#failedAlert').show().css('display', 'flex');
            });
        },
        Event: {
            init: function () {
                $('#confirmationContainer .confirmDatesChange').on('click', (event) => {
                    event.stopPropagation();
                    this.updateOrder();
                });
                $('#confirmationContainer .confirmationClose').on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    isCancelButtonClicked = true;
                    $('#confirmationContainer').css('display', 'none');
                    CalendarFunctions.Calendar.goToInitialDates();
                    CalendarFunctions.Calendar.calendar.removeAllEvents();
                    CalendarFunctions.addEvent(TrampolineOrder.UpdateOrder.OccupiedWhenCancelled);
                    CalendarFunctions.addEvent(TrampolineOrder.UpdateOrder.EventWhenCancelled);
                });
            },
            updateOrder: function () {
                $('#overlay').css('display', 'flex');
                let form_data = Variables.getOrderFormInputs();
                form_data.orderID = Order_id;
                form_data.firstVisibleDay = firstVisibleDayOnCalendar;
                form_data.lastVisibleDay = lastVisibleDayOnCalendar;
                form_data.delivery_time = Variables.getDeliveryTime(); // Add delivery_time
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    method: 'PUT',
                    url: '/orders/public/order',
                    data: form_data,
                }).done((response) => {
                    $('#overlay').hide();
                    if (response.status) {
                        eventDay = response.Event[0].start;
                        $('#dateChangeAlertMessage').text('Rezervacijos dienos sėkmingai atnaujintos!');
                        $('#successfulDateChangeAlert').show().css('display', 'flex');
                        $('#confirmationContainer').css('display', 'none');
                        $('#thankYouDiv').html(response.view);
                        CalendarFunctions.Calendar.calendar.removeAllEvents();
                        CalendarFunctions.addEvent(response.Occupied);
                        CalendarFunctions.addEvent(response.Event);
                        TrampolineOrder.UpdateOrder.OccupiedWhenCancelled = response.Occupied;
                        TrampolineOrder.UpdateOrder.EventWhenCancelled = response.Event;
                    }
                    if (!response.status) {
                        $('#failedAlertMessage').text(response.failed_input.error[0]);
                        $('#failedAlert').show().css('display', 'flex');
                        CalendarFunctions.Calendar.calendar.removeAllEvents();
                        CalendarFunctions.Calendar.goToInitialDates();
                        $('#confirmationContainer').css('display', 'none');
                    }
                });
            },
            DisplayConfirmationElement: function () {
                $('#confirmationContainer').css('display', 'block');
            },
        },
    },
    CancelOrderModal: {
        init: function () {
            this.Event.init()
        },
        element: new bootstrap.Modal('#cancelOrderModal'),
        Event: {
            init: function () {
                $('#cancelOrderModal .cancelOrderModalButton').on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.cancelOrder();
                });
            },
            cancelOrder: function () {
                $('#overlay').css('display', 'flex');
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    method: 'PUT',
                    url: '/orders/public/order/view/{order_number}',
                    data: {
                        order_id: Order_id
                    },
                }).done((response) => {
                    $('#overlay').hide();
                    TrampolineOrder.CancelOrderModal.element.hide()
                    if (response.status) {
                        $('#content-wrap').replaceWith($(response.view).find('#content-wrap'));
                    }
                    if (!response.status) {
                        console.log('patekom')
                        $('#failedAlertMessage').text(response.failed_inputs.error[0])
                        $('#failedAlert').show().css('display', 'flex');
                    }
                })
            }
        }
    },
}

$(document).ready(function () {
    console.log("/js/trampolines/public/order_public_via_email.js -> ready!");
    TrampolineOrder.init();
});
