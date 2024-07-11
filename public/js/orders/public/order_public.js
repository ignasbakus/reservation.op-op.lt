/* Global variables */
let eventDay;
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let firstMonthDay;
let Calendar = null;
let isEventDrop = false;
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
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity',
        'customerDeliveryPostCode', 'customerDeliveryAddress', 'customerDeliveryTime'
    ],
    getOrderFormInputs: function () {
        let values = {};
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
        });
        values.trampolines = Trampolines;
        console.log('Values:', values)
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
                initialView: 'dayGridMonth',
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
                        CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                    } else if (droppedMonth > currentMonth) {
                        this.next();
                        CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                    }
                    isEventDrop = false;
                },
                // dayMaxEvents: true,
                events: [],
                datesSet: function (info) {
                    let CalendarView = info.view;
                    console.log('CalendarView:', CalendarView)
                    let firstDayMonth = new Date(CalendarView.currentStart);
                    let firstCalendarVisibleDate = new Date(info.start);
                    let lastCalendarVisibleDate = new Date(info.end);
                    firstDayMonth.setUTCHours(firstDayMonth.getUTCHours() + 3);
                    firstCalendarVisibleDate.setUTCHours(firstCalendarVisibleDate.getUTCHours() + 3);
                    lastCalendarVisibleDate.setUTCHours(lastCalendarVisibleDate.getUTCHours() + 3);
                    firstMonthDay = firstDayMonth.toISOString().split('T')[0];
                    firstVisibleDayOnCalendar = firstCalendarVisibleDate.toISOString().split('T')[0];
                    lastVisibleDayOnCalendar = lastCalendarVisibleDate.toISOString().split('T')[0];

                    let currentStart = new Date(CalendarView.currentStart);
                    let prevButton = document.querySelector('.fc-prev-button');
                    let todayButton = document.querySelector('.fc-today-button');
                    if (skippedMonth) {
                        let prevMonth = new Date(currentStart);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);
                        prevButton.disabled = prevMonth.getMonth() === skippedMonth;
                        todayButton.disabled = true
                    } else {
                        prevButton.disabled = false;
                    }
                    if (!isNavigating && !isEventDrop && !isCancelButtonClicked) {
                        CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
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
                                }
                            });
                        });
                    } else {
                        Trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = draggedEvent.startStr;
                            Trampoline.rental_end = draggedEvent.endStr;
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
            let Availability = response.Availability;
            Trampolines = response.Trampolines;
            if (response.status) {
                this.Calendar.calendar.removeAllEvents();
                this.addEvent(Occupied);
                this.addEvent(Availability);

                // Handle navigation logic for first load and availability check
                if (isFirstLoad && Availability.length > 0) {
                    let firstAvailableDate = new Date(Availability[0].start);
                    let availableMonth = firstAvailableDate.getMonth();
                    let currentMonth = new Date(firstMonthDay).getMonth();
                    if (availableMonth > currentMonth) {
                        // Set navigating flag to true
                        isNavigating = true;
                        skippedMonth = new Date(firstMonthDay).getMonth();
                        // Navigate to next month
                        this.Calendar.calendar.next();

                        // Recalculate the dates after navigation
                        let newCalendarView = this.Calendar.calendar.view;
                        let newFirstDayMonth = new Date(newCalendarView.currentStart);
                        newFirstDayMonth.setUTCHours(newFirstDayMonth.getUTCHours() + 3);
                        let firstMonthDayNew = newFirstDayMonth.toISOString().split('T')[0];

                        // Update events for the new month
                        this.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDayNew);

                        // Reset navigating flag after update
                        isNavigating = false;
                    }
                    isFirstLoad = false;
                }
            }
        });
    }
};

let flatPicker = {
    initialize: function () {
        $('#customerDeliveryTime').flatpickr({
            enableTime: true, // Enable time picker
            noCalendar: true, // Hide calendar
            dateFormat: "H:i", // Format displayed time (24-hour)
            time_24hr: true, // Use 24-hour time format
            minTime: "8:00",
            maxTime: "22:00",
        })
    }
}

let litePicker = {
    initialize: function () {
        const picker = new Litepicker({
            element: document.getElementById('litepicker'),
            singleMode: false, // Set to true for single date selection
            format: 'YYYY-MM-DD', // Customize the date format
            // Add more options as needed
        })
    }
}

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
                            window.location.href = response.PaymentLink
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
        // CalendarFunctions.Calendar.initialize();
        flatPicker.initialize();
        litePicker.initialize();
        console.log('Trampolines ->', Trampolines);
    });





