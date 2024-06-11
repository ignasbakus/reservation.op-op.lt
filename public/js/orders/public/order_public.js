/* Global variables */
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let Calendar = null;
let isEventDrop = false;
let reservationSent = false;
let today = new Date();
today.setHours(0, 0, 0, 0);
today.setHours(today.getHours() + 3);
today = today.toISOString().split('T')[0];

/* JS classes */
let Variables = {
    orderFormInput: [
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity', 'customerDeliveryPostCode', 'customerDeliveryAddress'
    ],
    getOrderFormInputs: function () {
        let values = {};
        console.log('Trampolines => ', Trampolines)
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
        });

        values.trampolines = Trampolines;
        console.log('values => ', values)
        console.log('saved values => ', this.formInputValues)
        return values;
    },
    getTrampolines: function () {
        return Trampolines
    },
}
let CalendarFunctions = {
    Calendar: {
        initialFirstCalendarDay: 0,
        initialLastCalendarDay: 0,
        initialDatesSet: false,
        initialize: function () {
            this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
                initialDate: Dates.CalendarInitial,
                locale: 'lt',
                editable: true,
                selectable: true,
                validRange: {
                    start: today
                },
                eventDrop: function (dropInfo) {
                    isEventDrop = true
                    let droppedDate = dropInfo.event.start;
                    let currentMonth = this.getDate().getMonth();
                    let droppedMonth = droppedDate.getMonth();
                    console.log('current month =>', currentMonth)
                    console.log('dropped month =>', droppedMonth)
                    if (droppedMonth < currentMonth) {
                        this.prev();
                        if (reservationSent) {
                            CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
                        } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
                        }
                    } else if (droppedMonth > currentMonth) {
                        this.next();
                        if (reservationSent) {
                            CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
                        } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
                        }
                    }
                    isEventDrop = false
                },
                dayMaxEvents: true,
                events: [],
                datesSet: function (info) {
                    let firstCalendarVisibleDate = info.start;
                    let lastCalendarVisibleDate = info.end;
                    firstCalendarVisibleDate.setUTCHours(firstCalendarVisibleDate.getUTCHours() + 3);
                    lastCalendarVisibleDate.setUTCHours(lastCalendarVisibleDate.getUTCHours() + 3);
                    firstVisibleDayOnCalendar = firstCalendarVisibleDate.toISOString().split('T')[0];
                    lastVisibleDayOnCalendar = lastCalendarVisibleDate.toISOString().split('T')[0];
                    console.log('First calendar day => ', firstVisibleDayOnCalendar);
                    console.log('Last calendar day => ', lastVisibleDayOnCalendar);
                    if (!CalendarFunctions.Calendar.initialDatesSet) {
                        CalendarFunctions.Calendar.initialFirstCalendarDay = firstVisibleDayOnCalendar;
                        CalendarFunctions.Calendar.initialLastCalendarDay = lastVisibleDayOnCalendar;
                        CalendarFunctions.Calendar.initialDatesSet = true;
                    }
                    if (!isEventDrop) {
                        if (reservationSent) {
                            CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar);
                        } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar);
                        }
                    }
                    isEventDrop = false;
                },
                eventAllow: function (dropInfo, draggedEvent) {
                    let CouldBeDropped = true;
                    let dropStart = new Date(dropInfo.startStr);
                    let dropEnd = new Date(dropInfo.endStr);
                    let draggedEndMinusOneHour = new Date(draggedEvent.endStr)
                    let dropEndMinusOneHour = new Date(dropInfo.endStr)
                    dropEndMinusOneHour.setDate(dropEndMinusOneHour.getDate() - 1)
                    draggedEndMinusOneHour.setDate(draggedEndMinusOneHour.getDate() - 1)
                    dropEndMinusOneHour.setUTCHours(dropEndMinusOneHour.getUTCHours() + 3)
                    draggedEndMinusOneHour.setUTCHours(draggedEndMinusOneHour.getUTCHours() + 3)
                    let dropEndForDisplay = dropEndMinusOneHour.toISOString().split('T')[0]
                    let draggedEndForDisplay = draggedEndMinusOneHour.toISOString().split('T')[0]

                    Occupied.forEach(function (Occupation) {
                        let OccupationStart = new Date(Occupation.start);
                        let OccupationEnd = new Date(Occupation.end);
                        if ((dropStart >= OccupationStart && dropStart < OccupationEnd) || (dropEnd > OccupationStart && dropEnd <= OccupationEnd) || (dropStart <= OccupationStart && dropEnd >= OccupationEnd)) {
                            CouldBeDropped = false;
                            return false;
                        }
                    });
                    if (CouldBeDropped) {
                        Trampolines.forEach(function (Trampoline) {
                            // console.log('dragged event trampolines before = ', draggedEvent.extendedProps.trampolines)
                            draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline) {
                                if (Trampoline.id === AffectedTrampoline.id) {
                                    console.log('drop info startStr = ', dropInfo.startStr)
                                    console.log('drop info endSTr = ', dropInfo.endStr)
                                    Trampoline.rental_start = dropInfo.startStr
                                    Trampoline.rental_end = dropInfo.endStr
                                    AffectedTrampoline.rental_start = dropInfo.startStr
                                    AffectedTrampoline.rental_end = dropInfo.endStr
                                    console.log('Trampoline rental start => ', Trampoline.rental_start)
                                    console.log('Trampoline rental end => ', Trampoline.rental_end)
                                    if (reservationSent) {
                                        TrampolineOrder.FormSendOrder.Event.DisplayConfirmationElement(dropInfo.startStr, dropEndForDisplay)
                                    }
                                }
                            })
                        })
                        console.log('dragged event trampolines after = ', draggedEvent.extendedProps.trampolines)
                    } else {
                        // console.log('pasiekem')
                        Trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = draggedEvent.startStr
                            Trampoline.rental_end = draggedEvent.endStr
                            // console.log('draggedevent endstr = ', draggedEvent.endStr)
                            if (reservationSent) {
                                TrampolineOrder.FormSendOrder.Event.DisplayConfirmationElement(draggedEvent.startStr, draggedEndForDisplay)
                            }
                        })
                    }
                    return CouldBeDropped;
                },
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }
            });
            this.calendar.render();
        },
        goToInitialDates: function () {
            this.calendar.gotoDate(this.initialFirstCalendarDay);
        }
    },
    addEvent: function (EventsToAdd) {
        EventsToAdd.forEach(function (Event) {
            // CalendarFunctions.addEvent(Event)
            CalendarFunctions.Calendar.calendar.addEvent(Event)
        });
    },
    updateEventsPublic: function (targetStartDate, targetEndDate) {
        $.ajax({
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            url: '/orders/public/order/public_calendar/get',
            method: 'POST',
            data: {
                trampoline_id: Variables.getTrampolines().map(t => t.id),
                target_start_date: targetStartDate,
                target_end_date: targetEndDate
            },
        }).done((response) => {
            Occupied = response.Occupied
            if (response.status) {
                this.Calendar.calendar.removeAllEvents()
                // Calendar.removeAllEvents()
                this.addEvent(Occupied)
                Availability = response.Availability
                this.addEvent(Availability)
                Trampolines = response.Trampolines
            }
        }).always((instance) => {
            // console.log("always => response : ", instance);
        });
    },
    updateEventsPrivate: function (targetStartDate, targetEndDate) {
        $.ajax({
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            url: '/orders/admin/order/private_calendar/get',
            method: 'POST',
            data: {
                order_id: TrampolineOrder.UpdateOrder.OrderIdToUpdate,
                target_start_date: targetStartDate,
                target_end_date: targetEndDate
            },
        }).done((response) => {
            if (response.status) {
                this.Calendar.calendar.removeAllEvents()
                // @todo Sumazinti tarpa
                // @todo Kad confirmation boxas neatsirastu antra karta
                // console.log(response.Availability)
                // TrampolineOrder.FormSendOrder.Event.DisplayConfirmationElement(response.Availability[0].start, response.Availability[0].end)
                this.addEvent(response.Occupied);
                this.addEvent(response.Availability);
                Trampolines = response.Trampolines
            }
        }).always((instance) => {
            // console.log("always => response : ", instance);
        });
    },
};
let TrampolineOrder = {
    init: function () {
        this.FormSendOrder.init()
        this.UpdateOrder.init()
    },
    FormSendOrder: {
        init: function () {
            this.Event.init()
        },
        dataForm: {
            element: $('#sendOrderColumn form')
        },
        Event: {
            OccupiedFromCreate: '', /* Sitaip neveiks, jeigu atnaujinsim i kita menesi diena */
            EventFromCreate: '', /* Sitaip neveiks, jeigu atnaujinsim i kita menesi diena */
            init: function () {
                $('#orderForm .orderSameDay').on('change', function () {
                    if (!$(this).is(':checked')) {
                        $('.showTrampolineSelect').show().click()
                    } else {
                        $('.showTrampolineSelect').hide();
                    }
                })
                $('.createOrder').on('click', (event) => {
                    event.preventDefault();
                    this.addOrder()
                })
            },
            addOrder: function () {
                let form_data = Variables.getOrderFormInputs()
                form_data.firstVisibleDay = firstVisibleDayOnCalendar
                form_data.lastVisibleDay = lastVisibleDayOnCalendar
                console.log('form data PODT => ', form_data)
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    method: "POST",
                    url: "/orders/public/order",
                    data: form_data
                }).done((response) => {
                    if (response.status === false) {
                        $('form input').removeClass('is-invalid');
                        Object.keys(response.failed_input).forEach(function (FailedInput) {
                            console.log('Failed input =>', FailedInput)
                            $('form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                            $('form input[name=' + FailedInput + ']').addClass('is-invalid');
                        })
                    }
                    if (response.status) {
                        // $('form input[type=text], form input[type=number], #createTrampolineModal form textarea').val('');
                        $('form input').removeClass('is-invalid');
                        $('.infoBeforeSuccessfulOrder').css('display', 'none');
                        $('#columnAfterSentOrder').css('display', 'block')
                        $('#thankYouDiv').addClass(' d-flex flex-column justify-content-between')
                    }
                    TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied
                    TrampolineOrder.FormSendOrder.Event.EventFromCreate = response.Events
                    console.log('Occupied create =>', Occupied)
                    if (response.status) {
                        reservationSent = true
                        TrampolineOrder.UpdateOrder.OrderIdToUpdate = response.OrderId
                        CalendarFunctions.Calendar.calendar.removeAllEvents()
                        CalendarFunctions.addEvent(response.Occupied)
                        CalendarFunctions.addEvent(response.Events)
                        $('#thankYouDiv').html(response.view)
                    } else {
                        CalendarFunctions.Calendar.calendar.getEvents().forEach(function (event) {
                            if (event.extendedProps.type_custom === 'occ') {
                                event.remove();
                            } else {
                                event.setProp('backgroundColor', '#808000')
                                event.setProp('title', 'Neužsakyta')
                            }
                        });
                        CalendarFunctions.addEvent(Occupied)
                    }
                });
            },
            DisplayConfirmationElement: function (startDate, endDate) {
                $('#confirmationContainer').css('display', 'block');
                // $('#footer').removeClass('fixed-bottom').addClass('sticky-bottom')
                $('.dates').html('<p><strong>Pradžia:</strong> ' + startDate + '</p><p><strong>Pabaiga:</strong> ' + endDate + '</p>');
            }
        }
    },
    UpdateOrder: {
        init: function () {
            this.Event.init()
        },
        OrderIdToUpdate: 0,
        Event: {
            init: function () {
                $('#confirmationContainer .confirmDatesChange').on('click', (event) => {
                    event.stopPropagation()
                    this.updateOrder()
                })
                $('#confirmationContainer .confirmationClose').on('click', (event) => {
                    event.stopPropagation()
                    $('#confirmationContainer').css('display', 'none');
                    CalendarFunctions.Calendar.goToInitialDates();
                    CalendarFunctions.Calendar.calendar.removeAllEvents()
                    CalendarFunctions.addEvent(TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate)
                    CalendarFunctions.addEvent(TrampolineOrder.FormSendOrder.Event.EventFromCreate)
                })
            },
            updateOrder: function () {
                let form_data = Variables.getOrderFormInputs()
                form_data.orderID = TrampolineOrder.UpdateOrder.OrderIdToUpdate
                form_data.firstVisibleDay = firstVisibleDayOnCalendar
                form_data.lastVisibleDay = lastVisibleDayOnCalendar
                console.log('form data PUT => ', form_data)
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    method: "PUT",
                    url: "/orders/public/order",
                    data: form_data
                }).done((response) => {
                    if (response.status) {
                        $('#confirmationContainer').css('display', 'none');
                        // $('#footer').removeClass('sticky-bottom').addClass('fixed-bottom')
                        $('#thankYouDiv').html(response.view)
                        CalendarFunctions.Calendar.calendar.removeAllEvents()
                        CalendarFunctions.addEvent(response.Occupied)
                        CalendarFunctions.addEvent(response.Event)
                        TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied
                        TrampolineOrder.FormSendOrder.Event.EventFromCreate = response.Event
                    }
                })
            }
        }
    }
}

/* Document ready function */
$(document).ready(function () {
    console.log("/js/trampolines/public/order_public.js -> ready!");
    TrampolineOrder.init()
    CalendarFunctions.Calendar.initialize();
});
