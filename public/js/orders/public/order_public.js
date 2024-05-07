    let Variables = {
        orderFormInput: [
            'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity', 'customerDeliveryPostCode', 'customerDeliveryAddress'
        ],
        getOrderFormInputs: function () {
            let values = {}
            this.orderFormInput.forEach(function (inputName) {
                values[inputName] = $('#orderForm input[name="' + inputName + '"]').val();
            });
            return values;
        }
    }

    let Calendar = null;
    let Occupied = [
        {
            id : 1,
            title: "Uzimta",
            start: '2024-05-01 00:00:00',
            end: '2024-05-11 00:00:00',
            type_custom: 'occ'
        },
        {
            id : 2,
            title: 'Uzimta',
            start: '2024-05-14 00:00:00',
            end: '2024-05-17 00:00:00',
            type_custom: 'occ'
        },
        {
            id : 3,
            title: 'Uzimta',
            start: '2024-05-26 00:00:00',
            end: '2024-05-31 00:00:00',
            type_custom: 'occ'
        },
    ];

    document.addEventListener('DOMContentLoaded', function() {
        Calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialDate: '2024-05-06',
            editable: true,
            selectable: true,
            // businessHours: true,
            dayMaxEvents: true,
            events: [
            ],
            eventAllow: function(dropInfo, draggedEvent) {
                console.log('dropInfo => ',dropInfo);
                console.log('draggedEvent => ',draggedEvent);
                console.log('draggedEvent dropInfo.start => ',dropInfo.start)
                console.log('draggedEvent dropInfo.end => ',dropInfo.end)
                let CouldBeDropped = true;
                Occupied.forEach(function (Occupation){
                    let OccupationStart = new Date(Occupation.start)
                    let OccupationEnd = new Date(Occupation.end)
                    let dropStart = new Date(dropInfo.start)
                    let dropEnd = new Date(dropInfo.end)
                    if (dropStart >= OccupationStart && dropEnd <= OccupationEnd) {
                        console.log('Occupied !');
                        CouldBeDropped = false
                    } else {
                        console.log('Available !');
                    }
                    /*if (dropStart >= OccupationStart || OccupationStart <= OccupationEnd) {
                        console.log('Occupied !');
                        CouldBeDropped = false
                    } else {
                        console.log('Available !');
                    }*/
                })
                return CouldBeDropped;
            }
        });
        Calendar.render();
        addOccupied()
        addEvent()
    })

    function addOccupied () {
        Occupied.forEach(function (Occupation){
            Occupation.title = 'Užimta'
            Occupation.backgroundColor = 'red'
            if (Occupation.type_custom === 'occ') {
                Occupation.editable = false
            }
            Calendar.addEvent(Occupation)
        })
    }

    function addEvent () {
        Calendar.addEvent(
            {
                id: 123,
                title: 'Batutas kiskutis',
                start: '2024-05-19',
                end: '2024-05-19',
            }
        )
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
                        url: "/public-order/orderSend",
                        data: Variables.getOrderFormInputs()
                    }).done((response) => {
                        console.log("response : ", response);
                        console.log(Variables.getOrderFormInputs())
                        // if (response.status === false) {
                        //
                        //     $('#createTrampolineModal form input').removeClass('is-invalid');
                        //
                        //     Object.keys(response.failed_input).forEach(function (FailedInput) {
                        //         $('#createTrampolineModal form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                        //         $('#createTrampolineModal form input[name=' + FailedInput + ']').addClass('is-invalid');
                        //     })
                        // }
                        // if (response.status) {
                        //     $('#createTrampolineModal form input[type=text], #createTrampolineModal form input[type=number], #createTrampolineModal form textarea').val('');
                        //     $('#createTrampolineModal form input').removeClass('is-invalid');
                        //     Trampolines.Modals.addTrampoline.element.hide();
                        // }
                    })
                }
            }
        }
    }

    $(document).ready(function () {
        console.log("/js/trampolines/public/order_public.js -> ready!");
        TrampolineOrder.init()
    });
