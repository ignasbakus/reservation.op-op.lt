/* Global variables */
let eventDay;
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let firstMonthDay;
let Calendar = null;
let isEventDrop = false;
// let reservationSent = false;
let isFirstLoad = true; // Add flag for initial load
let isNavigating = false; // Add flag for navigation
let skippedMonth = null; // Add this global variable to track the skipped month
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
                        // if (reservationSent) {
                        //     CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        // } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        // }
                    } else if (droppedMonth > currentMonth) {
                        this.next();
                        // if (reservationSent) {
                        //     CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        // } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        // }
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

                    console.log('First Month Day: ', firstMonthDay);
                    console.log('First Visible Day: ', firstVisibleDayOnCalendar);
                    console.log('Last Visible Day: ', lastVisibleDayOnCalendar);

                    if (!isEventDrop && !isCancelButtonClicked && !isNavigating) {
                        // if (reservationSent) {
                            // CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                            // TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement();
                        // } else {
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        // }
                    }

                    isEventDrop = false;
                    isCancelButtonClicked = false;

                    // Disable navigation to the skipped month
                    if (skippedMonth) {
                        let prevButton = document.querySelector('.fc-prev-button');
                        let prevMonth = new Date(CalendarView.currentStart);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);

                        prevButton.disabled = prevMonth.getMonth() === skippedMonth.getMonth() && prevMonth.getFullYear() === skippedMonth.getFullYear();
                    }
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
                                    // if (reservationSent) {
                                    //     TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement();
                                    // }
                                }
                            });
                        });
                    } else {
                        Trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = draggedEvent.startStr;
                            Trampoline.rental_end = draggedEvent.endStr;
                            // if (reservationSent) {
                            //     TrampolineOrder.UpdateOrder.Event.DisplayConfirmationElement();
                            // }
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
            this.calendar.gotoDate(eventDay);
        },
    },
    addEvent: function (EventsToAdd) {
        console.log("Adding Events: ", EventsToAdd); // Log the events being added
        EventsToAdd.forEach(function (Event) {
            CalendarFunctions.Calendar.calendar.addEvent(Event);
        });
    },
    updateEventsPublic: function (firstVisibleDay, lastVisibleDay, firstMonthDay) {
        $('#overlay').css('display', 'flex');
        $.ajax({
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
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
                console.log('Availability = ', response.Availability);
                console.log('Occupied = ', Occupied);
                this.Calendar.calendar.removeAllEvents();
                this.addEvent(Occupied);
                Availability = response.Availability;
                this.addEvent(Availability);
                Trampolines = response.Trampolines;

                // Check if the first available date is in a different month and navigate accordingly
                if (isFirstLoad && Availability.length > 0) {
                    let firstAvailableDate = new Date(Availability[0].start);
                    let currentMonth = new Date(firstVisibleDay).getMonth();
                    let availableMonth = firstAvailableDate.getMonth();
                    if (availableMonth > currentMonth) {
                        isNavigating = true; // Set navigating flag to true
                        this.Calendar.calendar.next();
                        // Recalculate the dates after navigation
                        let newCalendarView = this.Calendar.calendar.view;
                        let newFirstDayMonth = new Date(newCalendarView.currentStart);
                        newFirstDayMonth.setUTCHours(newFirstDayMonth.getUTCHours() + 3);
                        firstMonthDay = newFirstDayMonth.toISOString().split('T')[0];

                        this.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        isNavigating = false; // Reset navigating flag after update
                    }
                    isFirstLoad = false; // Set flag to false after first load

                    // Set skippedMonth to prevent navigation to this month
                    skippedMonth = new Date(firstVisibleDayOnCalendar);
                }
            }
        });
    },
    // updateEventsPrivate: function (firstVisibleDay, lastVisibleDay, firstMonthDay, hasFailedUpdate = false) {
    //     $('#overlay').css('display', 'flex');
    //     $.ajax({
    //         headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
    //         url: '/orders/admin/order/private_calendar/get',
    //         method: 'POST',
    //         data: {
    //             order_id: TrampolineOrder.UpdateOrder.OrderIdToUpdate,
    //             first_visible_day: firstVisibleDay,
    //             last_visible_day: lastVisibleDay,
    //             first_month_day: firstMonthDay
    //         },
    //     }).done((response) => {
    //         $('#overlay').hide();
    //         if (response.status) {
    //             Occupied = response.Occupied;
    //             this.Calendar.calendar.removeAllEvents();
    //             this.addEvent(response.Occupied);
    //             this.addEvent(response.Availability);
    //             Trampolines = response.Trampolines;
    //             if (hasFailedUpdate) {
    //                 TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied;
    //             }
    //         }
    //     });
    // },
};

let TrampolineOrder = {
    init: function () {
        this.FormSendOrder.init();
        // this.UpdateOrder.init();
        this.ViewOrderModal.init()
        this.FormSendOrder.checkFormValidity(); // Initial check
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
                $('#orderForm .viewOrderButton').on('click', function (event) {
                    event.preventDefault(); // Prevent the default form submission behavior
                    TrampolineOrder.ViewOrderModal.element.show();
                });
                $('#orderForm input, #orderForm select').on('input change', function () {
                    TrampolineOrder.FormSendOrder.checkFormValidity();
                });
            },
            addOrder: function () {
                let form_data = Variables.getOrderFormInputs();
                form_data.firstVisibleDay = firstVisibleDayOnCalendar;
                form_data.lastVisibleDay = lastVisibleDayOnCalendar;
                $('#overlay').css('display', 'flex');
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    method: 'POST',
                    url: '/orders/public/order',
                    data: form_data,
                }).done((response) => {
                    $('#overlay').hide();
                    if (response.status === false) {
                        TrampolineOrder.ViewOrderModal.element.hide()
                        $('form input').removeClass('is-invalid');
                        Object.keys(response.failed_input).forEach(function (FailedInput) {
                            $('form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                            $('form input[name=' + FailedInput + ']').addClass('is-invalid');
                        });
                        if (response.failed_input.error) {
                            $('#failedAlertMessage').text(response.failed_input.error[0]);
                            $('#failedAlert').show().css('display', 'flex');
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        }
                    }
                    // if (response.status) {
                    //     // $('form input').removeClass('is-invalid');
                    //     // $('.infoBeforeSuccessfulOrder').css('display', 'none');
                    //     // $('#columnAfterSentOrder').css('display', 'block');
                    //     // $('#thankYouDiv').addClass(' d-flex flex-column justify-content-between');
                    // }
                    // TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied;
                    // TrampolineOrder.FormSendOrder.Event.EventFromCreate = response.Events;
                    if (response.status) {
                        // TrampolineOrder.PaymentLink.OrderIdToCreateLinkFor = response.OrderId;
                        window.location.href = response.PaymentLink
                        // eventDay = response.Events[0].start;
                        // reservationSent = true;
                        // CalendarFunctions.Calendar.calendar.removeAllEvents();
                        // CalendarFunctions.addEvent(response.Occupied);
                        // CalendarFunctions.addEvent(response.Events);
                        // $('#thankYouDiv').html(response.view);
                        // TrampolineOrder.PaymentLink.init()
                        // TrampolineOrder.CancelOrder.init();
                        // } else {
                        //     CalendarFunctions.Calendar.calendar.getEvents().forEach(function (event) {
                        //         if (event.extendedProps.type_custom === 'occ') {
                        //             event.remove();
                        //         } else {
                        //             event.setProp('backgroundColor', '#808000');
                        //             event.setProp('title', 'Neužsakyta');
                        //         }
                        //     });
                        //     CalendarFunctions.addEvent(Occupied);
                    }
                });
            },
        },
        checkFormValidity: function () {
            let isValid = true;
            $('#orderForm input[required]').each(function () {
                if ($(this).val().trim() === '') {
                    isValid = false;
                    return false;
                }
            });
            $('#viewOrderButton').prop('disabled', !isValid);
        }
    },
    // UpdateOrder: {
    //     init: function () {
    //         this.Event.init();
    //     },
    //     OrderIdToUpdate: 0,
    //     Event: {
    //         init: function () {
    //             $('#confirmationContainer .confirmDatesChange').on('click', (event) => {
    //                 event.stopPropagation();
    //                 this.updateOrder();
    //             });
    //             $('#confirmationContainer .confirmationClose').on('click', (event) => {
    //                 event.preventDefault();
    //                 event.stopPropagation();
    //                 isCancelButtonClicked = true;
    //                 $('#confirmationContainer').css('display', 'none');
    //                 CalendarFunctions.Calendar.goToInitialDates();
    //                 CalendarFunctions.Calendar.calendar.removeAllEvents();
    //                 CalendarFunctions.addEvent(TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate);
    //                 CalendarFunctions.addEvent(TrampolineOrder.FormSendOrder.Event.EventFromCreate);
    //             });
    //         },
    //         updateOrder: function () {
    //             $('#overlay').css('display', 'flex');
    //             let form_data = Variables.getOrderFormInputs();
    //             form_data.orderID = TrampolineOrder.UpdateOrder.OrderIdToUpdate;
    //             form_data.firstVisibleDay = firstVisibleDayOnCalendar;
    //             form_data.lastVisibleDay = lastVisibleDayOnCalendar;
    //             $.ajax({
    //                 headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
    //                 method: 'PUT',
    //                 url: '/orders/public/order',
    //                 data: form_data,
    //             }).done((response) => {
    //                 $('#overlay').hide();
    //                 if (response.status) {
    //                     eventDay = response.Event[0].start;
    //                     $('#dateChangeAlertMessage').text('Rezervacijos dienos sėkmingai atnaujintos!');
    //                     $('#successfulDateChangeAlert').show().css('display', 'flex');
    //                     $('#confirmationContainer').css('display', 'none');
    //                     $('#thankYouDiv').html(response.view);
    //                     CalendarFunctions.Calendar.calendar.removeAllEvents();
    //                     CalendarFunctions.addEvent(response.Occupied);
    //                     CalendarFunctions.addEvent(response.Event);
    //                     TrampolineOrder.FormSendOrder.Event.OccupiedFromCreate = response.Occupied;
    //                     TrampolineOrder.FormSendOrder.Event.EventFromCreate = response.Event;
    //                 }
    //                 if (!response.status) {
    //                     $('#failedAlertMessage').text(response.failed_input.error[0]);
    //                     $('#failedAlert').show().css('display', 'flex');
    //                     CalendarFunctions.updateEventsPrivate(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay, true);
    //                 }
    //             });
    //         },
    //         DisplayConfirmationElement: function () {
    //             $('#confirmationContainer').css('display', 'block');
    //         },
    //     },
    // },
    // CancelOrder: {
    //     init: function () {
    //         this.Event.init();
    //     },
    //     element: new bootstrap.Modal('#cancelOrderModal'),
    //     Event: {
    //         init: function () {
    //             $('#cancelOrderModal .cancelOrderModalButton').on('click', (event) => {
    //                 event.preventDefault();
    //                 event.stopPropagation();
    //                 this.cancelOrder();
    //             });
    //         },
    //         cancelOrder: function () {
    //             $('#overlay').css('display', 'flex');
    //             $.ajax({
    //                 headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
    //                 method: 'PUT',
    //                 url: '/orders/public/order/view/{order_number}',
    //                 data: {
    //                     order_id: TrampolineOrder.UpdateOrder.OrderIdToUpdate
    //                 },
    //             }).done((response) => {
    //                 $('#overlay').hide();
    //                 TrampolineOrder.CancelOrder.element.hide();
    //                 if (response.status) {
    //                     $('#content-wrap').replaceWith($(response.view).find('#content-wrap'));
    //                 }
    //                 if (!response.status) {
    //                     console.log('patekom');
    //                     $('#failedAlertMessage').text(response.failed_inputs.error[0]);
    //                     $('#failedAlert').show().css('display', 'flex');
    //                 }
    //             });
    //         }
    //     }
    // },
    // PaymentLink: {
    //     OrderIdToCreateLinkFor: 0,
    //     init: function () {
    //         this.Event.init();
    //     },
    //     Event: {
    //         init: function () {
    //             // $('#orderButtons .payAdvance').click(function () {
    //             //     TrampolineOrder.PaymentLink.Event.generatePaymentLink()
    //             // });
    //         },
    //         generatePaymentLink: function () {
    //             $('#overlay').css('display', 'flex');
    //             $.ajax({
    //                     headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
    //                     method: 'POST',
    //                     url: '/orders/public/order/generate_url',
    //                     data: {
    //                         order_id: TrampolineOrder.PaymentLink.OrderIdToCreateLinkFor
    //                     }
    //                 },
    //             ).done((response) => {
    //                 $('#overlay').hide();
    //                 if (response.status) {
    //                     window.location.href = response.paymentLink;
    //                 }
    //             }).fail((jqXHR, textStatus, errorThrown) => {
    //                 $('#overlay').hide();
    //                 alert('Request failed: ' + textStatus);
    //             });
    //         }
    //     }
    // },
    ViewOrderModal: {
        init: function () {
            this.Event.init();
        },
        element: new bootstrap.Modal('#viewOrderModal'),
        Event: {
            init: function () {
                $('#viewOrderModal').on('show.bs.modal', function () {
                    $('.trampoline-name').each(function () {
                        const originalName = $(this).data('original-name');
                        if (originalName) {
                            $(this).text(originalName);
                        }
                    });
                    TrampolineOrder.ViewOrderModal.Event.updateAdvanceSum()
                });
                $('#viewOrderModalButtons .payForOrderAdvance').on('click', function (event) {
                    event.preventDefault();
                    TrampolineOrder.FormSendOrder.Event.addOrder()
                })
            },
            updateAdvanceSum: function () {
                let totalSum = 0;
                let reservationDays = 0;
                let startDateText = '';
                let endDateText = '';

                // Calculate reservation days for the specific event
                const events = CalendarFunctions.Calendar.calendar.getEvents();
                console.log("All events: ", events);
                let reservationEvent = events.find(event => event.extendedProps.type_custom === "trampolineEvent");

                if (reservationEvent) {
                    console.log("Reservation event found: ", reservationEvent);
                    let startDate = new Date(reservationEvent.start);
                    let endDate = new Date(reservationEvent.end);
                    console.log("Original start date: ", startDate);
                    console.log("Original end date: ", endDate);

                    // Adjust for Lithuanian time zone (+3 hours)
                    startDate.setHours(startDate.getHours() + 3);
                    endDate.setHours(endDate.getHours() + 3);
                    console.log("Adjusted start date: ", startDate);
                    console.log("Adjusted end date: ", endDate);

                    // Adjust end date by subtracting one day
                    endDate.setDate(endDate.getDate() - 1);
                    console.log("Final end date: ", endDate);

                    reservationDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Convert milliseconds to days and add 1 for inclusive days
                    console.log("Calculated reservation days: ", reservationDays);

                    // Format the dates for display
                    startDateText = startDate.toISOString().split('T')[0];
                    endDateText = endDate.toISOString().split('T')[0];
                }

                // Update trampoline items with days and calculate total sum
                $('.trampoline-item').each(function () {
                    const price = parseFloat($(this).data('price'));
                    const trampolineNameElement = $(this).find('.trampoline-name');
                    let originalName = trampolineNameElement.data('original-name');

                    if (!originalName) {
                        originalName = trampolineNameElement.text();
                        trampolineNameElement.data('original-name', originalName);
                    }

                    if (reservationDays > 1) {
                        trampolineNameElement.text(`${originalName} (${reservationDays} d.)`);
                    } else {
                        trampolineNameElement.text(originalName);
                    }

                    const totalPrice = price * reservationDays;
                    console.log("Total price for ", originalName, ": ", totalPrice);
                    $(this).find('.trampoline-price').text(totalPrice.toFixed(2));
                    totalSum += totalPrice;
                });

                // Calculate advance payment
                const advancePayment = Math.round((totalSum * AdvancePercentage) / 10) * 10;
                const finalPayment = totalSum - advancePayment;

                // Debugging logs
                console.log("Total Sum: ", totalSum);
                console.log("Reservation Days: ", reservationDays);
                console.log("Advance Payment: ", advancePayment);
                console.log("Final Payment: ", finalPayment);

                // Update the modal with the calculated values
                $('#advance-payment').text(advancePayment.toFixed(2));
                $('#final-payment').text(finalPayment.toFixed(2));
                if (reservationDays > 1) {
                    $('#reservation-dates').text(`${startDateText} - ${endDateText}`);
                    $('#reservation-label').text('Rezervuotos dienos:');
                } else {
                    $('#reservation-dates').text(`${startDateText}`);
                    $('#reservation-label').text('Rezervuota diena:');
                }
            }
        }
    }
}

/* Document ready function */
$(document).ready(function () {
    console.log("/js/trampolines/public/order_public.js -> ready!");
    TrampolineOrder.init();
    CalendarFunctions.Calendar.initialize();
    console.log('Trampolines ->', Trampolines);
});
