/* Global variables */
let eventDay;
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let firstMonthDay;
let lockDays;
let PickerInitialized = false
let PcCalendar = false
let mobileCalendar = false
let isFirstMonthCaptured = false
let Calendar = null;
let flatPicker = null;
let Picker = null;
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
let showCalendar = {
    showCalendar: function () {
        if ($(window).width() >= 768) {
            $('#calendar').css('display', 'block');
            $('#orderDates').css('display', 'none');
            PcCalendar = true;
            mobileCalendar = false;
        } else {
            $('#calendar').css('display', 'none');
            $('#orderDates').css('display', 'block');
            mobileCalendar = true;
            PcCalendar = false;
        }
        CalendarFunctions.Calendar.initialize()
    }
}
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
let CalendarFunctions = {           // Calendar functions
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
        // console.log('firstVisibleDay:', firstVisibleDay)
        // console.log('lastVisibleDay:', lastVisibleDay)
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
                if (PcCalendar) {
                    this.Calendar.calendar.removeAllEvents();
                    this.addEvent(Occupied);
                    this.addEvent(Availability);
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
                if (mobileCalendar) {
                    /* We minus one day from range.end, because in full calendar we use the next days midnight,
                    * here it doesn't work like that */
                    // lite picker logic
                    /*const dateCells = document.querySelectorAll('.litepicker-day'); // Adjust selector as needed
                    dateCells.forEach(cell => {
                        cell.classList.remove('is-occupied'); // Remove class indicating occupied days
                        cell.removeAttribute('data-event-id'); // Remove any event ID attribute
                    });
                    lockDays = response.Occupied ? response.Occupied.map(range => {
                        const endDate = new Date(range.end);
                        endDate.setDate(endDate.getDate() - 1); // Subtract one day
                        console.log('range start', range.start)
                        let newRangeStart = [range.start, endDate.toISOString().split('T')[0]]; // Format back to 'YYYY-MM-DD'
                        console.log('newRangeStart', newRangeStart)
                        return newRangeStart
                    }) : [];
                    console.log('Lock days: ', lockDays);
                    if (!PickerInitialized) {
                        litePicker.init();
                        PickerInitialized = true;
                    }
                    Picker.setOptions({disallowLockDaysInRange: true});
                    Picker.gotoDate(firstMonthDay)
                    */
                    // if (!PickerInitialized) {
                    //     datePicker.initialize()
                    //     PickerInitialized = true;
                    // }
                    let disabledDates = CalendarFunctions.processOccupiedDates(response.Occupied);
                    if (!PickerInitialized) {
                        flatPickerCalendar.initialize(disabledDates)
                        PickerInitialized = true;
                    } else {
                        flatPickerCalendar.updateDisabledDates(disabledDates);
                    }
                    // flatPickerCalendar.disabledDaysArray = response.Occupied
                }
            }
        });
    },
    processOccupiedDates: function (occupiedDates) {
        let processedDates = occupiedDates.map(occupied => ({
            from: new Date(new Date(occupied.start).getTime() - 3 * 60 * 60 * 1000), // Subtract 3 hours
            to: new Date(new Date(occupied.end).getTime() - 24 * 60 * 60 * 1000) // Subtract 1 day
        }));
        // Log the processed dates
        console.log('Processed Dates:', processedDates);

        return processedDates;
    }
};

let flatPickerTime = {
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

let flatPickerCalendar = {
    disabledDaysArray: [],
    monthChangeTo: 0,
    initialMonth: 0,
    initialize: function (disabledDates) {
        flatPickerCalendar.disabledDaysArray = disabledDates;
        flatPicker = $('#flatPickerCalendar').flatpickr({
            mode: 'range', // Enables range selection
            dateFormat: 'Y/m/d', // Date format
            minDate: "today",
            // locale: 'lt',
            // disableMobile: true, // Force Flatpickr to use its own picker on mobile devices
            disable: flatPickerCalendar.disabledDaysArray,
            onChange: function (selectedDates, dateStr, instance) {
                // Ensure range selection does not include disabled dates
                console.log('disabled days: ', flatPickerCalendar.disabledDaysArray)
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

                        if (flatPickerCalendar.isDateDisabled(d, flatPickerCalendar.disabledDaysArray)) {
                            console.log('Found a disabled date in range:', d);
                            isValidRange = false;
                            break;
                        }
                    }

                    if (!isValidRange) {
                        console.log('Invalid date range. Clearing selection and updating events.');
                        // flatPicker.changeMonth(instance.currentMonth, false)
                        // instance.destroy()
                        instance.clear();
                        console.log('current month', instance.currentMonth)
                        instance.changeMonth(flatPickerCalendar.monthChangeTo, true);
                        // flatPicker.close()
                        CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        console.log('Updated events after clearing selection.');
                        console.log('First month day:', firstMonthDay);
                        alert('The selected range includes disabled dates. Please select a valid range.');
                    } else {
                        console.log('Valid date range selected:', selectedDates);
                        Trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = formattedStartDate;
                            Trampoline.rental_end = formattedEndDate;
                        })
                        TrampolineOrder.flatPickerRangeStart = formattedStartDate;
                        TrampolineOrder.flatPickerRangeEnd = formattedEndDate;
                    }
                }
            },
            onMonthChange: function (selectedDates, dateStr, instance) {
                flatPickerCalendar.monthChangeTo = instance.currentMonth - flatPickerCalendar.initialMonth
                console.log('current month: ', instance.currentMonth)
                console.log('initial month: ', flatPickerCalendar.initialMonth)
                console.log('month change to: from initial + ', flatPickerCalendar.monthChangeTo)
                flatPickerCalendar.logVisibleDays(); // Log the visible days when the month changes
                CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay)

            },
            onOpen: function (selectedDates, dateStr, instance) {
                if (!isFirstMonthCaptured) {
                    flatPickerCalendar.initialMonth = instance.currentMonth
                    isFirstMonthCaptured = true
                }
            },

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

        // Find all visible day elements
        const allDayElements = daysContainer.querySelectorAll('.flatpickr-day');

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
        flatPickerCalendar.disabledDaysArray = newDisabledDates;
        flatPicker.set('disable', newDisabledDates);
    }
}

// let litePicker = {
//     init: function () {
//         this.initialize()
//         this.Events.init()
//     },
//     initialize: function () {
//         Picker = new Litepicker({
//             element: document.getElementById('litepicker'),
//             singleMode: false, // Set to true for single date selection
//             format: 'YYYY-MM-DD',
//             lockDays: lockDays,
//             disallowLockDaysInRange: true,
//             minDate: today,
//             autoApply: false,
//             zIndex: 9998,
//             lockDaysFilter: (date) => {
//                 if (!lockDays.length) return false; // Return false if lockDays is empty
//
//                 return lockDays.some(range => {
//                     if (Array.isArray(range)) {
//                         const start = new Date(range[0]);
//                         const end = new Date(range[1]);
//                         return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
//                     } else {
//                         return date.format('YYYY-MM-DD') === range;
//                     }
//                 });
//             },
//         })
//     },
//     Events: {
//         init: function () {
//             Picker.on('render', function () {
//                 litePicker.Events.findFirstLastVisibleDay()
//             });
//             $(document).on('click', '.button-next-month', function () {
//                 console.log('Next month button clicked');
//                 CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
//             });
//         },
//         findFirstLastVisibleDay: function () {
//             console.log('Litepicker rendered');
//             const calendarEl = document.querySelector('.litepicker');
//             console.log('Calendar element:', calendarEl);
//             if (calendarEl) {
//                 const firstDay = calendarEl.querySelector('.day-item:not(.is-locked)');
//                 const lastDay = calendarEl.querySelector('.day-item:not(.is-locked):last-child');
//
//                 if (firstDay && lastDay) {
//                     const firstVisibleDay = new Date(parseInt(firstDay.getAttribute('data-time')));
//                     const lastVisibleDay = new Date(parseInt(lastDay.getAttribute('data-time')));
//
//                     // Add 3 hours for Vilnius timezone (GMT+3)
//                     firstVisibleDay.setHours(firstVisibleDay.getHours() + 3);
//                     lastVisibleDay.setHours(lastVisibleDay.getHours() + 3);
//
//                     // Format dates as YYYY-MM-DD
//                     const firstVisibleFormatted = firstVisibleDay.toISOString().split('T')[0];
//                     const lastVisibleFormatted = lastVisibleDay.toISOString().split('T')[0];
//                     firstVisibleDayOnCalendar = firstVisibleFormatted;
//                     lastVisibleDayOnCalendar = lastVisibleFormatted;
//                     firstMonthDay = firstVisibleFormatted
//
//                     console.log('First visible day:', firstVisibleFormatted);
//                     console.log('Last visible day:', lastVisibleFormatted);
//                 }
//             }
//         },
//     }
// }

// let datePicker = {
//     initialize: function () {
//
//         new tempusDominus.TempusDominus(document.getElementById('datetimepicker'), {
//             allowInputToggle: false,
//             container: undefined,
//             dateRange: false,
//             debug: false,
//             defaultDate: undefined,
//             display: {
//                 icons: {
//                     type: 'icons',
//                     time: 'fa-solid fa-clock',
//                     date: 'fa-solid fa-calendar',
//                     up: 'fa-solid fa-arrow-up',
//                     down: 'fa-solid fa-arrow-down',
//                     previous: 'fa-solid fa-chevron-left',
//                     next: 'fa-solid fa-chevron-right',
//                     today: 'fa-solid fa-calendar-check',
//                     clear: 'fa-solid fa-trash',
//                     close: 'fa-solid fa-xmark'
//                 },
//                 sideBySide: false,
//                 calendarWeeks: false,
//                 viewMode: 'calendar',
//                 toolbarPlacement: 'bottom',
//                 keepOpen: false,
//                 buttons: {
//                     today: false,
//                     clear: false,
//                     close: false
//                 },
//                 components: {
//                     calendar: true,
//                     date: true,
//                     month: true,
//                     year: true,
//                     decades: true,
//                     clock: true,
//                     hours: true,
//                     minutes: true,
//                     seconds: false,
//                     useTwentyfourHour: undefined
//                 },
//                 inline: false,
//                 theme: 'auto'
//             },
//             keepInvalid: false,
//             localization: {
//                 clear: 'Clear selection',
//                 close: 'Close the picker',
//                 dateFormats: {L: "MM/DD/YYYY"}, // Custom format
//                 dayViewHeaderFormat: {month: 'long', year: '2-digit'},
//                 decrementHour: 'Decrement Hour',
//                 decrementMinute: 'Decrement Minute',
//                 decrementSecond: 'Decrement Second',
//                 format: 'MM/DD/YYYY',
//                 hourCycle: 'h23',
//                 incrementHour: 'Increment Hour',
//                 incrementMinute: 'Increment Minute',
//                 incrementSecond: 'Increment Second',
//                 locale: 'en',
//                 nextCentury: 'Next Century',
//                 nextDecade: 'Next Decade',
//                 nextMonth: 'Next Month',
//                 nextYear: 'Next Year',
//                 ordinal: (number) => number + (number === 1 ? 'st' : number === 2 ? 'nd' : number === 3 ? 'rd' : 'th'),
//                 pickHour: 'Pick Hour',
//                 pickMinute: 'Pick Minute',
//                 pickSecond: 'Pick Second',
//                 previousCentury: 'Previous Century',
//                 previousDecade: 'Previous Decade',
//                 previousMonth: 'Previous Month',
//                 previousYear: 'Previous Year',
//                 selectDate: 'Select Date',
//                 selectDecade: 'Select Decade',
//                 selectMonth: 'Select Month',
//                 selectTime: 'Select Time',
//                 selectYear: 'Select Year',
//                 startOfTheWeek: 0,
//                 today: 'Go to today',
//                 toggleMeridiem: 'Toggle Meridiem'
//             },
//             meta: {},
//             multipleDates: false,
//             multipleDatesSeparator: '; ',
//             promptTimeOnDateChange: false,
//             promptTimeOnDateChangeTransitionDelay: 200,
//             restrictions: {
//                 minDate: undefined,
//                 maxDate: undefined,
//                 disabledDates: [],
//                 enabledDates: [],
//                 daysOfWeekDisabled: [],
//                 disabledTimeIntervals: [],
//                 disabledHours: [],
//                 enabledHours: []
//             },
//             stepping: 1,
//             useCurrent: true,
//             viewDate: new tempusDominus.DateTime()
//         })
//     }
// }

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
            $('#orderForm input[required]:visible').each(function () {
                if ($(this).val().trim() === '') {
                    isValid = false;
                    return false;
                }
            });
            $('#viewOrderButton').prop('disabled', !isValid);
        }
    },
    flatPickerRangeStart: 0,
    flatPickerRangeEnd: 0,
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
                let startDate, endDate;

                if (PcCalendar) {
                    const reservationEvent = CalendarFunctions.Calendar.calendar.getEvents().find(event => event.extendedProps.type_custom === "trampolineEvent");
                    if (reservationEvent) {
                        startDate = new Date(reservationEvent.start);
                        endDate = new Date(reservationEvent.end);
                        startDate.setHours(startDate.getHours() + 3);
                        endDate.setHours(endDate.getHours() + 3);
                        endDate.setDate(endDate.getDate() - 1); // Adjust end date by subtracting one day
                        reservationDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Convert milliseconds to days and add 1 for inclusive days
                    }
                } else {
                    startDate = new Date(TrampolineOrder.flatPickerRangeStart);
                    endDate = new Date(TrampolineOrder.flatPickerRangeEnd);
                    reservationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
                    endDate.setDate(endDate.getDate() - 1);
                }

                // Common code for updating trampoline items and calculating total sum
                $('.trampoline-item').each(function () {
                    const price = parseFloat($(this).data('price'));
                    const trampolineNameElement = $(this).find('.trampoline-name');
                    let originalName = trampolineNameElement.data('original-name') || trampolineNameElement.text();
                    trampolineNameElement.data('original-name', originalName);
                    trampolineNameElement.text(`${originalName} ${reservationDays > 1 ? `(${reservationDays} d.)` : ''}`);
                    const totalPrice = price * reservationDays;
                    $(this).find('.trampoline-price').text(totalPrice.toFixed(2));
                    totalSum += totalPrice;
                });

                // Calculate and update advance and final payments
                const advancePayment = Math.round((totalSum * AdvancePercentage) / 10) * 10;
                const finalPayment = totalSum - advancePayment;
                $('#advance-payment').text(advancePayment.toFixed(2));
                $('#final-payment').text(finalPayment.toFixed(2));
                $('#reservation-dates').text(`${startDate.toISOString().split('T')[0]} ${reservationDays > 1 ? `- ${endDate.toISOString().split('T')[0]}` : ''}`);
                $('#reservation-label').text(`Rezervuotos dienos${reservationDays > 1 ? 's' : 'a'}:`);
            }
        }
    }
}

/* Document ready function */
$(document).ready(function () {
    console.log("/js/trampolines/public/order_public.js -> ready!");
    showCalendar.showCalendar()
    TrampolineOrder.init();
    // CalendarFunctions.Calendar.initialize();
    flatPickerTime.initialize();
    // $(window).resize(showCalendar.showCalendar())
    console.log('Trampolines ->', Trampolines);
    // new tempusDominus.TempusDominus(document.getElementById('datetimepicker'), {
    //     allowInputToggle: false,
    //     container: undefined,
    //     dateRange: true,
    //     debug: false,
    //     defaultDate: undefined,
    //     display: {
    //         icons: {
    //             type: 'icons',
    //             time: 'fas fa-clock',
    //             date: 'fas fa-calendar',
    //             up: 'fas fa-arrow-up',
    //             down: 'fas fa-arrow-down',
    //             previous: 'fas fa-chevron-left',
    //             next: 'fas fa-chevron-right',
    //             today: 'fas fa-calendar-check',
    //             clear: 'fas fa-trash',
    //             close: 'fas fa-times'
    //         },
    //         sideBySide: false,
    //         calendarWeeks: false,
    //         viewMode: 'calendar',
    //         toolbarPlacement: 'bottom',
    //         keepOpen: false,
    //         buttons: {
    //             today: false,
    //             clear: false,
    //             close: false
    //         },
    //         components: {
    //             calendar: true,
    //             date: true,
    //             month: true,
    //             year: true,
    //             decades: true,
    //             clock: true,
    //             hours: true,
    //             minutes: true,
    //             seconds: false,
    //             useTwentyfourHour: undefined
    //         },
    //         inline: false,
    //         theme: 'auto'
    //     },
    //     keepInvalid: false,
    //     localization: {
    //         clear: 'Clear selection',
    //         close: 'Close the picker',
    //         dateFormats: {L: "DD/MM/YYYY"}, // Custom format
    //         dayViewHeaderFormat: {month: 'long', year: '2-digit'},
    //         decrementHour: 'Decrement Hour',
    //         decrementMinute: 'Decrement Minute',
    //         decrementSecond: 'Decrement Second',
    //         format: 'DD/MM/YYYY',
    //         hourCycle: 'h23',
    //         incrementHour: 'Increment Hour',
    //         incrementMinute: 'Increment Minute',
    //         incrementSecond: 'Increment Second',
    //         locale: 'lt',
    //         nextCentury: 'Next Century',
    //         nextDecade: 'Next Decade',
    //         nextMonth: 'Next Month',
    //         nextYear: 'Next Year',
    //         ordinal: (number) => number + (number === 1 ? 'st' : number === 2 ? 'nd' : number === 3 ? 'rd' : 'th'),
    //         pickHour: 'Pick Hour',
    //         pickMinute: 'Pick Minute',
    //         pickSecond: 'Pick Second',
    //         previousCentury: 'Previous Century',
    //         previousDecade: 'Previous Decade',
    //         previousMonth: 'Previous Month',
    //         previousYear: 'Previous Year',
    //         selectDate: 'Select Date',
    //         selectDecade: 'Select Decade',
    //         selectMonth: 'Select Month',
    //         selectTime: 'Select Time',
    //         selectYear: 'Select Year',
    //         startOfTheWeek: 0,
    //         today: 'Go to today',
    //         toggleMeridiem: 'Toggle Meridiem'
    //     },
    //     meta: {},
    //     multipleDates: false,
    //     multipleDatesSeparator: '; ',
    //     promptTimeOnDateChange: false,
    //     promptTimeOnDateChangeTransitionDelay: 200,
    //     restrictions: {
    //         minDate: undefined,
    //         maxDate: undefined,
    //         disabledDates: [],
    //         enabledDates: [],
    //         daysOfWeekDisabled: [],
    //         disabledTimeIntervals: [],
    //         disabledHours: [],
    //         enabledHours: []
    //     },
    //     stepping: 1,
    //     useCurrent: true,
    //     viewDate: new tempusDominus.DateTime()
    // })
});





