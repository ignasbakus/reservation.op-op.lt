let Variables = {
    orderFormInput: [
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity', 'customerDeliveryPostCode', 'customerDeliveryAddress'
    ],
    getOrderFormInputs: function () {
        let values = {}
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
        });
        values.trampolines = Trampolines
        values.firstVisibleDay = firstVisibleDayOnCalendar
        values.lastVisibleDay = lastVisibleDayOnCalendar

        // values.targetDateEnd = TargetDate.getTargetDate(globalDropInfo)
        console.log('Trampolines orderPublic=>', Trampolines)
        console.log(values)
        return values;
    },
    getTrampolines: function () {
        return Trampolines
    }
}
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let Calendar = null;
let today = new Date();
today.setHours(0, 0, 0, 0);
today = today.toISOString().split('T')[0];
let lastUpdatedMonth = new Date().getMonth();
let isEventDrop = false; // Flag to prevent double updates

document.addEventListener('DOMContentLoaded', function () {
    Calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        initialDate: Dates.CalendarInitial,
        locale: 'lt',
        editable: true,
        selectable: true,
        eventDrop: function (dropInfo) {
            isEventDrop = true
            let droppedDate = dropInfo.event.start;
            let currentMonth = Calendar.getDate().getMonth();
            let droppedMonth = droppedDate.getMonth();

            console.log('Dropped date =>', droppedDate)
            console.log('Dropped month =>', droppedMonth)
            console.log('current month =>', currentMonth)

            if (droppedMonth < currentMonth) {
                Calendar.prev();
                updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
            } else if (droppedMonth > currentMonth && droppedMonth > lastUpdatedMonth) {
                lastUpdatedMonth = droppedMonth;
                Calendar.next();
                updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar);
            }
        },
        eventChange: function (changeInfo) {
            let newStartDate = new Date(changeInfo.event.start);
            if (newStartDate < new Date(today)) {
                changeInfo.revert();
            }
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
            if (!isEventDrop) {
                updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar);
            }
            isEventDrop = false;
        },
        eventAllow: function (dropInfo, draggedEvent) {
            let CouldBeDropped = true;
            let dropStart = new Date(dropInfo.startStr);
            let dropEnd = new Date(dropInfo.endStr);

            Occupied.forEach(function (Occupation) {
                let OccupationStart = new Date(Occupation.start);
                let OccupationEnd = new Date(Occupation.end);
                if ((dropStart >= OccupationStart && dropStart < OccupationEnd) || (dropEnd > OccupationStart && dropEnd <= OccupationEnd) || (dropStart <= OccupationStart && dropEnd >= OccupationEnd)) {
                    CouldBeDropped = false;
                    return false;
                }
            });
            Trampolines.forEach(function (Trampoline) {
                draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline) {
                    if (Trampoline.id === AffectedTrampoline.id) {
                        Trampoline.rental_start = dropInfo.startStr
                        Trampoline.rental_end = dropInfo.endStr
                    }
                })
            })
            return CouldBeDropped;
        },
        eventTimeFormat: { /*like 14:30:00*/
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }
    });
    Calendar.render();
    // updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar);


    // addEvent(Occupied)
    // addEvent(Availability)
})

function addEvent(EventsToAdd) {
    EventsToAdd.forEach(function (Event) {
        Calendar.addEvent(Event)
    });
}

function updateEvents(targetStartDate, targetEndDate) {
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
            Calendar.removeAllEvents()
            addEvent(Occupied)
            Availability = response.Availability
            addEvent(Availability)
        }
    }).always((instance) => {
        // console.log("always => response : ", instance);
    });
}

let TrampolineOrder = {
    init: function () {
        this.FormSendOrder.Event.init()
    },
    FormSendOrder: {
        dataForm: {
            element: $('#sendOrderColumn form')
        },
        Event: {
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
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    method: "POST",
                    url: "/orders/public/order",
                    data: Variables.getOrderFormInputs(),
                    // targetDate: targetDate
                }).done((response) => {
                    if (response.status === false) {
                        $('form input').removeClass('is-invalid');
                        Object.keys(response.failed_input).forEach(function (FailedInput) {
                            $('form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                            $('form input[name=' + FailedInput + ']').addClass('is-invalid');
                        })
                    }

                    if (response.status) {
                        $('form input[type=text], form input[type=number], #createTrampolineModal form textarea').val('');
                        $('form input').removeClass('is-invalid');
                    }
                    /*Renew fullcalendar occupation*/
                    Occupied = response.Occupied
                    console.log('Occupied create =>', Occupied)
                    if (response.status) {
                        Calendar.removeAllEvents()
                        addEvent(Occupied)
                        Availability = response.Events
                        addEvent(Availability)
                    } else {
                        Calendar.getEvents().forEach(function (event) {
                            if (event.extendedProps.type_custom === 'occ') {
                                event.remove();
                            } else {
                                event.setProp('backgroundColor', '#808000')
                                event.setProp('title', 'Neužsakyta')
                            }
                        });
                        addEvent(Occupied)
                    }
                });
            }
        }
    }
}

$(document).ready(function () {
    console.log("/js/trampolines/public/order_public.js -> ready!");
    TrampolineOrder.init()
});
