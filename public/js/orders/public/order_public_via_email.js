let eventDay;
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let firstMonthDay;
let PcCalendar
let mobileCalendar
let Trampolines;
let flatPicker
let modalReopened = false
let isFirstMonthCaptured = false
let Calendar = null;
let isEventDrop = false;
let modalPopulated = false;
let isCancelButtonClicked = false;
let today = new Date();
today.setHours(0, 0, 0, 0);
today.setHours(today.getHours() + 3);
today = today.toISOString().split('T')[0];

let showCalendar = {
    showCalendar: function () {
        if ($(window).width() >= 768) {
            $('#calendar').css('display', 'block');
            $('#changeOrderDeliveryTimePc').css('display', 'block');
            $('#changeOrderDatesMobile').css('display', 'none');
            $('#dateCalendarForMobile').css('display', 'none');
            PcCalendar = true;
            mobileCalendar = false;
        } else {
            $('#calendar').css('display', 'none');
            $('#changeOrderDeliveryTimePc').css('display', 'none');
            $('#changeOrderDatesMobile').css('display', 'block');
            $('#dateCalendarForMobile').css('display', 'block');
            mobileCalendar = true;
            PcCalendar = false;
        }
        // CalendarFunctions.Calendar.initialize()
    }
}

// let showCalendar = {
//     showCalendar: function () {
//         if (window.matchMedia('(min-width: 768px)').matches) {
//             console.log('paetkom i calendar display block')
//             $('#calendar').css('display', 'block');
//             $('#changeOrderDatesMobile').css('display', 'none');
//             PcCalendar = true;
//             mobileCalendar = false;
//         } else {
//             console.log('paetkom i order dates display block')
//             $('#calendar').css('display', 'none');
//             $('#changeOrderDatesMobile').css('display', 'block');
//             mobileCalendar = true;
//             PcCalendar = false;
//         }
//         // CalendarFunctions.Calendar.initialize()
//         // Listen for changes in screen width
//         // window.addEventListener('resize', this.showCalendar);
//     }
// }
let flatPickerFunctions = {
    flatPickerCalendar: {
        disabledDaysArray: [],
        monthChangeTo: 0,
        initialMonth: 0,
        initialRentalStart: 0,
        initialRentalEnd: 0,
        initialize: function () {
            console.log('inicializuojam flatpickeri')
            flatPicker = $('#flatPickerCalendar').flatpickr({
                mode: 'range', // Enables range selection
                dateFormat: 'Y/m/d', // Date format
                minDate: "today",
                // locale: 'lt',
                // disableMobile: true, // Force Flatpickr to use its own picker on mobile devices
                disable: flatPickerFunctions.flatPickerCalendar.disabledDaysArray,
                defaultDate: [flatPickerFunctions.flatPickerCalendar.initialRentalStart, flatPickerFunctions.flatPickerCalendar.initialRentalEnd],
                onChange: function (selectedDates, dateStr, instance) {
                    // Ensure range selection does not include disabled dates
                    console.log('disabled days: ', flatPickerFunctions.flatPickerCalendar.disabledDaysArray)
                    console.log('patekom i on change')
                    if (selectedDates.length === 2) {
                        console.log('Selected dates:', selectedDates);

                        let startDate = selectedDates[0];
                        let endDate = selectedDates[1];
                        let isValidRange = true;

                        console.log('Start date:', startDate);
                        console.log('End date:', endDate);

                        // Create new Date objects for manipulation
                        let startDateToAjax = new Date(startDate);
                        let endDateToAjax = new Date(endDate);

                        startDateToAjax.setHours(startDateToAjax.getHours() + 3);

                        endDateToAjax.setHours(endDateToAjax.getHours() + 3);
                        endDateToAjax.setDate(endDateToAjax.getDate() + 1);

                        let formattedStartDate = startDateToAjax.toISOString().substring(0, 10);

                        let formattedEndDate = endDateToAjax.toISOString().substring(0, 10);

                        console.log('Formatted Start Date:', formattedStartDate);
                        console.log('Formatted End Date:', formattedEndDate);

                        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                            console.log('Checking date in range:', d);

                            if (flatPickerFunctions.flatPickerCalendar.isDateDisabled(d, flatPickerFunctions.flatPickerCalendar.disabledDaysArray)) {
                                console.log('Found a disabled date in range:', d);
                                isValidRange = false;
                                break;
                            }
                        }

                        if (!isValidRange) {
                            console.log('Invalid date range. Clearing selection and updating events.');
                            instance.clear();
                            console.log('current month', instance.currentMonth)
                            instance.changeMonth(flatPickerFunctions.flatPickerCalendar.monthChangeTo, true);
                            console.log('Updated events after clearing selection.');
                            console.log('First month day:', firstMonthDay);
                            alert('The selected range includes disabled dates. Please select a valid range.');
                        } else {
                            console.log('Valid date range selected:', selectedDates);
                            Trampolines.forEach(function (Trampoline) {
                                Trampoline.rental_start = formattedStartDate;
                                Trampoline.rental_end = formattedEndDate;
                            })
                            TrampolineOrder.ChangeOrderDatesModalMobile.flatPickerRangeStart = formattedStartDate;
                            TrampolineOrder.ChangeOrderDatesModalMobile.flatPickerRangeEnd = formattedEndDate;
                        }
                    }
                },
                onMonthChange: function (selectedDates, dateStr, instance) {
                    flatPickerFunctions.flatPickerCalendar.monthChangeTo = instance.currentMonth - flatPickerFunctions.flatPickerCalendar.initialMonth
                    console.log('current month: ', instance.currentMonth)
                    console.log('initial month: ', flatPickerFunctions.flatPickerCalendar.initialMonth)
                    console.log('month change to: from initial + ', flatPickerFunctions.flatPickerCalendar.monthChangeTo)
                    flatPickerFunctions.flatPickerCalendar.logVisibleDays(); // Log the visible days when the month changes
                    CalendarFunctions.updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay)
                },
                onOpen: function (selectedDates, dateStr, instance) {
                    if (!isFirstMonthCaptured) {
                        flatPickerFunctions.flatPickerCalendar.initialMonth = instance.currentMonth
                        console.log('initial month: ', flatPickerFunctions.flatPickerCalendar.initialMonth)
                        isFirstMonthCaptured = true
                    }
                },
                // appendTo: document.body, // Ensures the calendar is appended to the body, which is useful for z-index control
                zIndex: 9900 // Set the desired z-index value here
            })
        },
        isDateDisabled: function (date, disabledDates) {
            for (let entry of disabledDates) {
                if (entry instanceof Object && entry.from && entry.to) {
                    if (date >= entry.from && date <= entry.to) {
                        return true;
                    }
                } else if (entry instanceof Date) {
                    if (date.toDateString() === entry.toDateString()) {
                        return true;
                    }
                }
            }
            return false;
        },
        logVisibleDays: function () {
            // Assuming flatPicker is your Flatpickr instance
            // Get the days container element
            const daysContainer = flatPicker.calendarContainer.querySelector('.flatpickr-days');
            console.log('Days container:', daysContainer);
            // Find all visible day elements
            const allDayElements = daysContainer.querySelectorAll('.flatpickr-day');
            console.log('All day elements:', allDayElements);

            // Initialize variables to hold first and last visible day elements
            let firstVisibleDayElement = null;
            let lastVisibleDayElement = null;

            // Loop through all day elements to find first and last visible ones
            allDayElements.forEach(dayElement => {
                // Check if the element is visible (not previous or next month)
                if (dayElement.classList.contains('prevMonthDay') && dayElement.classList.contains('nextMonthDay')) {
                    // If first visible day element is not set, set it
                    if (!firstVisibleDayElement) {
                        firstVisibleDayElement = dayElement;
                    }
                    // Always update last visible day element until the loop finishes
                    lastVisibleDayElement = dayElement;
                }
            });

            // If there are no previous month days, use the first day of the current month
            if (!firstVisibleDayElement) {
                firstVisibleDayElement = daysContainer.querySelector('.flatpickr-day:not(.nextMonthDay)');
            }

            // If there are no next month days, use the last day of the current month
            if (!lastVisibleDayElement) {
                const allDayElementsArray = Array.from(allDayElements);
                lastVisibleDayElement = allDayElementsArray[allDayElementsArray.length - 1];
            }

            // Function to format date to yyyy-mm-dd HH:MM:ss
            // Function to format date to yyyy-mm-dd HH:MM:ss and add one day to the last visible day only
            const formatDate = (dateLabel, isLastVisibleDay) => {
                const date = new Date(dateLabel);
                // Add 3 hours to adjust for Lithuanian GMT+3
                date.setHours(date.getHours() + 3);
                if (isLastVisibleDay) {
                    date.setDate(date.getDate() + 1);
                }
                console.log('Date:', date.toISOString().split('T')[0])
                return date.toISOString().split('T')[0]; // Extract yyyy-mm-dd from ISO string
            };

            const firstDateLabel = firstVisibleDayElement.getAttribute('aria-label');
            const lastDateLabel = lastVisibleDayElement.getAttribute('aria-label');

            // Format dates
            const formattedFirstDate = formatDate(firstDateLabel, false);
            const formattedLastDate = formatDate(lastDateLabel, true);

            firstVisibleDayOnCalendar = formattedFirstDate;
            lastVisibleDayOnCalendar = formattedLastDate;
            firstMonthDay = formattedFirstDate;
        },
        updateDisabledDates: function (newDisabledDates) {
            flatPickerFunctions.flatPickerCalendar.disabledDaysArray = newDisabledDates;
            flatPicker.set('disable', newDisabledDates);
        }
    },
    flatPickerTime: {
        defaultTime: 0,
        initialize: function () {
            $('#customerDeliveryTime').flatpickr({
                enableTime: true, // Enable time picker
                noCalendar: true, // Hide calendar
                disableMobile: "true",
                dateFormat: "H:i", // Format displayed time (24-hour)
                time_24hr: true, // Use 24-hour time format
                minTime: "8:00",
                maxTime: "22:00",
                defaultDate: flatPickerFunctions.flatPickerTime.defaultTime
            })
        }
    }
}

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
            if (inputName === 'customerDeliveryTime') {
                values[inputName] = $('#updateOrderModal input[name="' + inputName + '"]').val();
            } else {
                values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
            }
            // console.log('inputName: ', inputName)
        });
        console.log('customerDeliveryTime: ', $('#orderForm input[name="customerDeliveryTime"]').val())
        values.trampolines = Trampolines;

        // Add client and address details
        values.customerName = this.client.name;
        values.customerSurname = this.client.surname;
        values.customerPhoneNumber = this.client.phone;
        values.customerEmail = this.client.email;
        values.customerDeliveryCity = this.clientAddress.address_town;
        values.customerDeliveryPostCode = this.clientAddress.address_postcode;
        values.customerDeliveryAddress = this.clientAddress.address_street;
        // values.customerDeliveryTime = this.clientTime.delivery_time;
        console.log('values: ', values)
        return values;
    },
    getDeliveryTimeForPc: function (){
        let values = {}
        values['customerDeliveryTime'] = $('#updateOrderModal input[name="customerDeliveryTime"]').val();
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
    // getDeliveryTime: function () {
    //     return this.clientTime.delivery_time;
    // },
    populateOrderFormValues: function () {
        return {
            customerName: this.client.name,
            customerSurname: this.client.surname,
            customerPhoneNumber: this.client.phone,
            customerEmail: this.client.email,
            customerDeliveryCity: this.clientAddress.address_town,
            customerDeliveryPostCode: this.clientAddress.address_postcode,
            customerDeliveryAddress: this.clientAddress.address_street,
            // customerDeliveryTime: this.getDeliveryTime(),
            trampolines: this.getTrampolines()
        };
    },
    Events: {
        init: function () {
            $('#orderForm input[name="customerDeliveryTime"]').on('change', function () {
                console.log('pasikeite')
                Variables.clientTime.delivery_time = $(this).val();
            });
        }
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
                if (PcCalendar) {
                    Occupied = response.Occupied;
                    this.Calendar.calendar.removeAllEvents();
                    this.addEvent(Occupied);
                    this.addEvent(response.Availability);
                    Trampolines = response.Trampolines;
                }
                if (mobileCalendar) {
                    let disabledDates = TrampolineOrder.ChangeOrderDatesModalMobile.processOccupiedDates(response.Occupied);
                    flatPickerFunctions.flatPickerCalendar.updateDisabledDates(disabledDates);
                }
            }
        });
    },
};

let TrampolineOrder = {
    init: function () {
        $('#thankYouDiv').html(view);
        showCalendar.showCalendar();
        this.UpdateOrder.init();
        this.CancelOrderModal.init()
        this.ChangeOrderDatesModalMobile.init()
        Variables.setClientDetails(Client);
        Variables.setClientAddressDetails(ClientAddress);
        Variables.setDeliveryTimeDetails(DeliveryTime);
        Variables.Events.init()
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
                    flatPickerFunctions.flatPickerTime.defaultTime = response.order.trampolines[0].delivery_time;
                    flatPickerFunctions.flatPickerTime.initialize()
                    if (mobileCalendar) {
                        let endDate = new Date(response.Events[0].end);
                        endDate.setDate(endDate.getDate() - 1);
                        endDate = endDate.toISOString().split('T')[0];
                        flatPickerFunctions.flatPickerCalendar.disabledDaysArray = TrampolineOrder.ChangeOrderDatesModalMobile.processOccupiedDates(response.Occupied);
                        flatPickerFunctions.flatPickerCalendar.initialRentalStart = response.Events[0].start;
                        flatPickerFunctions.flatPickerCalendar.initialRentalEnd = endDate;
                        flatPickerFunctions.flatPickerCalendar.initialize()
                    }
                }
                if (!response.status) {
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
                // form_data.delivery_time = Variables.getDeliveryTime(); // Add delivery_time
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
                        if (PcCalendar) {
                            CalendarFunctions.Calendar.calendar.removeAllEvents();
                            CalendarFunctions.Calendar.goToInitialDates();
                            $('#confirmationContainer').css('display', 'none');
                        }
                        if (mobileCalendar) {
                            TrampolineOrder.ChangeOrderDatesModalMobile.element.hide();
                        }
                    }
                });
            },
            // updateOrderDeliveryTime: function () {
            //     $('#overlay').css('display', 'flex');
            //     let form_data = Variables.getDeliveryTimeForPc();
            //     form_data.orderID = Order_id;
            //     form_data
            //     // form_data.delivery_time = Variables.getDeliveryTime(); // Add delivery_time
            //     $.ajax({
            //         headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            //         method: 'PUT',
            //         url: '/orders/public/order/updateDeliveryTime',
            //         data: form_data,
            //     }).done((response) => {
            //         $('#overlay').hide();
            //         if (response.status) {
            //             eventDay = response.Event[0].start;
            //             $('#dateChangeAlertMessage').text('Rezervacijos dienos sėkmingai atnaujintos!');
            //             $('#successfulDateChangeAlert').show().css('display', 'flex');
            //             $('#confirmationContainer').css('display', 'none');
            //             $('#thankYouDiv').html(response.view);
            //             CalendarFunctions.Calendar.calendar.removeAllEvents();
            //             CalendarFunctions.addEvent(response.Occupied);
            //             CalendarFunctions.addEvent(response.Event);
            //             TrampolineOrder.UpdateOrder.OccupiedWhenCancelled = response.Occupied;
            //             TrampolineOrder.UpdateOrder.EventWhenCancelled = response.Event;
            //         }
            //         if (!response.status) {
            //
            //             $('#failedAlertMessage').text(response.failed_input.error[0]);
            //             $('#failedAlert').show().css('display', 'flex');
            //             if (PcCalendar) {
            //                 CalendarFunctions.Calendar.calendar.removeAllEvents();
            //                 CalendarFunctions.Calendar.goToInitialDates();
            //                 $('#confirmationContainer').css('display', 'none');
            //             }
            //             if (mobileCalendar) {
            //                 TrampolineOrder.ChangeOrderDatesModalMobile.element.hide();
            //             }
            //         }
            //     });
            // },
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
    ChangeOrderDatesModalMobile: {
        init: function () {
            this.Event.init();
        },
        element: new bootstrap.Modal('#updateOrderModal'),
        flatPickerRangeStart: 0,
        flatPickerRangeEnd: 0,
        Event: {
            init: function () {
                $('#updateOrderModal').on('hidden.bs.modal', function (e) {
                    // flatPicker.destroy()
                    flatPickerFunctions.flatPickerTime.initialize();
                    if (mobileCalendar) {
                        flatPickerFunctions.flatPickerCalendar.initialize();
                        flatPickerFunctions.flatPickerCalendar.monthChangeTo = 0
                        flatPickerFunctions.flatPickerCalendar.logVisibleDays()
                        CalendarFunctions.updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                    }
                });
                $('#updateOrderModal .updateOrderModalButton').on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (mobileCalendar) {
                        TrampolineOrder.UpdateOrder.Event.updateOrder()
                    } else {
                        TrampolineOrder.UpdateOrder.Event.updateOrderDeliveryTime()
                    }
                })
            }
        },
        processOccupiedDates: function (occupiedDates) {
            let processedDates = occupiedDates.map(occupied => ({
                from: new Date(new Date(occupied.start).getTime() - 3 * 60 * 60 * 1000), // Subtract 3 hours
                to: new Date(new Date(occupied.end).getTime() - 24 * 60 * 60 * 1000) // Subtract 1 day
            }));
            // Log the processed dates
            console.log('Processed Dates:', processedDates);

            return processedDates;
        },
    },
}

$(document).ready(function () {
    console.log("/js/trampolines/public/order_public_via_email.js -> ready!");
    TrampolineOrder.init();

    // flatpickr("#flatPickerCalendarTest", {
    //     // You can add Flatpickr options here
    //     enableTime: true,
    //     dateFormat: "Y-m-d H:i",
    //     // Example of other options
    //     minDate: "today", // Prevent past dates
    //     defaultDate: new Date() // Set default date to today
    // });
});
