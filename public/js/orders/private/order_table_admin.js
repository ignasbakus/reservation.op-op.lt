/* Global variables */
let firstVisibleDayOnCalendar;
let lastVisibleDayOnCalendar;
let isEventDrop = false;
let isCancelButtonClicked = false;
let modalPopulated = false;
let trampolineID;
let defaultTime;
let eventDay
let trampolines;
let firstMonthDay;
let today = new Date();
today.setHours(0, 0, 0, 0);
today.setHours(today.getHours() + 3);
today = today.toISOString().split('T')[0];
let isWeeklyFilterActive = false;

/* JS classes */
let Variables = {
    orderFormInput: [
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity',
        'customerDeliveryPostCode', 'customerDeliveryAddress', 'customerDeliveryTime'
    ],
    getOrderFormInputs: function (ModalID) {
        let values = {}
        this.orderFormInput.forEach(function (inputName) {
            values[inputName] = $('#' + ModalID + ' input[name=' + inputName + ']').val()
        })
        values.trampolines = trampolines
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
                    let droppedDate = dropInfo.event.start;
                    let currentMonth = this.getDate().getMonth();
                    let droppedMonth = droppedDate.getMonth();
                    if (droppedMonth < currentMonth) {
                        this.prev();
                    } else if (droppedMonth > currentMonth) {
                        this.next();
                    }
                    isEventDrop = false
                },
                datesSet: function (info) {
                    let firstDayMonth = new Date(info.view.currentStart)
                    let firstCalendarVisibleDate = info.start
                    let lastCalendarVisibleDate = info.end
                    FormatDays.formCorrectFirstVisibleDay(firstCalendarVisibleDate);
                    FormatDays.formCorrectLastVisibleDay(lastCalendarVisibleDate);
                    FormatDays.formCorrectFirstMonthDay(firstDayMonth)
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

                    console.log('Occupied =>', Occupied)

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
                        console.log('Trampolines => ', trampolines)
                        trampolines.forEach(function (Trampoline) {
                            draggedEvent.extendedProps.trampolines.forEach(function (AffectedTrampoline) {
                                if (Trampoline.id === AffectedTrampoline.id) {
                                    Trampoline.rental_start = dropInfo.startStr;
                                    Trampoline.rental_end = dropInfo.endStr;
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
        });
    },
    addEvent: function (EventsToAdd) {
        EventsToAdd.forEach(function (Event) {
            CalendarFunctions.Calendar.calendar.addEvent(Event)
        });
    }
}
let flatPicker = {
    initialize: function () {
        $('#customerDeliveryTime').flatpickr({
            enableTime: true, // Enable time picker
            noCalendar: true, // Hide calendar
            dateFormat: "H:i", // Format displayed time (24-hour)
            time_24hr: true, // Use 24-hour time format
            defaultDate: defaultTime
        })
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
            if (isWeeklyFilterActive) {
                let currentDate = new Date();
                let nextWeekDate = new Date();
                currentDate.setHours(currentDate.getHours() + 3); // Adjust for Lithuanian time zone
                nextWeekDate.setDate(currentDate.getDate() + 7);
                nextWeekDate.setHours(nextWeekDate.getHours() + 3); // Adjust for Lithuanian time zone
                d.start_date = currentDate.toISOString().split('T')[0];
                d.end_date = nextWeekDate.toISOString().split('T')[0];
            }

            d.searchValue = d.search.value || '';

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
                searchDelay     : 1000,
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
                        return json.DATA || []; // Ensure DATA is an array
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
                    {title: "Užsakymo<br>Numeris", orderable: false},
                    {title: "Užsakymo data", orderable: false},
                    {title: "Užsakytas batutas", orderable: false},
                    {title: "Užsakyta <br> nuo-iki"},
                    {title: "Pristatymo <br> laikas", orderable: false},
                    {title: "Klientas", orderable: false},
                    {title: "Elektroninis paštas <br> ir Telefonas", orderable: false},
                    // {title: "Telefonas", orderable: false},
                    {title: "Adresas", orderable: false},
                    {title: "Nuomos<br>trukmė", orderable: false},
                    {title: "Bendra<br>suma", orderable: false},
                    {title: "Avanso<br>suma", orderable: false},
                    {title: "Užsakymo<br>būsena", orderable: false},
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
                            $('#successAlertMessage').text('Užsakymai ištrinti')
                            $('#successAlert').show().css('display', 'flex')
                            Orders.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
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
                $('#showWeeklyOrders').on('change', function () {
                    isWeeklyFilterActive = $(this).is(':checked');
                    Orders.Table.Table.draw();
                });

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
                            Orders.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
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
                        Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
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
                },
                customerDeliveryTime: {
                    set: function (Value) {
                        $('#updateOrderModal input[name=customerDeliveryTime]').val(Value)
                    }
                },
            },
            fillDataForm: function (BackendResponse) {
                this.dataForm.customerName.set(BackendResponse.client.name)
                this.dataForm.customerSurname.set(BackendResponse.client.surname)
                this.dataForm.customerPhoneNumber.set(BackendResponse.client.phone)
                this.dataForm.customerEmail.set(BackendResponse.client.email)
                this.dataForm.customerDeliveryCity.set(BackendResponse.address.address_town)
                this.dataForm.customerDeliveryPostCode.set(BackendResponse.address.address_postcode)
                this.dataForm.customerDeliveryAddress.set(BackendResponse.address.address_street)
                this.dataForm.customerDeliveryTime.set(BackendResponse.trampolines[0].delivery_time)
            },
            prepareModal: function (OrderID) {
                this.orderIdToUpdate = OrderID;
                this.element.show()
                // this.getInitialDatesCalendar()
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
                    Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
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
                        defaultTime = response.order.trampolines[0].delivery_time
                        flatPicker.initialize();
                        this.OccupiedWhenCancelled = response.Occupied
                        this.EventWhenCancelled = response.Events
                        eventDay = response.Events[0].start
                        Occupied = response.Occupied
                        this.fillDataForm(response.order)
                        trampolineID = response.TrampolinesID
                        trampolines = response.Trampolines
                        CalendarFunctions.addEvent(response.Occupied)
                        CalendarFunctions.addEvent(response.Events)
                        console.log('defaultTime => ', defaultTime)
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
                    Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
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
                    $('#updateOrderModal').on('shown.bs.modal', function () {
                        Orders.Modals.updateOrder.getInitialDatesCalendar()
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
                                    Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
                                    CalendarFunctions.Calendar.calendar.removeAllEvents()
                                    Orders.Modals.updateOrder.Events.DisplayConfirmationElement('none')
                                    Orders.Modals.updateOrder.getDataForModal()
                                }
                            })
                        }
                        if (response.status) {
                            $('#successAlertMessage').text('Užsakymas atnaujintas sėkmingai!')
                            $('#successAlert').show().css('display', 'flex')
                            Orders.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
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
                    }
                }
            }
        }
    },
    Events: {
        dismissAlertsAfterTimeout: function (alertId, timeout){
            setTimeout(function() {
                $(alertId).fadeOut('slow', function() {
                    $(this).alert('close');
                });
            }, timeout);
        }
    }
}

/* Document ready function */
$(document).ready(function () {
    Orders.init();
    console.log("/js/orders/private/order_table_admin.js -> ready!");
});
