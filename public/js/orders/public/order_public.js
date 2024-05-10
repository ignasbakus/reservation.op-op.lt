    let Variables = {
        orderFormInput: [
            'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity', 'customerDeliveryPostCode', 'customerDeliveryAddress'
        ],
        getOrderFormInputs: function () {
            let values = {}
            this.orderFormInput.forEach(function (inputName) {
                values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
            });
            /*Get params from Calendar about event start<>end date*/
            /*For now added in static way*/
            // @todo Ideti drop starta ir drop enda. Kolkas neveikia
            Trampolines.forEach(function (Trampoline){
                Trampoline.rental_start = Calendar.dropStart;
                Trampoline.rental_end = Calendar.dropEnd;
            })
            values.trampolines = Trampolines
            return values;
        }
    }
    let Calendar = null;
    document.addEventListener('DOMContentLoaded', function() {
        Calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialDate: Dates.CalendarInitial,
            editable: true,
            selectable: true,
            // businessHours: true,
            dayMaxEvents: true,
            events: [],
            eventAllow: function(dropInfo, draggedEvent) {
                let CouldBeDropped = true;
                let dropStart = new Date(dropInfo.start);
                let dropEnd = new Date(dropInfo.end);
                Occupied.forEach(function (Occupation) {
                    let OccupationStart = new Date(Occupation.start);
                    let OccupationEnd = new Date(Occupation.end);
                    if ((dropStart >= OccupationStart && dropStart < OccupationEnd) || (dropEnd > OccupationStart && dropEnd <= OccupationEnd) || (dropStart <= OccupationStart && dropEnd >= OccupationEnd)) {
                        console.log('Occupied!');
                        CouldBeDropped = false;
                        return false;
                    }
                });
                Calendar.dropStart = dropStart;
                Calendar.dropEnd = dropEnd;
                return CouldBeDropped;
            }
        });
        Calendar.render();
        addOccupied()
        addEvent()
    })
    function addOccupied () {
        Occupied.forEach(function (Occupation){
            if (Occupation.type_custom === 'occ') {
                Occupation.editable = false
            }
            Calendar.addEvent(Occupation)
        })
    }
    function addEvent () {
        Events.forEach(function (Event){
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
                    })
                }
            }
        }
    }
    $(document).ready(function () {
        console.log("/js/trampolines/public/order_public.js -> ready!");
        TrampolineOrder.init()
    });
