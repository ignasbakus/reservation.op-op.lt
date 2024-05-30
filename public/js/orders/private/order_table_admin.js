let Variables = {
    orderFormInput: [
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity', 'customerDeliveryPostCode', 'customerDeliveryAddress'
    ],
    getOrderFormInputs: function (ModalID) {
        let values = {}
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#' + ModalID + ' input[name=' + inputName + ']').val()
        })
        return values
    }
}

let FirstAndLastDays = {
    formCorrectFirstDate: function (firstVisibleDay){
        firstVisibleDay.setUTCHours(firstVisibleDay.getUTCHours() + 3)
        firstVisibleDayOnCalendar = firstVisibleDay.toISOString().split('T')[0]
    },
    formCorrectLastDay: function (lastVisibleDay){
        lastVisibleDay.setUTCHours(lastVisibleDay.getUTCHours() + 3)
        lastVisibleDayOnCalendar = lastVisibleDay.toISOString().split('T')[0]
    }
}

let today = new Date();
today.setHours(0, 0, 0, 0);
today = today.toISOString().split('T')[0];
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let isEventDrop = false;
let trampolineID;
let lastStartDate, lastEndDate;
let lastUpdatedMonth = new Date().getMonth();


let CalendarFunctions = {
    populateFullCalendar: function (){
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
                    // Orders.Modals.updateOrder.getDataForModal(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
                } else if (droppedMonth > currentMonth && droppedMonth > lastUpdatedMonth) {
                    lastUpdatedMonth = droppedMonth;
                    // Orders.Modals.updateOrder.getDataForModal(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
                    Calendar.next();
                }
                $('.confirmation-container').css('display', 'block');
            },
            eventChange: function (changeInfo) {
                let newStartDate = new Date(changeInfo.event.start);
                if (newStartDate < new Date(today)) {
                    changeInfo.revert();
                }
            },
            datesSet: function (info) {
                let firstCalendarVisibleDate = info.start;
                let lastCalendarVisibleDate = info.end;
                FirstAndLastDays.formCorrectFirstDate(firstCalendarVisibleDate)
                FirstAndLastDays.formCorrectLastDay(lastCalendarVisibleDate)
                console.log('First calendar day => ', firstVisibleDayOnCalendar);
                console.log('Last calendar day => ', lastVisibleDayOnCalendar);

                if (!isEventDrop) {
                    // Check if the new date range is different from the last one to avoid redundant requests
                    if (firstVisibleDayOnCalendar !== lastStartDate || lastVisibleDayOnCalendar !== lastEndDate) {
                        lastStartDate = firstVisibleDayOnCalendar;
                        lastEndDate = lastVisibleDayOnCalendar;
                        // Orders.Modals.updateOrder.getDataForModal(firstCalendarVisibleDate, lastCalendarVisibleDate);
                    }
                }
                isEventDrop = false; // Reset the flag after handling
            },
            dayMaxEvents: true,
            // loading: function(isLoading) {
            //     if (isLoading) {
            //         $('#loading-spinner').css('display', 'block')
            //     } else {
            //         $('#loading-spinner').css('display', 'none')
            //
            //     }
            // },
            events: [],
            eventAllow: function (dropInfo, draggedEvent) {
                let CouldBeDropped = true;
                let dropStart = new Date(dropInfo.startStr);
                let dropEnd = new Date(dropInfo.endStr);

                // Check for occupation overlap
                Occupied.forEach(function (Occupation) {
                    let OccupationStart = new Date(Occupation.start);
                    let OccupationEnd = new Date(Occupation.end);
                    if ((dropStart >= OccupationStart && dropStart < OccupationEnd) || (dropEnd > OccupationStart && dropEnd <= OccupationEnd) || (dropStart <= OccupationStart && dropEnd >= OccupationEnd)) {
                        CouldBeDropped = false;
                        return false;
                    }
                });

                // Check trampolines in the dragged event

                trampolineID.forEach(function (Trampoline) {
                    draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline) {
                        if (Trampoline.id === AffectedTrampoline.id) {
                            Trampoline.rental_start = dropInfo.startStr
                            Trampoline.rental_end = dropInfo.endStr
                        }
                    })
                });

                return CouldBeDropped;
            },
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }
        });
        Calendar.render();
        Orders.Modals.updateOrder.getDataForModal()
    },
    updateEvents: function (targetStartDate, targetEndDate){
        $.ajax({
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            url: '/orders/public/order/public_calendar/get',
            method: 'POST',
            data: {
                trampoline_id: trampolineID,
                target_start_date: targetStartDate,
                target_end_date: targetEndDate
            },
        }).done((response) => {
            Occupied = response.Occupied
            if (response.status) {
                Calendar.removeAllEvents()
                this.addEvent(Occupied)
                Availability = response.Availability
                this.addEvent(Availability)
            }
        }).always((instance) => {
            // console.log("always => response : ", instance);
        });
    },
    addEvent: function (EventsToAdd){
        EventsToAdd.forEach(function (Event) {
            console.log('Adding event:', Event);
            Calendar.addEvent(Event);
        });
    }

}
// function populateFullCalendar(Dates, Occupied, Event, Trampolines) {
//     // Initialize the FullCalendar with specified options
//     Calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
//         initialDate: Dates.CalendarInitial,
//         locale: 'lt',
//         editable: true,
//         selectable: true,
//         eventDrop: function (dropInfo) {
//             isEventDrop = true
//             let droppedDate = dropInfo.event.start;
//             let currentMonth = Calendar.getDate().getMonth();
//             let droppedMonth = droppedDate.getMonth();
//             if (droppedMonth < currentMonth) {
//                 Calendar.prev();
//                 updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar)
//             } else if (droppedMonth > currentMonth && droppedMonth > lastUpdatedMonth) {
//                 lastUpdatedMonth = droppedMonth;
//                 Calendar.next();
//                 updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar);
//             }
//         },
//         // eventChange: function(changeInfo) {
//         // },
//         dayMaxEvents: true,
//         events: [],
//         eventAllow: function (dropInfo, draggedEvent) {
//             let CouldBeDropped = true;
//             let dropStart = new Date(dropInfo.startStr);
//             let dropEnd = new Date(dropInfo.endStr);
//
//             // Check for occupation overlap
//             Occupied.forEach(function (Occupation) {
//                 let OccupationStart = new Date(Occupation.start);
//                 let OccupationEnd = new Date(Occupation.end);
//                 if ((dropStart >= OccupationStart && dropStart < OccupationEnd) || (dropEnd > OccupationStart && dropEnd <= OccupationEnd) || (dropStart <= OccupationStart && dropEnd >= OccupationEnd)) {
//                     CouldBeDropped = false;
//                     return false;
//                 }
//             });
//
//             // Check trampolines in the dragged event
//
//             Trampolines.forEach(function (Trampoline) {
//                 draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline) {
//                     if (Trampoline.id === AffectedTrampoline.id) {
//                         Trampoline.rental_start = dropInfo.startStr
//                         Trampoline.rental_end = dropInfo.endStr
//                     }
//                 })
//             });
//
//             return CouldBeDropped;
//         },
//         eventTimeFormat: {
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//             hour12: false
//         }
//     });
//     Calendar.render();
//
//     console.log('Initial Date:', Dates.CalendarInitial);
//     console.log('Occupied:', Occupied);
//     console.log('Events:', Event);
//     // Validate and add events to the calendar
//     if (Occupied && Array.isArray(Occupied)) {
//         addEvent(Occupied);
//         // console.log('Occupied events: ', Occupied)
//     } else {
//         console.error('Occupied events data is invalid:', Occupied);
//     }
//
//     if (Event && Array.isArray(Event)) {
//         addEvent(Event);
//     } else if (Event && typeof Event === 'object') {
//         addEvent([Event]);
//     } else {
//         console.error('Event data is invalid:', Event);
//     }
// }
// function updateEvents(targetStartDate, targetEndDate) {
//     $.ajax({
//         headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
//         url: '/orders/public/order/public_calendar/get',
//         method: 'POST',
//         data: {
//             trampoline_id: Variables.getTrampolines().map(t => t.id),
//             target_start_date: targetStartDate,
//             target_end_date: targetEndDate
//         },
//     }).done((response) => {
//         Occupied = response.Occupied
//         if (response.status) {
//             Calendar.removeAllEvents()
//             addEvent(Occupied)
//             Availability = response.Availability
//             addEvent(Availability)
//         }
//     }).always((instance) => {
//         // console.log("always => response : ", instance);
//     });
// }
// function addEvent(EventsToAdd) {
//     EventsToAdd.forEach(function (Event) {
//         console.log('Adding event:', Event);
//         Calendar.addEvent(Event);
//     });
// }

let Orders = {
    init: function () {
        this.Modals.deleteOrder.init()
        this.Modals.updateOrder.init()
        this.Table.init()
    },
    Table: {
        DrawCount: 0,
        OrderList: [],
        TableElement: 'orderTable',
        Table: false,
        AXAJData: function (d) {
            d._token = $('meta[name="csrf-token"]').attr('content');
            d.sample_data = 1;
            return d;
        },
        init: function () {
            this.Table = new DataTable('#orderTable', {
                pagingType: "full_numbers",
                pageLength: 5,
                lengthMenu: [[5, 10, 15, 20, 30], [5, 10, 15, 20, 30]],
                processing: true,
                filter: true,
                responsive: true,
                language: {search: "_INPUT_", searchPlaceholder: "Ieškoti"},
                //searchDelay     : 5000,
                order: [],
                serverSide: true,
                ajax: {
                    url: '/orders/admin/order/datatable/get',
                    type: 'POST',
                    dataType: 'json',
                    data: function (d) {
                        d = Orders.Table.AXAJData(d);
                    },
                    dataFilter: function (response) {
                        return JSON.stringify(jQuery.parseJSON(response));
                    },
                    dataSrc: function (json) {
                        Orders.Table.OrderList = json.list;
                        return json.DATA;
                    }
                },
                columnDefs: [],
                drawCallback: function (settings) {
                    Orders.Table.DrawCount = settings.iDraw
                    Orders.Table.initEventsAfterReload()
                },
                rowCallback: function (row, data, index) {
                },
                createdRow: function (row, data, index) {
                },
                columns: [
                    {title: "Užsakymo numeris", orderable: false},
                    {title: "Užsakymo data"},
                    {title: "Užsakytas batutas"},
                    {title: "Klientas", orderable: false},
                    // {title: "Kliento pavardė", orderable: false},
                    {title: "Elektroninis paštas", orderable: false},
                    {title: "Telefonas", orderable: false},
                    {title: "Adresas", orderable: false},
                    // {title: "Pašto kodas", orderable: false},
                    // {title: "Adresas", orderable: false},
                    {title: "Nuomos trukmė"},
                    {title: "Bendra suma"},
                    {title: "Sumokėtas avansas"},
                    {title: "Valdymas", orderable: false}
                ],
                bAutoWidth: false,
                fixedColumns: true,
                info: false,
                initComplete: function () {
                }
            })
            this.Events.init()
        },
        initEventsAfterReload: function () {
            $('#orderTable .orderDelete').on('click', (event) => {
                event.stopPropagation()
                this.Events.removeOrder($(event.currentTarget).data('orderid'))
            })
            $('#orderTable .orderUpdate').on('click', (event) => {
                event.stopPropagation()
                this.Events.updateOrder($(event.currentTarget).data('orderid'))
            })
        },
        Events: {
            init: function () {
                $('#refreshTable').on('click', function () {
                    Orders.Table.Table.draw()
                })
            },
            removeOrder: function (OrderID) {
                Orders.Modals.deleteOrder.prepareModal(OrderID)
            },
            updateOrder: function (OrderID) {
                Orders.Modals.updateOrder.prepareModal(OrderID)
            }
        }
    },
    Modals: {
        deleteOrder: {
            orderIdToDelete: 0,
            element: new bootstrap.Modal('#removeOrderModal'),
            prepareModal: function (OrderID) {
                this.orderIdToDelete = OrderID
                /*$.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    dataType: 'json',
                    method: "GET",
                    url: "/orders/admin/order",
                    data: {
                        order_id: OrderID
                    }
                }).done((response) => {
                    if (response.status) {
                        console.log('AJAX success:', response);
                    }
                })*/

                $('#removeOrderModal .modal-body .editable').html('Ar tikrai norite ištrinti užsakymą Nr: "' + OrderID + '"?')
                this.element.show()

            },
            init: function () {
                this.Events.init();
            },
            Events: {
                init: function () {
                    $('#removeOrderModal .removeOrder').on('click', (event) => {
                        event.stopPropagation()
                        this.removeOrder(Orders.Modals.deleteOrder.orderIdToDelete)
                    })
                },
                removeOrder: function (OrderID) {
                    console.log('removeOrder OrderID => ', OrderID);
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "DELETE",
                        url: "/orders/admin/order",
                        data: {
                            orderID: OrderID
                        }
                    }).done((response) => {
                        if (response.status) {
                            Orders.Modals.deleteOrder.element.hide()
                        }
                        Orders.Table.Table.draw()
                    })
                }
            }
        },
        updateOrder: {
            orderIdToUpdate: 0,
            element: new bootstrap.Modal('#updateOrderModal'),
            dataForm: {
                customerName: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerName]').val(Value)
                    }
                },
                customerSurname: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerSurname]').val(Value)
                    }
                },
                customerPhoneNumber: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerPhoneNumber]').val(Value)
                    }
                },
                customerEmail: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerEmail]').val(Value)
                    }
                },
                customerDeliveryCity: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerDeliveryCity]').val(Value)
                    }
                },
                customerDeliveryPostCode: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerDeliveryPostCode]').val(Value)
                    }
                },
                customerDeliveryAddress: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerDeliveryAddress]').val(Value)
                    }
                }
            },
            fillDataForm: function (BackendResponse) {
                this.dataForm.customerName.set(BackendResponse.client.name)
                // console.log(BackendResponse.name)
                this.dataForm.customerSurname.set(BackendResponse.client.surname)
                this.dataForm.customerPhoneNumber.set(BackendResponse.client.phone)
                this.dataForm.customerEmail.set(BackendResponse.client.email)
                this.dataForm.customerDeliveryCity.set(BackendResponse.address.address_town)
                this.dataForm.customerDeliveryPostCode.set(BackendResponse.address.address_postcode)
                this.dataForm.customerDeliveryAddress.set(BackendResponse.address.address_street)
            },
            init: function () {
                this.Events.init()
                document.getElementById('updateOrderModal').addEventListener('shown.bs.modal', event => {
                    CalendarFunctions.populateFullCalendar()
                })
            },
            prepareModal: function (OrderID) {
                this.orderIdToUpdate = OrderID;
                this.element.show()
            },
            getDataForModal: function () {
                $('#spinner').show();
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    dataType: 'json',
                    method: "GET",
                    url: "/orders/admin/order/getOrderUpdateData",
                    data: {
                        order_id: Orders.Modals.updateOrder.orderIdToUpdate,
                        target_start_date: firstVisibleDayOnCalendar,
                        target_end_date: lastVisibleDayOnCalendar
                    }
                }).done((response) => {
                    if (response.status) {
                        Occupied = response.Occupied
                        this.fillDataForm(response.order)
                        trampolineID = response.Trampolines
                        Calendar.removeAllEvents()
                        CalendarFunctions.addEvent(response.Occupied)
                        CalendarFunctions.addEvent(response.Events)
                        $('#spinner').hide();
                    } else {
                        console.error("Failed to fetch data: ", response.message);
                    }
                }).always((instance) => {
                    console.log("always => response : ", instance);
                });
            },
            // fetchFormDataAndOpenModal: function(OrderID) {
            //     // Fetch form data
            //     $.ajax({
            //         headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            //         dataType: 'json',
            //         method: "GET",
            //         url: "/orders/admin/order",
            //         data: {
            //             order_id: OrderID
            //         }
            //     }).done((response) => {
            //         console.log("done => response : ", response);
            //         console.log("done => response.trampoline : ", response.order);
            //         if (response.status) {
            //             this.fillDataForm(response.order);
            //             Orders.Modals.updateOrder.element.show();
            //         }
            //         console.log('response => ', response);
            //     }).always((instance) => {
            //         console.log("always => response : ", instance);
            //     });
            // },
            Events: {
                init: function () {
                    $('#updateOrderModal .updateOrder').on('click', (event) => {
                        event.stopPropagation()
                        this.updateOrder()
                    })
                    $('#updateOrderModal .modalClose').on('click', (event) =>{
                        event.stopPropagation()
                        console.log('Modal destroyed')
                        $('.confirmation-container').css('display', 'none');
                        Calendar.destroy()
                    })
                },
                updateOrder: function () {
                    let form_data = Variables.getOrderFormInputs('updateOrderModal')
                    form_data.orderID = Orders.Modals.updateOrder.orderIdToUpdate
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "PUT",
                        url: "/orders/admin/order",
                        data: form_data
                    }).done((response) => {
                        if (response.status === false) {
                            $('#updateOrderModal form input').removeClass('is-invalid');
                            Object.keys(response.failedInputs).forEach(function (FailedInput) {
                                $('#updateOrderModal form .' + FailedInput + 'InValidFeedback').text(response.failedInputs[FailedInput][0]);
                                $('#updateOrderModal form input[name=' + FailedInput + ']').addClass('is-invalid');
                            })
                        }
                        if (response.status) {
                            $('#updateOrderModal form input[type=text], #updateOrderModal form input[type=number], #updateOrderModal form textarea').val('');
                            $('#updateOrderModal form input').removeClass('is-invalid');
                            Orders.Modals.updateOrder.element.hide()
                            $('.confirmation-container').css('display', 'none');
                            Calendar.destroy()
                        }
                        Orders.Table.Table.draw()
                    })
                }
            }
        }
    }
}

$(document).ready(function () {
    Orders.init();
    console.log("/js/orders/private/order_table_admin.js -> ready!");
});
