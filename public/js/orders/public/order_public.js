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
        values.targetDate = TargetDate.getTargetDate(globalDropInfo)
        console.log('Trampolines orderPublic=>', Trampolines)
        console.log(values)
        return values;
    },
    getTrampolines: function () {
        return Trampolines
    }
}
let TargetDate = {
    getTargetDate: function (dropInfo) {
        if (!dropInfo || !dropInfo.event) {
            console.error('Invalid dropInfo:', dropInfo);
            return null;
        }
        console.log(dropInfo.event.start.getFullYear());
        let targetDate = new Date(dropInfo.event.start.getFullYear(), dropInfo.event.start.getMonth(), 1);
        targetDate.setUTCHours(targetDate.getUTCHours() + 3);
        return targetDate.toISOString().split('T')[0];
    }
};
let globalDropInfo;
let Calendar = null;
let today = new Date();
today.setHours(0, 0, 0, 0);
today = today.toISOString().split('T')[0];
let lastUpdatedMonth = new Date().getMonth(); // Track the last updated month

document.addEventListener('DOMContentLoaded', function () {
    Calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        initialDate: Dates.CalendarInitial,
        locale: 'lt',
        editable: true,
        selectable: true,
        eventDrop: function (dropInfo) {
            globalDropInfo = dropInfo
            let droppedDate = dropInfo.event.start;
            let currentMonth = Calendar.getDate().getMonth();
            let droppedMonth = droppedDate.getMonth();
            if (droppedMonth < currentMonth) {
                Calendar.prev();
            } else if (droppedMonth > currentMonth && droppedMonth > lastUpdatedMonth) {
                lastUpdatedMonth = droppedMonth;
                Calendar.next();
                updateEvents(TargetDate.getTargetDate(dropInfo));
            } else if (droppedMonth > currentMonth) {
                Calendar.next();
            }
        },
        eventChange: function (changeInfo) {
            let newStartDate = new Date(changeInfo.event.start);
            if (newStartDate < new Date(today)) {
                changeInfo.revert();
            }
        },
        // businessHours: true,
        dayMaxEvents: true,
        events: [],
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
    addEvent(Occupied)
    addEvent(Availability)
})

function addEvent(EventsToAdd) {
    EventsToAdd.forEach(function (Event) {
        Calendar.addEvent(Event)
    });
}

function updateEvents(targetDate) {
    $.ajax({
        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
        url: '/orders/public/order/public_calendar/get',
        method: 'POST',
        data: {
            trampoline_id: Variables.getTrampolines().map(t => t.id),
            target_date: targetDate
        },
    }).done((response) => {
        Occupied = response.Occupied
        if (response.status) {
            console.log(targetDate)
            Calendar.getEvents().forEach(function (event) {
                if (event.extendedProps.type_custom === 'trampolineEvent') {
                    event.remove();
                }
            });
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
                        Calendar.getEvents().forEach(function (event) {
                            if (event.extendedProps.type_custom === 'trampolineEvent') {
                                event.remove();
                            }
                        });
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
