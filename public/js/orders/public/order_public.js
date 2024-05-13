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
            return values;
        }
    }
    let Calendar = null;
    document.addEventListener('DOMContentLoaded', function() {
        Calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialDate: Dates.CalendarInitial,
            locale: 'lt',
            //timeZone: 'local',
            editable: true,
            selectable: true,
            // businessHours: true,
            dayMaxEvents: true,
            events: [],
            eventAllow: function(dropInfo, draggedEvent) {
                let CouldBeDropped = true;
                let dropStart = new Date(dropInfo.startStr);
                let dropEnd = new Date(dropInfo.endStr);
                Occupied.forEach(function (Occupation) {
                    let OccupationStart = new Date(Occupation.start);
                    let OccupationEnd = new Date(Occupation.end);
                    if ((dropStart >= OccupationStart && dropStart < OccupationEnd) || (dropEnd > OccupationStart && dropEnd <= OccupationEnd) || (dropStart <= OccupationStart && dropEnd >= OccupationEnd)) {
                        console.log('Occupied!');
                        CouldBeDropped = false;
                        return false;
                    }
                });
                Trampolines.forEach(function (Trampoline){
                    draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline){
                        if (Trampoline.id === AffectedTrampoline.id) {
                            Trampoline.rental_start = dropInfo.startStr
                            Trampoline.rental_end = dropInfo.endStr
                        }
                    })
                })
                console.log('Rental range => ',dropInfo.startStr,'<>',dropInfo.endStr)
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
    function addEvent (EventsToAdd) {
        EventsToAdd.forEach(function (Event){
            Calendar.addEvent(Event)
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
                    $('#orderForm .orderSameDay').on('change', function() {
                        if (!$(this).is(':checked')) {
                            $('.showTrampolineSelect').show().click()
                        } else {
                            $('.showTrampolineSelect').hide();
                        }
                    })
                    $('.createOrder').on('click', (event) => {
                        event.preventDefault();
                        this.addOrder()
                        console.log('veikia mygtukas')
                    })
                },
                addOrder: function() {
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "POST",
                        url: "/orders/public/order",
                        data: Variables.getOrderFormInputs()
                    }).done((response) => {
                        console.log("response : ", response);
                        console.log(Variables.getOrderFormInputs())
                        if(response.status === false) {
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
                        Calendar.removeAllEvents();
                        addEvent(Occupied)
                        Availability = response.Events
                        addEvent(Availability)
                    })
                }
            }
        }
    }
    $(document).ready(function () {
        console.log("/js/trampolines/public/order_public.js -> ready!");
        TrampolineOrder.init()
        console.log('Trampolines at init stage => ',Trampolines);
    });
