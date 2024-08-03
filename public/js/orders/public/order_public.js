/* Global variables */
let eventDay;
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let firstMonthDay;
let PickerInitialized = false
let PcCalendar = false
let mobileCalendar = false
let isFirstMonthCaptured = false
let Calendar = null;
let flatPicker = null;
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
// let ToolTip = {
//     calendarTooltip: function (info){
//         if (info.dayEl._tippy) {
//             info.dayEl._tippy.setContent(`Date: ${info.dateStr}`);
//             info.dayEl._tippy.show();
//             return;
//         }
//
//         // Initialize the tooltip with plain text content
//         tippy(info.dayEl, {
//             content: `Date: ${info.dateStr}`,
//             placement: 'top',
//             trigger: 'click',
//             hideOnClick: true
//         });
//
//         // Retrieve the tooltip instance and show it
//         let tippyInstance = tippy(info.dayEl)[0];
//         console.log('Tippy Instance:', tippyInstance);
//         tippyInstance.show();
//     }
// };

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
            flatPickerCalendar.Modal.init();
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
    areInputsFilled: function () {
        let isFilled = true;
        this.orderFormInput.forEach(function (inputName) {
            let value = $('#orderForm input[name="' + inputName + '"]').val().trim();
            if (value === '') {
                isFilled = false;
                // Optionally highlight the empty input
                $('#orderForm input[name="' + inputName + '"]').addClass('is-invalid');
            } else {
                // Remove highlight if filled
                $('#orderForm input[name="' + inputName + '"]').removeClass('is-invalid');
            }
        });
        return isFilled;
    }
};
let CalendarFunctions = {
    Calendar: {
        hasEventBeenDragged: false,
        hasEventBeenResized: false,
        cellTooltip: null,
        eventTooltip: null,
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
                events: [],
                eventDidMount: function (info) {
                    if (!CalendarFunctions.Calendar.hasEventBeenResized) {
                        if (info.event.extendedProps.type_custom === "trampolineEvent") {
                            info.el._tippy = tippy(info.el, {
                                content: 'Jei norite pasirinkti daugiau dienų, paspauskite ir vilkite dešinę "Jūsų užsakymas" pusę per kalendorių',
                                placement: 'top',
                                arrow: true,
                                theme: 'light'
                            });
                        }
                    }
                },
                eventDragStart: function (info) {
                    CalendarFunctions.Calendar.hasEventBeenDragged = true;
                    // Destroy tooltips on cells, not on the event being dragged
                    document.querySelectorAll('.fc-daygrid-day').forEach(cell => {
                        if (cell._tippy) {
                            cell._tippy.destroy();
                            delete cell._tippy;
                        }
                    });
                },
                eventResizeStart: function (info) {
                    // Only destroy the tooltip when resizing the event
                    CalendarFunctions.Calendar.hasEventBeenResized = true
                    if (info.el._tippy) {
                        info.el._tippy.destroy();
                        delete info.el._tippy;
                    }
                },
                eventDragStop: function (info) {
                    // Update tooltip content after drag
                    if (!CalendarFunctions.Calendar.hasEventBeenResized) {
                        if (info.el._tippy) {
                            info.el._tippy.setContent('Jei norite pasirinkti daugiau dienų, paspauskite ir vilkite dešinę "Jūsų užsakymas" pusę per kalendorių');
                        }
                    }
                },
                dateClick: function (info) {
                    // Only show tooltip if no event has been dragged since page load
                    if (!CalendarFunctions.Calendar.hasEventBeenDragged) {
                        if (info.dayEl._tippy) {
                            info.dayEl._tippy.destroy();
                            delete info.dayEl._tippy;
                        }

                        info.dayEl._tippy = tippy(info.dayEl, {
                            content: 'Jei norite pasirinkti užsakymo dieną, spauskite ir vilkite mėlyna ' +
                                'eilutę pavadinimu "Jūsų užsakymas" per kalendorių',
                            showOnCreate: true,
                            trigger: 'manual',
                            placement: 'top',
                            arrow: true,
                            onHidden(instance) {
                                instance.destroy();
                                delete info.dayEl._tippy;
                            }
                        });
                    }
                },
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
                if (PcCalendar) {
                    flatPickerTime.initialize(response.minTime, response.maxTime);
                    this.Calendar.calendar.removeAllEvents();
                    this.addEvent(Occupied);
                    this.addEvent(Availability);
                    if (isFirstLoad && Availability.length > 0) {
                        let firstAvailableDate = new Date(Availability[0].start);
                        let availableMonth = firstAvailableDate.getMonth();
                        let currentMonth = new Date(firstMonthDay).getMonth();
                        if (availableMonth > currentMonth) {
                            isNavigating = true;
                            skippedMonth = new Date(firstMonthDay).getMonth();
                            this.Calendar.calendar.next();

                            let newCalendarView = this.Calendar.calendar.view;
                            let newFirstDayMonth = new Date(newCalendarView.currentStart);
                            newFirstDayMonth.setUTCHours(newFirstDayMonth.getUTCHours() + 3);
                            let firstMonthDayNew = newFirstDayMonth.toISOString().split('T')[0];

                            this.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDayNew);

                            isNavigating = false;
                        }
                        isFirstLoad = false;
                    }
                }
                if (mobileCalendar) {
                    let disabledDates = CalendarFunctions.processOccupiedDates(response.Occupied);
                    if (!PickerInitialized) {
                        flatPickerTime.initialize(response.minTime, response.maxTime);
                        flatPickerCalendar.initialize(disabledDates);
                        PickerInitialized = true;
                    } else {
                        flatPickerCalendar.updateDisabledDates(disabledDates);
                    }
                    flatPickerCalendar.overrideMonthNames(); // Reapply month names after update
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
//@todo Add time picker and calendar picker into one class
let flatPickerTime = {
    initialize: function (minTime, maxTime) {
        $('#customerDeliveryTime').flatpickr({
            enableTime: true, // Enable time picker
            noCalendar: true, // Hide calendar
            disableMobile: "true",
            dateFormat: "H:i", // Format displayed time (24-hour)
            time_24hr: true, // Use 24-hour time format
            minTime: minTime,
            maxTime: maxTime,
        })
    }
}
let flatPickerCalendar = {
    disabledDaysArray: [],
    monthChangeTo: 0,
    initialMonth: 0,
    flatPickerRangeStart: 0,
    flatPickerRangeEnd: 0,
    monthNames: {
        "January": "Sausis",
        "February": "Vasaris",
        "March": "Kovas",
        "April": "Balandis",
        "May": "Gegužė",
        "June": "Birželis",
        "July": "Liepa",
        "August": "Rugpjūtis",
        "September": "Rugsėjis",
        "October": "Spalis",
        "November": "Lapkritis",
        "December": "Gruodis"
    },
    initialize: function (disabledDates) {
        flatPickerCalendar.disabledDaysArray = disabledDates;
        flatPicker = $('#flatPickerCalendar').flatpickr({
            mode: 'range',
            dateFormat: 'Y/m/d',
            minDate: "today",
            disable: flatPickerCalendar.disabledDaysArray,
            onChange: function (selectedDates, dateStr, instance) {
                console.log('disabled days: ', flatPickerCalendar.disabledDaysArray);
                console.log('patekom i on change');
                flatPickerCalendar.overrideMonthNames();
                if (selectedDates.length === 2) {
                    console.log('Selected dates:', selectedDates);

                    let startDate = selectedDates[0];
                    let endDate = selectedDates[1];
                    let isValidRange = true;

                    console.log('Start date:', startDate);
                    console.log('End date:', endDate);

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
                        flatPickerCalendar.Modal.element.show();
                        $('#disabledDatesModal').on('hidden.bs.modal', function () {
                            instance.clear();
                            instance.changeMonth(flatPickerCalendar.monthChangeTo, true);
                        });
                        setTimeout(() => {
                            flatPickerCalendar.overrideMonthNames();
                        }, 100);
                    } else {
                        Trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = formattedStartDate;
                            Trampoline.rental_end = formattedEndDate;
                        });
                        flatPickerCalendar.flatPickerRangeStart = formattedStartDate;
                        flatPickerCalendar.flatPickerRangeEnd = formattedEndDate;
                        setTimeout(() => {
                            flatPickerCalendar.overrideMonthNames();
                        }, 100);
                    }
                }
            },
            onMonthChange: function (selectedDates, dateStr, instance) {
                flatPickerCalendar.monthChangeTo = instance.currentMonth - flatPickerCalendar.initialMonth;
                console.log('current month: ', instance.currentMonth);
                console.log('initial month: ', flatPickerCalendar.initialMonth);
                console.log('month change to: from initial + ', flatPickerCalendar.monthChangeTo);
                flatPickerCalendar.logVisibleDays(); // Log the visible days when the month changes
                CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);

                // Use a timeout to ensure the calendar container is available
                setTimeout(() => {
                    if (flatPicker.calendarContainer) {
                        flatPickerCalendar.overrideMonthNames();
                    } else {
                        console.error('Calendar container not found after timeout');
                    }
                }, 100);
            },
            onOpen: function (selectedDates, dateStr, instance) {
                if (!isFirstMonthCaptured) {
                    flatPickerCalendar.initialMonth = instance.currentMonth;
                    isFirstMonthCaptured = true;
                }
            },
            onReady: function (selectedDates, dateStr, instance) {
                // Use a timeout to ensure the calendar container is available
                setTimeout(() => {
                    if (flatPicker.calendarContainer) {
                        flatPickerCalendar.overrideMonthNames();
                        flatPickerCalendar.updateInputText(); // Ensure correct text on ready
                    } else {
                        console.error('Calendar container not found on ready');
                    }
                }, 100);
            },
            onValueUpdate: function (selectedDates, dateStr, instance) {
                flatPickerCalendar.updateInputText(); // Update input text when value changes
            }
        });
    },
    updateInputText: function () {
        const inputField = document.querySelector('#orderForm input[name=flatPickerCalendar]');
        if (inputField) {
            console.log('Input field:', inputField);
            inputField.value = inputField.value.replace(/to/g, '-');
        }
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
        const daysContainer = flatPicker.calendarContainer?.querySelector('.flatpickr-days');
        if (!daysContainer) {
            console.error('Days container not found');
            return;
        }

        const allDayElements = daysContainer.querySelectorAll('.flatpickr-day');

        let firstVisibleDayElement = null;
        let lastVisibleDayElement = null;

        allDayElements.forEach(dayElement => {
            if (dayElement.classList.contains('prevMonthDay') && dayElement.classList.contains('nextMonthDay')) {
                if (!firstVisibleDayElement) {
                    firstVisibleDayElement = dayElement;
                }
                lastVisibleDayElement = dayElement;
            }
        });

        if (!firstVisibleDayElement) {
            firstVisibleDayElement = daysContainer.querySelector('.flatpickr-day:not(.nextMonthDay)');
        }

        if (!lastVisibleDayElement) {
            const allDayElementsArray = Array.from(allDayElements);
            lastVisibleDayElement = allDayElementsArray[allDayElementsArray.length - 1];
        }

        const formatDate = (dateLabel, isLastVisibleDay) => {
            const date = new Date(dateLabel);
            date.setHours(date.getHours() + 3);
            if (isLastVisibleDay) {
                date.setDate(date.getDate() + 1);
            }
            return date.toISOString().split('T')[0];
        };

        const firstDateLabel = firstVisibleDayElement?.getAttribute('aria-label');
        const lastDateLabel = lastVisibleDayElement?.getAttribute('aria-label');

        if (firstDateLabel && lastDateLabel) {
            const formattedFirstDate = formatDate(firstDateLabel, false);
            const formattedLastDate = formatDate(lastDateLabel, true);

            firstVisibleDayOnCalendar = formattedFirstDate;
            lastVisibleDayOnCalendar = formattedLastDate;
            firstMonthDay = formattedFirstDate;
        } else {
            console.error('Could not find date labels for visible days');
        }
    },
    updateDisabledDates: function (newDisabledDates) {
        flatPickerCalendar.disabledDaysArray = newDisabledDates;
        flatPicker.set('disable', newDisabledDates);
    },
    overrideMonthNames: function () {
        const calendarContainer = flatPicker.calendarContainer;
        if (!calendarContainer) {
            console.error('Calendar container not found');
            return;
        }

        const monthElements = calendarContainer.querySelectorAll('.flatpickr-monthDropdown-month');
        monthElements.forEach((el) => {
            const englishMonthName = el.textContent.trim();
            const lithuanianMonthName = flatPickerCalendar.monthNames[englishMonthName];
            if (lithuanianMonthName) {
                el.textContent = lithuanianMonthName;
            }
        });
    },
    Modal: {
        init: function () {
            this.Events.init();
        },
        element: new bootstrap.Modal('#disabledDatesModal'),
        Events: {
            init: function () {
                $('#disabledDatesModal .closeModal').on('click', function (event) {
                    flatPickerCalendar.Modal.element.hide();
                });
            }
        }
    }
};


let TrampolineOrder = {
    init: function () {
        this.FormSendOrder.init();
        // this.UpdateOrder.init();
        this.ViewOrderModal.init()
        // this.FormSendOrder.checkFormValidity(); // Initial check
    },
    FormSendOrder: {
        init: function () {
            this.Event.init();
        },
        dataForm: {
            element: $('#sendOrderColumn form'),
        },
        // checkFormValidity: function () {
        //     let isValid = true;
        //     $('#orderForm input[required]:visible').each(function () {
        //         if ($(this).val().trim() === '') {
        //             isValid = false;
        //             return false;
        //         }
        //     });
        //     $('#viewOrderButton').prop('disabled', !isValid);
        // },
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
                    event.preventDefault();
                    if (Variables.areInputsFilled()) {
                        // console.log('visi uzpildyti')
                        TrampolineOrder.ViewOrderModal.element.show();
                    }
                });
                // $('#orderForm input, #orderForm select').on('input change', function () {
                //     TrampolineOrder.FormSendOrder.checkFormValidity();
                // });
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
                        if (!response.failed_input.error) {
                            console.log('patekom i failed input vieta')
                            TrampolineOrder.ViewOrderModal.element.hide()
                            $('form input').removeClass('is-invalid');
                            Object.keys(response.failed_input).forEach(function (FailedInput) {
                                $('form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                                $('form input[name=' + FailedInput + ']').addClass('is-invalid');
                            });
                        } else if (response.failed_input.error && response.failed_input.error[0] !== 'Batutas neaktyvus, prašome pasirinkti kitą') {
                            TrampolineOrder.ViewOrderModal.element.hide()
                            $('#failedAlertMessage').text(response.failed_input.error[0]);
                            $('#failedAlert').show().css('display', 'flex');
                            TrampolineOrder.Events.dismissAlertsAfterTimeout('#failedAlert', 5000);
                            CalendarFunctions.updateEventsPublic(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                        } else {
                            $('#failedAlertMessage').text(response.failed_input.error[0]);
                            $('#failedAlert').show().css('display', 'flex');
                            TrampolineOrder.Events.dismissAlertsAfterTimeout('#failedAlert', 5000);
                            setTimeout(function () {
                                window.location.href = response.homeLink;
                            }, 2000);
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
                $('#viewOrderModalButtons .closeView').on('click', function (event) {
                    console.log('paclickinom')
                    event.preventDefault();
                    TrampolineOrder.ViewOrderModal.element.hide()
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
                    startDate = new Date(flatPickerCalendar.flatPickerRangeStart);
                    endDate = new Date(flatPickerCalendar.flatPickerRangeEnd);
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

                    // Preserve the Euro sign and format the total price
                    $(this).find('.trampoline-price').text(`${totalPrice.toFixed(2)}${Currency}`); // Ensure currency variable is defined and contains '€'

                    totalSum += totalPrice;
                });

                // Calculate and update advance and final payments
                const advancePayment = Math.round((totalSum * AdvancePercentage) / 10) * 10;
                const finalPayment = totalSum - advancePayment;
                $('#advance-payment').text(`${advancePayment.toFixed(2)}${Currency}`);
                $('#final-payment').text(`${finalPayment.toFixed(2)}${Currency}`);
                $('#reservation-dates').text(`${startDate.toISOString().split('T')[0]} ${reservationDays > 1 ? `- ${endDate.toISOString().split('T')[0]}` : ''}`);
                $('#reservation-label').text(`Rezervuotos dienos${reservationDays > 1 ? 's' : 'a'}:`);
            }

        }
    },
    Events: {
        dismissAlertsAfterTimeout: function (alertId, timeout) {
            setTimeout(function () {
                $(alertId).fadeOut('slow', function () {
                    $(this).css('display', 'none')
                });
            }, timeout);
        }
    }
}

/* Document ready function */
$(document).ready(function () {
    console.log("/js/trampolines/public/order_public.js -> ready!");
    showCalendar.showCalendar()
    TrampolineOrder.init();
    // ToolTip.init()
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





