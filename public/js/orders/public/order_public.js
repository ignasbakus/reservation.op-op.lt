/* Global variables */
let eventDay;
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let firstMonthDay;
let Calendar = null;
let isEventDrop = false;
let reservationSent = false;
let isCancelButtonClicked = false;
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
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
        });

        values.trampolines = Trampolines;
        return values;
    },
    getTrampolines: function () {
        return Trampolines;
    },
};
let CalendarFunctions = {
    Calendar: {
        initialize: function () {
            this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
                initialDate: Dates.CalendarInitial,
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
                        if (reservationSent) {
                            CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        }
                    } else if (droppedMonth > currentMonth) {
                        this.next();
                        if (reservationSent) {
                            CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        }
                    }
                    isEventDrop = false;
                },
                dayMaxEvents: true,
                events: [],
                datesSet: function (info) {
                    let CalendarView = info.view
                    let firstDayMonth = new Date(CalendarView.currentStart)
                    let firstCalendarVisibleDate = new Date(info.start);
                    let lastCalendarVisibleDate = new Date(info.end);
                    firstDayMonth.setUTCHours(firstDayMonth.getUTCHours() + 3)
                    firstCalendarVisibleDate.setUTCHours(firstCalendarVisibleDate.getUTCHours() + 3);
                    lastCalendarVisibleDate.setUTCHours(lastCalendarVisibleDate.getUTCHours() + 3);
                    firstMonthDay = firstDayMonth.toISOString().split('T')[0]
                    firstVisibleDayOnCalendar = firstCalendarVisibleDate.toISOString().split('T')[0];
                    lastVisibleDayOnCalendar = lastCalendarVisibleDate.toISOString().split('T')[0];
                    if (!isEventDrop && !isCancelButtonClicked) {
                        if (reservationSent) {
                            CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                            TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement();
                        } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        }
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
                                    // AffectedTrampoline.rental_start = dropInfo.startStr;
                                    // AffectedTrampoline.rental_end = dropInfo.endStr;
                                    if (reservationSent) {
                                        TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement()
                                    }
                                }
                            });
                        });
                    } else {
                        Trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = draggedEvent.startStr;
                            Trampoline.rental_end = draggedEvent.endStr;
                            if (reservationSent) {
                                TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement()
                            }
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
        },
        goToInitialDates: function () {
            this.calendar.gotoDate(eventDay)
        },
    },
    addEvent: function (EventsToAdd) {
        EventsToAdd.forEach(function (Event) {
            CalendarFunctions.Calendar.calendar.addEvent(Event);
        });
    },
    updateEventsPublic: function (firstVisibleDay, lastVisibleDay, firstMonthDay) {
        $('#overlay').css('display', 'flex')
        $.ajax({
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            url: '/orders/public/order/public_calendar/get',
            method: 'POST',
            data: {
                trampoline_id: Variables.getTrampolines().map((t) => t.id),
                first_visible_day: firstVisibleDay,
                last_visible_day: lastVisibleDay,
                first_month_day: firstMonthDay
            },
        }).done((response) => {
            $('#overlay').hide();
            Occupied = response.Occupied;
            if (response.status) {
                this.Calendar.calendar.removeAllEvents();
                this.addEvent(Occupied);
                Availability = response.Availability;
                this.addEvent(Availability);
                Trampolines = response.Trampolines;
            }
        });
    },
    updateEventsPrivate: function (firstVisibleDay, lastVisibleDay, firstMonthDay, hasFailedUpdate = false) {
        $('#overlay').css('display', 'flex')
        $.ajax({
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            url: '/orders/admin/order/private_calendar/get',
            method: 'POST',
            data: {
                order_id: TrampolineOrder.UpdateOrder.OrderIdToUpdate,
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
                if (hasFailedUpdate) {
                    TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied;
                }
            }
        });
    },
};
let TrampolineOrder = {
    init: function () {
        this.FormSendOrder.init();
        this.UpdateOrder.init();
    },
    FormSendOrder: {
        init: function () {
            this.Event.init();
        },
        dataForm: {
            element: $('#sendOrderColumn form'),
        },
        Event: {
            OccupiedFromCreate: '',
            EventFromCreate: '',
            init: function () {
                $('#orderForm .orderSameDay').on('change', function () {
                    if (!$(this).is(':checked')) {
                        $('.showTrampolineSelect').show().click();
                    } else {
                        $('.showTrampolineSelect').hide();
                    }
                });
                $('.createOrder').on('click', (event) => {
                    event.preventDefault();
                    this.addOrder();
                });
            },
            addOrder: function () {
                let form_data = Variables.getOrderFormInputs();
                form_data.firstVisibleDay = firstVisibleDayOnCalendar;
                form_data.lastVisibleDay = lastVisibleDayOnCalendar;
                $('#overlay').css('display', 'flex')
                $.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    method: 'POST',
                    url: '/orders/public/order',
                    data: form_data,
                }).done((response) => {
                    $('#overlay').hide();
                    if (response.status === false) {
                        $('form input').removeClass('is-invalid');
                        Object.keys(response.failed_input).forEach(function (FailedInput) {
                            $('form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                            $('form input[name=' + FailedInput + ']').addClass('is-invalid');
                        });
                        if (response.failed_input.error) {
                            $('#failedAlertMessage').text(response.failed_input.error[0])
                            $('#failedAlert').show().css('display', 'flex');
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay)
                        }
                    }
                    if (response.status) {
                        $('form input').removeClass('is-invalid');
                        $('.infoBeforeSuccessfulOrder').css('display', 'none');
                        $('#columnAfterSentOrder').css('display', 'block');
                        $('#thankYouDiv').addClass(' d-flex flex-column justify-content-between');
                    }
                    TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied;
                    TrampolineOrder.FormSendOrder.Event.EventFromCreate = response.Events;
                    if (response.status) {
                        eventDay = response.Events[0].start
                        reservationSent = true;
                        TrampolineOrder.UpdateOrder.OrderIdToUpdate = response.OrderId;
                        CalendarFunctions.Calendar.calendar.removeAllEvents();
                        CalendarFunctions.addEvent(response.Occupied);
                        CalendarFunctions.addEvent(response.Events);
                        $('#thankYouDiv').html(response.view);
                    } else {
                        CalendarFunctions.Calendar.calendar.getEvents().forEach(function (event) {
                            if (event.extendedProps.type_custom === 'occ') {
                                event.remove();
                            } else {
                                event.setProp('backgroundColor', '#808000');
                                event.setProp('title', 'Neužsakyta');
                            }
                        });
                        CalendarFunctions.addEvent(Occupied);
                    }
                });
            },
        },
    },
    UpdateOrder: {
        init: function () {
            this.Event.init();
        },
        OrderIdToUpdate: 0,
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
                    CalendarFunctions.addEvent(TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate);
                    CalendarFunctions.addEvent(TrampolineOrder.FormSendOrder.Event.EventFromCreate);
                });
            },
            updateOrder: function () {
                $('#overlay').css('display', 'flex')
                let form_data = Variables.getOrderFormInputs();
                form_data.orderID = TrampolineOrder.UpdateOrder.OrderIdToUpdate;
                form_data.firstVisibleDay = firstVisibleDayOnCalendar;
                form_data.lastVisibleDay = lastVisibleDayOnCalendar;
                $.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    method: 'PUT',
                    url: '/orders/public/order',
                    data: form_data,
                }).done((response) => {
                    $('#overlay').hide();
                    if (response.status) {
                        eventDay = response.Event[0].start
                        $('#dateChangeAlertMessage').text('Rezervacijos dienos sėkmingai atnaujintos!')
                        $('#successfulDateChangeAlert').show().css('display', 'flex');
                        $('#confirmationContainer').css('display', 'none');
                        $('#thankYouDiv').html(response.view);
                        CalendarFunctions.Calendar.calendar.removeAllEvents();
                        CalendarFunctions.addEvent(response.Occupied);
                        CalendarFunctions.addEvent(response.Event);
                        TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied;
                        TrampolineOrder.FormSendOrder.Event.EventFromCreate = response.Event;
                    }
                    if (!response.status) {
                        $('#failedAlertMessage').text(response.failed_input.error[0])
                        $('#failedAlert').show().css('display', 'flex');
                        CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay, true)
                    }
                });
            },
            DisplayConfirmationElement: function () {
                $('#confirmationContainer').css('display', 'block');
            },
        },
    },
};

/* Document ready function */
$(document).ready(function () {
    console.log("/js/trampolines/public/order_public.js -> ready!");
    TrampolineOrder.init();
    CalendarFunctions.Calendar.initialize();
});
