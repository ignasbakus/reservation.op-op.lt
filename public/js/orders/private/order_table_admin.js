/* Global variables */
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let isEventDrop = false;
let shouldUpdateEvents = false;
let isCancelButtonClicked = false;
let modalPopulated = false;
let trampolineID;
let eventDay
let trampolines;
let firstMonthDay;
let today = new Date();
today.setHours(0, 0, 0, 0);
today.setHours(today.getHours() + 3); // Adjust for timezone offset
today = today.toISOString().split('T')[0];

/* JS classes */
let Variables = {
    orderFormInput: [
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity', 'customerDeliveryPostCode', 'customerDeliveryAddress'
    ],
    getOrderFormInputs: function (ModalID) {
        let values = {}
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#' + ModalID + ' input[name=' + inputName + ']').val()
        })
        values.trampolines = trampolines
        console.log('trampolines admin => ', trampolines)
        console.log('Values  => ', values)
        return values
    }
}
let FormatDays = {
    formCorrectFirstVisibleDay: function (firstVisibleDay) {
        firstVisibleDay.setUTCHours(firstVisibleDay.getUTCHours() + 3)
        firstVisibleDayOnCalendar = firstVisibleDay.toISOString().split('T')[0]
    },
    formCorrectLastVisibleDay: function (lastVisibleDay) {
        lastVisibleDay.setUTCHours(lastVisibleDay.getUTCHours() + 3)
        lastVisibleDayOnCalendar = lastVisibleDay.toISOString().split('T')[0]
    },
    formCorrectFirstMonthDay: function (firstDay) {
        firstDay.setUTCHours(firstDay.getUTCHours() + 3)
        firstMonthDay = firstDay.toISOString().split('T')[0]
    }
}
let CalendarFunctions = {
    Calendar: {
        initializeCalendar: function (InitialDate) {
            this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
                initialDate: InitialDate,
                locale: 'lt',
                editable: true,
                selectable: true,
                validRange: {
                    start: today
                },
                eventDrop: function (dropInfo) {
                    isEventDrop = true;
                    shouldUpdateEvents = true;  // Set the flag to true
                    let droppedDate = dropInfo.event.start;
                    let currentMonth = this.getDate().getMonth();
                    let droppedMonth = droppedDate.getMonth();

                    console.log('Dropped date =>', droppedDate);
                    console.log('Dropped month =>', droppedMonth);
                    console.log('current month =>', currentMonth);

                    if (droppedMonth < currentMonth) {
                        this.prev();
                        CalendarFunctions.updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                    } else if (droppedMonth > currentMonth) {
                        this.next();
                        CalendarFunctions.updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay);
                    }
                    isEventDrop = false
                    shouldUpdateEvents = false

                },
                datesSet: function (info) {
                    let firstDayMonth = new Date(info.view.currentStart)
                    let firstCalendarVisibleDate = info.start
                    let lastCalendarVisibleDate = info.end
                    FormatDays.formCorrectFirstVisibleDay(firstCalendarVisibleDate);
                    FormatDays.formCorrectLastVisibleDay(lastCalendarVisibleDate);
                    FormatDays.formCorrectFirstMonthDay(firstDayMonth)


                    console.log('First calendar day => ', firstVisibleDayOnCalendar);
                    console.log('Last calendar day => ', lastVisibleDayOnCalendar);
                    console.log('first month day => ', firstMonthDay)

                    if (!isCancelButtonClicked && modalPopulated) {
                        CalendarFunctions.updateEvents(firstVisibleDayOnCalendar, lastVisibleDayOnCalendar, firstMonthDay)
                        Orders.Modals.updateOrder.Events.DisplayConfirmationElement('block')
                    }
                    isEventDrop = false;
                    isCancelButtonClicked = false;
                },
                dayMaxEvents: true,
                events: [],
                eventAllow: function (dropInfo, draggedEvent) {
                    let CouldBeDropped = true;
                    let dropStart = new Date(dropInfo.startStr);
                    let dropEnd = new Date(dropInfo.endStr);
                    let draggedEndMinusOneHour = new Date(draggedEvent.endStr)
                    let dropEndMinusOneHour = new Date(dropInfo.endStr)
                    dropEndMinusOneHour.setDate(dropEndMinusOneHour.getDate() - 1)
                    draggedEndMinusOneHour.setDate(draggedEndMinusOneHour.getDate() - 1)
                    dropEndMinusOneHour.setUTCHours(dropEndMinusOneHour.getUTCHours() + 3)
                    draggedEndMinusOneHour.setUTCHours(draggedEndMinusOneHour.getUTCHours() + 3)
                    let dropEndForDisplay = dropEndMinusOneHour.toISOString().split('T')[0]
                    let draggedEndForDisplay = draggedEndMinusOneHour.toISOString().split('T')[0]

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
                        trampolines.forEach(function (Trampoline) {
                            console.log('admin trampolines => ', trampolines)
                            draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline) {
                                if (Trampoline.id === AffectedTrampoline.id) {
                                    Trampoline.rental_start = dropInfo.startStr;
                                    Trampoline.rental_end = dropInfo.endStr;
                                    console.log('admin startStr => ', dropInfo.startStr)
                                    console.log('admin endStr => ', dropInfo.endStr)
                                    Orders.Modals.updateOrder.Events.DisplayConfirmationElement('block');
                                }
                            });
                        });
                    } else {
                        trampolines.forEach(function (Trampoline) {
                            Trampoline.rental_start = draggedEvent.startStr;
                            Trampoline.rental_end = draggedEvent.endStr;
                            Orders.Modals.updateOrder.Events.DisplayConfirmationElement('block');
                        });
                    }
                    return CouldBeDropped;
                },
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }
            });
            this.calendar.render()
            Orders.Modals.updateOrder.getDataForModal()
        },
        goToInitialDates: function () {
            this.calendar.gotoDate(eventDay);
        }
    },
    updateEvents: function (firstVisibleDay, lastVisibleDay, firstMonthDay) {
        $('#overlay').css('display', 'flex')
        $.ajax({
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            url: '/orders/admin/order/private_calendar/get',
            method: 'POST',
            data: {
                order_id: Orders.Modals.updateOrder.orderIdToUpdate,
                first_visible_day: firstVisibleDay,
                last_visible_day: lastVisibleDay,
                first_month_day: firstMonthDay
            },
        }).done((response) => {
            $('#overlay').hide();
            if (response.status) {
                this.Calendar.calendar.removeAllEvents()
                this.addEvent(response.Occupied);
                this.addEvent(response.Availability);
                trampolines = response.Trampolines
            }
        }).always((instance) => {
            // console.log("always => response : ", instance);
        });
    },
    addEvent: function (EventsToAdd) {
        EventsToAdd.forEach(function (Event) {
            CalendarFunctions.Calendar.calendar.addEvent(Event)
        });
    }
}
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
                columnDefs: [
                    {
                        targets: 10,
                        render: function (data, type, row, meta) {
                            return data === 1 ?
                                '<svg width="24" height="24" fill="green" class="bi bi-check-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"></path></svg>' :
                                '<svg width="24" height="24" fill="red" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"></path></svg>';
                        }
                    }
                ],
                drawCallback: function (settings) {
                    Orders.Table.DrawCount = settings.iDraw
                    Orders.Table.initEventsAfterReload()
                },
                rowCallback: function (row, data, index) {
                },
                createdRow: function (row, data, index) {
                },
                columns: [
                    {title: "Užsakymo<br>Numeris", orderable: false},
                    {title: "Užsakymo data"},
                    {title: "Užsakytas batutas"},
                    {title: "Klientas", orderable: false},
                    {title: "Elektroninis paštas", orderable: false},
                    {title: "Telefonas", orderable: false},
                    {title: "Adresas", orderable: false},
                    {title: "Nuomos<br>trukmė"},
                    {title: "Bendra<br>suma"},
                    {title: "Avanso<br>suma"},
                    {title: "Avanso<br>būsena", orderable: false},
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
                $('#deleteUnpaidOrders').on('click', function () {
                    $('#overlay').css('display', 'flex')
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "DELETE",
                        url: "/orders/admin/order/deleteUnpaidOrders",
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status) {
                            $('#successAlertMessage').text('Užsakymas ištrinti')
                            $('#successAlert').show().css('display', 'flex')
                        }
                        Orders.Table.Table.draw()
                    })
                    // }).fail((jqXHR) => {
                    //     $('#overlay').hide();
                    //     Orders.Modals.deleteOrder.element.hide()
                    //     let errorMessage = 'An error occurred';
                    //     if (jqXHR.responseJSON) {
                    //         errorMessage = 'Nepavyko ištrinti užsakymų: ' + jqXHR.responseJSON.message;
                    //     } else if (jqXHR.responseText) {
                    //         errorMessage = 'Nepavyko ištrinti užsakymų: ' + jqXHR.responseText;
                    //     }
                    //     $('#failedAlertMessage').text(errorMessage);
                    //     $('#failedAlert').show().css('display', 'flex');
                    // })
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
                    $('#overlay').css('display', 'flex')
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "DELETE",
                        url: "/orders/admin/order",
                        data: {
                            orderID: OrderID
                        }
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status) {
                            $('#successAlertMessage').text('Užsakymas atšauktas')
                            $('#successAlert').show().css('display', 'flex')
                            Orders.Modals.deleteOrder.element.hide()
                        }
                        Orders.Table.Table.draw()
                    }).fail((jqXHR) => {
                        $('#overlay').hide();
                        Orders.Modals.deleteOrder.element.hide()
                        let errorMessage = 'An error occurred';
                        if (jqXHR.responseJSON) {
                            errorMessage = 'Nepavyko atšaukti užsakymo: ' + jqXHR.responseJSON.message;
                        } else if (jqXHR.responseText) {
                            errorMessage = 'Nepavyko atšaukti užsakymo: ' + jqXHR.responseText;
                        }
                        $('#failedAlertMessage').text(errorMessage);
                        $('#failedAlert').show().css('display', 'flex');
                    })
                }
            }
        },
        updateOrder: {
            OccupiedWhenCancelled: '',
            EventWhenCancelled: '',
            init: function () {
                this.Events.init()
                document.getElementById('updateOrderModal').addEventListener('shown.bs.modal', event => {
                })
                document.getElementById('updateOrderModal').addEventListener('hidden.bs.modal', function () {
                    modalPopulated = false;
                });
            },
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
            prepareModal: function (OrderID) {
                this.orderIdToUpdate = OrderID;
                this.element.show()
                this.getInitialDatesCalendar()
            },
            getInitialDatesCalendar: function () {
                $('#overlay').css('display', 'flex')
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    dataType: 'json',
                    method: "GET",
                    url: "/orders/admin/order/getCalendarInitial",
                    data: {
                        order_id: Orders.Modals.updateOrder.orderIdToUpdate,
                    }
                }).done((response) => {
                    $('#overlay').hide();
                    if (response.status) {
                        CalendarFunctions.Calendar.initializeCalendar(response.Dates.CalendarInitial)
                    } else {
                        console.error("Failed to fetch data: ", response.message);
                    }
                }).fail((jqXHR) => {
                    $('#overlay').hide();
                    Orders.Modals.updateOrder.element.hide()
                    let errorMessage = 'An error occurred';
                    if (jqXHR.responseJSON) {
                        errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseJSON.message;
                    } else if (jqXHR.responseText) {
                        errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseText;
                    }
                    $('#failedAlertMessage').text(errorMessage);
                    $('#failedAlert').show().css('display', 'flex');
                })
            },
            getDataForModal: function () {
                $('#overlay').css('display', 'flex')
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
                    $('#overlay').hide();
                    if (response.status) {
                        this.OccupiedWhenCancelled = response.Occupied
                        this.EventWhenCancelled = response.Events
                        eventDay = response.Events[0].start
                        Occupied = response.Occupied
                        this.fillDataForm(response.order)
                        trampolineID = response.TrampolinesID
                        trampolines = response.Trampolines
                        CalendarFunctions.addEvent(response.Occupied)
                        CalendarFunctions.addEvent(response.Events)
                        modalPopulated = true
                        trampolines = response.Trampolines
                    } else {
                        console.error("Failed to fetch data: ", response.message);
                    }
                }).fail((jqXHR) => {
                    $('#overlay').hide();
                    Orders.Modals.updateOrder.element.hide()
                    let errorMessage = 'An error occurred';
                    if (jqXHR.responseJSON) {
                        errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseJSON.message;
                    } else if (jqXHR.responseText) {
                        errorMessage = 'Nepavyko užkrauti užsakymo: ' + jqXHR.responseText;
                    }
                    $('#failedAlertMessage').text(errorMessage);
                    $('#failedAlert').show().css('display', 'flex');
                })
            },
            Events: {
                init: function () {
                    $('#updateOrderModal .updateOrder').on('click', (event) => {
                        event.stopPropagation();
                        if ($('#confirmationContainer').css('display') === 'none') {
                            this.updateOrder();
                        } else {
                            let confirmChangesCheckbox = $('#confirmationContainer .confirmChanges');
                            if (!confirmChangesCheckbox.is(':checked')) {
                                confirmChangesCheckbox.addClass('is-invalid');
                            } else {
                                confirmChangesCheckbox.removeClass('is-invalid');
                                this.updateOrder();
                            }
                        }
                    })
                    $('#updateOrderModal .modalClose').on('click', (event) => {
                        event.stopPropagation()
                        $('#updateOrderModal form input').removeClass('is-invalid');
                        this.DisplayConfirmationElement('none')
                        CalendarFunctions.Calendar.calendar.destroy()
                        $('#updateOrderForm input').val('')
                        Orders.Table.Table.draw()
                        shouldUpdateEvents = false;
                    })
                    $('#confirmationContainer .confirmationClose').on('click', (event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        isCancelButtonClicked = true;
                        this.DisplayConfirmationElement('none')
                        CalendarFunctions.Calendar.goToInitialDates()
                        CalendarFunctions.Calendar.calendar.removeAllEvents()
                        CalendarFunctions.addEvent(Orders.Modals.updateOrder.OccupiedWhenCancelled)
                        CalendarFunctions.addEvent(Orders.Modals.updateOrder.EventWhenCancelled)
                    })
                },
                updateOrder: function () {
                    $('#overlay').css('display', 'flex')
                    let form_data = Variables.getOrderFormInputs('updateOrderModal')
                    form_data.orderID = Orders.Modals.updateOrder.orderIdToUpdate
                    form_data.firstVisibleDay = firstVisibleDayOnCalendar
                    form_data.lastVisibleDay = lastVisibleDayOnCalendar
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "PUT",
                        url: "/orders/admin/order",
                        data: form_data,
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status === false) {
                            $('#updateOrderModal form input').removeClass('is-invalid');
                            Object.keys(response.failed_input).forEach(function (FailedInput) {
                                $('#updateOrderModal form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                                $('#updateOrderModal form input[name=' + FailedInput + ']').addClass('is-invalid');
                                if (response.failed_input.error) {
                                    $('#failedAlertMessage').text(response.failed_input.error[0]);
                                    $('#failedAlert').show().css('display', 'flex');
                                    CalendarFunctions.Calendar.calendar.removeAllEvents()
                                    Orders.Modals.updateOrder.Events.DisplayConfirmationElement('none')
                                    Orders.Modals.updateOrder.getDataForModal()
                                }
                            })
                        }
                        if (response.status) {
                            $('#successAlertMessage').text('Užsakymas atnaujintas sėkmingai!')
                            $('#successAlert').show().css('display', 'flex')
                            eventDay = response.Event[0].start
                            $('#updateOrderModal form input').removeClass('is-invalid');
                            this.DisplayConfirmationElement('none')
                            CalendarFunctions.Calendar.calendar.removeAllEvents()
                            CalendarFunctions.addEvent(response.Occupied)
                            CalendarFunctions.addEvent(response.Event)
                            Orders.Modals.updateOrder.OccupiedWhenCancelled = response.Occupied
                            Orders.Modals.updateOrder.EventWhenCancelled = response.Event
                        }
                    }).fail((jqXHR) => {
                        $('#overlay').hide();
                        Orders.Modals.updateOrder.element.hide()
                        let errorMessage = 'An error occurred';
                        if (jqXHR.responseJSON) {
                            errorMessage = 'Nepavyko atnaujinti užsakymo: ' + jqXHR.responseJSON.message;
                        } else if (jqXHR.responseText) {
                            errorMessage = 'Nepavyko atnaujinti užsakymo: ' + jqXHR.responseText;
                        }
                        $('#failedAlertMessage').text(errorMessage);
                        $('#failedAlert').show().css('display', 'flex');
                    })
                },
                DisplayConfirmationElement: function (displayValue) {
                    switch (displayValue) {
                        case 'block':
                            $('#confirmationContainer').css('display', 'block');
                            break;
                        case 'none':
                            $('#confirmationContainer').css('display', 'none');
                            break;
                        default:
                            console.log('Unexpected display value: ' + displayValue);
                    }
                }
            }
        }
    }
}

/* Document ready function */
$(document).ready(function () {
    Orders.init();
    console.log("/js/orders/private/order_table_admin.js -> ready!");
});
