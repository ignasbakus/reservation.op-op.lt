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
let flatPicker;
let today = new Date();
today.setHours(0, 0, 0, 0);
today.setHours(today.getHours() + 3);
today = today.toISOString().split('T')[0];
let isWeeklyFilterActive = false;

/* JS classes */
let Variables = {
    orderFormInput: [
        'customerName', 'customerSurname', 'customerPhoneNumber', 'customerEmail', 'customerDeliveryCity',
        'customerDeliveryPostCode', 'customerDeliveryAddress', 'customerDeliveryTime', 'emailType', 'cancellationExcuse',
        'informClient'
    ],
    getOrderFormInputs: function (ModalID) {
        let values = {}
        this.orderFormInput.forEach(function (inputName) {
            // Simplified version of the code
            if (inputName === 'informClient' && $('#' + ModalID + ' input[name=informClient]').is(':checked')) {
                console.log('patekom i checked = true', inputName);
                values[inputName] = $('#' + ModalID + ' input[name=' + inputName + ']').val();
            } else if (inputName === 'cancellationExcuse' && $('#' + ModalID + ' input[name=informClient]').is(':checked')) {
                console.log('patekom i cancelexcuse if', inputName);
                values[inputName] = $('#' + ModalID + ' select[name=' + inputName + ']').val();
            } else if (inputName === 'emailType') {
                values[inputName] = $('#' + ModalID + ' select[name=' + inputName + ']').val();
            } else if (inputName !== 'informClient') {
                values[inputName] = $('#' + ModalID + ' input[name=' + inputName + ']').val();
            }
        })
        values.trampolines = trampolines;
        console.log('values', values)
        return values;
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
                height: 700, // Set the height in pixels
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
let flatPickerTime = {
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
let flatPickerCalendar = {
    dateRange: false,
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
    initialize: function () {
        flatPicker = $('#dateRangePicker').flatpickr({
            mode: "range",
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function (selectedDates, dateStr, instance) {
                flatPickerCalendar.overrideMonthNames();
                if (selectedDates.length === 2) {
                    // const startDate = selectedDates[0];
                    // const endDate = selectedDates[1];
                    // const newStartDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
                    // const newEndDate = new Date(endDate.getTime() + 3 * 60 * 60 * 1000);
                    // const formattedStartDate = newStartDate.toISOString().split('T')[0];
                    // const formattedEndDate = newEndDate.toISOString().split('T')[0];
                    // console.log('Start Date with +3 hours:', formattedStartDate);
                    // console.log('End Date with +3 hours:', formattedEndDate);
                    flatPickerCalendar.dateRange = true
                    Orders.Table.updateDataTable();
                }

            },
            onMonthChange: function (selectedDates, dateStr, instance) {
                setTimeout(() => {
                    if (flatPicker.calendarContainer) {
                        flatPickerCalendar.overrideMonthNames();
                    } else {
                        console.error('Calendar container not found after timeout');
                    }
                }, 100);
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
    updateInputText: function () {
        const inputField = document.querySelector('#dateForm input[name=dateRangePicker]');
        if (inputField) {
            console.log('Input field:', inputField);
            inputField.value = inputField.value.replace(/to/g, '-');
        }
    },
}
let Orders = {
    init: function () {
        this.Modals.deleteOrder.init()
        this.Modals.updateOrder.init()
        this.Modals.sendEmailModal.init()
        this.Table.init()
        this.Events.init()
    },
    Table: {
        DrawCount: 0,
        OrderList: [],
        TableElement: 'orderTable',
        Table: false,
        AXAJData: function (d) {
            d._token = $('meta[name="csrf-token"]').attr('content');
            d.sample_data = 1;

            if (flatPickerCalendar.dateRange) {
                const dateRange = flatPicker.selectedDates
                if (dateRange.length === 2) {
                    const startDate = dateRange[0];
                    const endDate = dateRange[1];
                    const newStartDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
                    const newEndDate = new Date(endDate.getTime() + 3 * 60 * 60 * 1000);
                    d.start_date = newStartDate.toISOString().split('T')[0];
                    d.end_date = newEndDate.toISOString().split('T')[0];
                }
            }

            d.searchValue = d.search.value || '';

            return d;
        },
        init: function () {
            this.Table = new DataTable('#orderTable', {
                pagingType: "full_numbers",
                pageLength: 5,
                // paging: true,
                lengthMenu: [[5, 10, 15, 20, 30], [5, 10, 15, 20, 30]],
                processing: true,
                filter: true,
                responsive: true,
                language: {
                    search: "_INPUT_", searchPlaceholder: "Ieškoti",
                    lengthMenu: "Rodyti _MENU_ įrašus",
                    zeroRecords: 'Nerasta jokių įrašų'
                },
                searchDelay: 1000,
                order: [],
                serverSide: true,
                ajax: {
                    url: '/orders/admin/order/datatable/get',
                    type: 'POST',
                    dataType: 'json',
                    data: function (d) {
                        console.log('Sending data:', d);
                        console.log('Start date: ', d.start_date)
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
                    {title: "Užsakymo data", orderable: true},
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
                    {title: "Užsakymo<br>būsena", orderable: false, width: "6%"},
                    {title: "Valdymas", orderable: false, width: "7%"}
                ],
                bAutoWidth: false,
                fixedColumns: true,
                info: false,
                initComplete: function () {
                    toolTip.initTable();
                }
            })
            this.Events.init()
        },
        initEventsAfterReload: function () {
            $('#orderTable .orderDelete').on('click', (event) => {
                event.stopPropagation()
                this.Events.removeOrder($(event.currentTarget).data('orderid'), $(event.currentTarget).data('ordernumber'))
            })
            $('#orderTable .orderUpdate').on('click', (event) => {
                event.stopPropagation()
                this.Events.updateOrder($(event.currentTarget).data('orderid'))
            })
            $('#orderTable .checkOrderStatus').on('click', (event) => {
                event.stopPropagation()
                this.Events.checkOrderStatus($(event.currentTarget).data('orderid'))
            })
            $('#orderTable .sendMail').on('click', (event) => {
                event.stopPropagation()
                this.Events.sendEmail($(event.currentTarget).data('orderid'))
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
                        url: "/orders/admin/order/deleteAllOrders",
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status) {
                            $('#successAlertMessage').text(response.Messages[0])
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
            removeOrder: function (OrderID, OrderNumber) {
                Orders.Modals.deleteOrder.prepareModal(OrderID, OrderNumber)
            },
            updateOrder: function (OrderID) {
                Orders.Modals.updateOrder.prepareModal(OrderID)
            },
            checkOrderStatus: function (OrderID) {
                $('#overlay').css('display', 'flex')
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    method: "GET",
                    url: "/status",
                    data: {
                        OrderId: OrderID
                    }
                }).done((response) => {
                    $('#overlay').hide();
                    console.log('AJAX Response:', response);

                    if (response.status === 'changed' || response.status === 'unchanged') {
                        $('#successAlertMessage').text(response.message);
                        $('#successAlert').show().css('display', 'flex');
                        Orders.Events.dismissAlertsAfterTimeout('#successAlert', 5000);

                        // If the table needs to be updated
                        if (response.status === 'changed') {
                            Orders.Table.Table.draw();
                        }
                    }
                    if (!response.status) {
                        $('#failedAlertMessage').text(response.message);
                        $('#failedAlert').show().css('display', 'flex');
                        Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000);
                    }
                }).fail((jqXHR) => {
                    $('#overlay').hide();
                })
            },
            sendEmail: function (OrderID) {
                Orders.Modals.sendEmailModal.prepareModal(OrderID)
            }
        },
        updateDataTable: function () {
            $('#orderTable').DataTable().ajax.url('/orders/admin/order/datatable/get').load();
            // $('#orderTable').DataTable().ajax.params({
            //     start_date: startDate,
            //     end_date: endDate
            // });
        }
    },
    Modals: {
        deleteOrder: {
            orderIdToDelete: 0,
            element: new bootstrap.Modal('#removeOrderModal'),
            prepareModal: function (OrderID, OrderNumber) {
                this.orderIdToDelete = OrderID
                $('#removeOrderModal .modal-body .editable').html('Ar tikrai norite ištrinti užsakymą Nr: "' + OrderNumber + '"?')
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
                    $('#removeOrderModal .informClient').on('change', (event) => {
                        event.stopPropagation()
                        if ($(event.currentTarget).is(':checked')) {
                            $('#removeOrderModal .cancellationDropdown').css('display', 'block')
                        } else {
                            $('#removeOrderModal .cancellationDropdown').css('display', 'none')
                        }
                    })
                },
                removeOrder: function (OrderID) {
                    $('#overlay').css('display', 'flex')
                    let form_data = Variables.getOrderFormInputs('removeOrderModal')
                    form_data.orderID = OrderID
                    console.log('form_data => ', form_data)
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "DELETE",
                        url: "/orders/admin/order",
                        data: form_data,
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status) {
                            $('#successAlertMessage').text('Užsakymas atšauktas')
                            $('#successAlert').show().css('display', 'flex')
                            Orders.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
                            Orders.Modals.deleteOrder.element.hide()
                            $('#removeOrderModal .informClient').prop('checked', false).trigger('change')
                        }
                        if (!response.status) {
                            $('#failedAlertMessage').text(response.message);
                            $('#failedAlert').show().css('display', 'flex');
                            Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
                            Orders.Modals.deleteOrder.element.hide()
                            $('#removeOrderModal .informClient').prop('checked', false).trigger('change')
                        }
                        Orders.Table.Table.draw()
                    }).fail((jqXHR) => {
                        $('#overlay').hide();
                        Orders.Modals.deleteOrder.element.hide()
                        $('#removeOrderModal .informClient').prop('checked', false).trigger('change')
                        // $('#removeOrderModal .cancellationDropdown').find('select').val('')
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
                    }
                    if (!response.status) {
                        this.element.hide()
                        $('#failedAlertMessage').text(response.message);
                        $('#failedAlert').show().css('display', 'flex');
                        Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
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
                        flatPickerTime.initialize();
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
                    $('#confirmationContainer .confirmChanges').on('change', (event) => {
                        if ($(event.currentTarget).is(':checked')) {
                            $(event.currentTarget).removeClass('is-invalid');
                        }
                    })
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
                        $('#confirmationContainer .confirmChanges').removeClass('is-invalid').prop('checked', false);
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
                updateOrder:

                    function () {
                        $('#overlay').css('display', 'flex')
                        let form_data = Variables.getOrderFormInputs('updateOrderModal')
                        form_data.orderID = Orders.Modals.updateOrder.orderIdToUpdate
                        form_data.firstVisibleDay = firstVisibleDayOnCalendar
                        form_data.lastVisibleDay = lastVisibleDayOnCalendar
                        console.log('form_data => ', form_data)
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
                    }

                ,
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
        },
        sendEmailModal: {
            EmailOrderId: 0,
            dataForm: {
                customerEmail: {
                    set: function (Value) {
                        $('#sendEmailModal input[name=customerEmail]').val(Value)
                    }
                }
            },
            fillDataForm: function (BackendResponse) {
                this.dataForm.customerEmail.set(BackendResponse.client.email)
            },
            getDataForModal: function () {
                $('#overlay').css('display', 'flex')
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    dataType: 'json',
                    method: "GET",
                    url: "/orders/admin/order/getOrderUpdateData",
                    data: {
                        order_id: Orders.Modals.sendEmailModal.EmailOrderId,
                        target_start_date: firstVisibleDayOnCalendar,
                        target_end_date: lastVisibleDayOnCalendar
                    }
                }).done((response) => {
                    $('#overlay').hide();
                    if (response.status) {
                        this.fillDataForm(response.order)
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
            init: function () {
                this.Events.init()
            },
            element: new bootstrap.Modal('#sendEmailModal'),
            prepareModal: function (orderID) {
                this.EmailOrderId = orderID
                this.element.show()
            },
            Events: {
                init: function () {
                    $('#sendEmailModal').on('shown.bs.modal', function () {
                        Orders.Modals.sendEmailModal.getDataForModal()
                    })
                    $('#sendEmailModal .modalClose').on('click', (event) => {
                        event.stopPropagation();
                        $('#sendEmailModal input[name=customerEmail]').val('');
                    })
                    $('#sendEmailModal .sendEmail').on('click', (event) => {
                        event.stopPropagation();
                        this.sendEmail()
                    })
                },
                sendEmail: function () {
                    $('#overlay').css('display', 'flex')
                    let form_data = Variables.getOrderFormInputs('sendEmailModal')
                    form_data.orderID = Orders.Modals.sendEmailModal.EmailOrderId
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "POST",
                        url: "/orders/admin/order/sendEmail",
                        data: form_data,
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status === false) {
                            $('#failedAlertMessage').text(response.message);
                            $('#failedAlert').show().css('display', 'flex');
                            Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
                        }
                        if (response.status) {
                            $('#successAlertMessage').text(response.message)
                            $('#successAlert').show().css('display', 'flex')
                            Orders.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
                        }
                        Orders.Modals.sendEmailModal.element.hide()
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
                        Orders.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
                    })
                }
            }
        }
    },
    Events: {
        init: function () {
            $('#clearDatesButton').on('click', (event) => {
                event.stopPropagation();
                flatPickerCalendar.dateRange = false
                flatPicker.clear()
                Orders.Table.Table.draw()
            })
        },
        dismissAlertsAfterTimeout: function (alertId, timeout) {
            setTimeout(function () {
                $(alertId).fadeOut('slow', function () {
                    $(this).css('display', 'none')
                });
            }, timeout);
        }
    }
}
let toolTip = {
    init: function () {
        tippy('#refreshTable', {
            content: 'Atnaujinti lentelę',
            placement: 'top',
        });
        tippy('#clearDatesButton', {
            content: 'Atšaukti "nuo - iki" datų filtravimą',
            placement: 'top',
        });
    },
    initTable: function () {
        tippy('#checkOrderStatus', {
            content: 'Patikrinti užsakymo būseną',
            placement: 'top',
        });
        tippy('#orderUpdate', {
            content: 'Redaguoti užsakymą',
            placement: 'top',
        });
        tippy('#sendMail', {
            content: 'Siųsti papildomą el. laišką',
            placement: 'top',
        });
        tippy('#orderDelete', {
            content: 'Ištrinti užsakymą',
            placement: 'top',
        });
    }
}

/* Document ready function */
$(document).ready(function () {
    console.log("/js/orders/private/order_table_admin.js -> ready!");
    Orders.init();
    toolTip.init()
    flatPickerCalendar.initialize()
});
