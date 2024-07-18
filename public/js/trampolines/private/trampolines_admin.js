let Variables = {
    trampolineFormInput: [
        'trampolineName', 'trampolineColor', "trampolineHeight", 'trampolineLength', 'trampolineWidth', "trampolineDescription", 'trampolineActivity', 'trampolinePrice'
    ],
    getTrampolineFormInputs: function (ModalID) {
        let values = {}
        this.trampolineFormInput.forEach(function (inputName) {
            if (inputName === 'trampolineActivity') {
                values[inputName] = $('#'+ModalID+' input[name=' + inputName + ']').is(':checked')
            } else {
                values[inputName] = $('#'+ModalID+' input[name=' + inputName + ']').val()
            }
        })
        return values
    }
}
let Trampolines = {
    filterActive: false,
    filterInactive: false,
    init: function () {
        this.Modals.addTrampoline.Events.init()
        this.Modals.updateTrampoline.Events.init()
        this.Modals.deleteTrampoline.Events.init()
        this.Table.init()
        this.Events.init()
    },
    Table: {
        DrawCount: 0,
        TrampolinesList: [],
        TableElement: 'trampolineTable',
        Table: false,
        AXAJData: function (d) {
            d._token = $('meta[name="csrf-token"]').attr('content');
            d.filterActive = Trampolines.filterActive;
            d.filterInactive = Trampolines.filterInactive;
            return d;
        },
        init: function () {
            this.Table = new DataTable('#trampolineTable', {
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
                    url: '/trampolines/admin/trampoline/datatable/get',
                    type: 'POST',
                    dataType: 'json',
                    data: function (d) {
                        d = Trampolines.Table.AXAJData(d);
                    },
                    dataFilter: function (response) {
                        return JSON.stringify(jQuery.parseJSON(response));
                    },
                    dataSrc: function (json) {
                        Trampolines.Table.TrampolinesList = json.list;
                        return json.DATA || [];
                    }
                },
                columnDefs: [
                    {
                        targets: 2,
                        render: function (data, type, row, meta) {
                            return data === 1 ?
                                '<svg width="24" height="24" fill="green" class="bi bi-check-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"></path></svg>' :
                                '<svg width="24" height="24" fill="red" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"></path></svg>';
                        }
                    }
                ],
                drawCallback: function (settings) {
                    Trampolines.Table.DrawCount = settings.iDraw
                    Trampolines.Table.initEventsAfterReload()
                },
                rowCallback: function (row, data, index) {
                },
                createdRow: function (row, data, index) {},
                columns: [
                    { title: "Batutas", orderable: false, width: "10%" },
                    { title: "Aprašymas", orderable: false, width: "30%" },
                    { title: "Aktyvumas", orderable: false, width: "5%" },
                    { title: "Spalva", orderable: false, width: "7%" },
                    { title: "Aukštis", width: "7%" },
                    { title: "Plotis", width: "7%" },
                    { title: "Ilgis", width: "7%" },
                    { title: "Kaina", width: "7%" },
                    { title: "Valdymas", orderable: false, width: "15%" }
                ],
                bAutoWidth: false,
                fixedColumns: true,
                info: false,
                initComplete: function () {}
            })
            this.Events.init()
        },
        initEventsAfterReload: function () {
            $('#trampolineTable .trampolinePicture').on('click', (event) => {
                event.stopPropagation()
                this.Events.showPicture($(event.currentTarget).data('trampolineid'))
            })
            $('#trampolineTable .trampolineUpdate').on('click', (event) => {
                event.stopPropagation()
                this.Events.updateTrampoline($(event.currentTarget).data('trampolineid'))
            })
            $('#trampolineTable .trampolineDelete').on('click', (event) => {
                event.stopPropagation()
                this.Events.removeTrampoline($(event.currentTarget).data('trampolineid'))
            })
        },
        Events: {
            init: function () {
                $('#refreshTable').on('click',function (){
                    Trampolines.Table.Table.draw()
                })
            },
            showPicture: function (TrampolineID) {
                Trampolines.Modals.showPicture.prepareModal(TrampolineID)
            },
            updateTrampoline: function (TrampolineID) {
                Trampolines.Modals.updateTrampoline.prepareModal(TrampolineID)
            },
            removeTrampoline: function (TrampolineID) {
                Trampolines.Modals.deleteTrampoline.prepareModal(TrampolineID)
            }
        },
    },
    Modals: {
        addTrampoline: {
            element: new bootstrap.Modal('#createTrampolineModal'),
            dataForm: {
                element: $('#createTrampolineModal form')
            },
            Events: {
                init: function () {
                    $('#createTrampolineModal .createTrampoline').on('click', (event) => {
                        event.stopPropagation()
                        this.addTrampoline();
                    })
                },
                addTrampoline: function () {
                    $('#overlay').css('display', 'flex')
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "POST",
                        url: "/trampolines/admin/trampoline",
                        data: Variables.getTrampolineFormInputs('createTrampolineModal')
                    }).done((response) => {
                        $('#overlay').hide();
                        console.log("response : ", response);
                        if (response.status === false) {
                            $('#createTrampolineModal form input').removeClass('is-invalid');
                            Object.keys(response.failed_input).forEach(function (FailedInput) {
                                $('#createTrampolineModal form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                                $('#createTrampolineModal form input[name=' + FailedInput + ']').addClass('is-invalid');
                            })
                        }
                        if (response.status) {
                            $('#successAlertMessage').text('Batutas sukurtas sėkmingai!')
                            $('#successAlert').show().css('display', 'flex')
                            Trampolines.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
                            $('#createTrampolineModal form input[type=text], #createTrampolineModal form input[type=number], #createTrampolineModal form textarea').val('');
                            $('#createTrampolineModal form input').removeClass('is-invalid');
                            Trampolines.Modals.addTrampoline.element.hide();
                        }
                        Trampolines.Table.Table.draw()
                    }).fail((jqXHR) => {
                        $('#overlay').hide();
                        Trampolines.Modals.addTrampoline.element.hide();
                        let errorMessage = 'An error occurred';
                        if (jqXHR.responseJSON) {
                            errorMessage = 'Nepavyko sukurti batuto: ' + jqXHR.responseJSON.message;
                        } else if (jqXHR.responseText) {
                            errorMessage = 'Nepavyko sukurti batuto: ' + jqXHR.responseText;
                        }
                        $('#failedAlertMessage').text(errorMessage);
                        $('#failedAlert').show().css('display', 'flex');
                    })
                }
            }
        },
        updateTrampoline: {
            trampolineIdToUpdate: 0,
            element: new bootstrap.Modal('#updateTrampolineModal'),
            dataForm: {
                trampolineName: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolineName]').val(Value)
                    }
                },
                trampolineColor: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolineColor]').val(Value)
                    }
                },
                trampolineHeight: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolineHeight]').val(Value)
                    }
                },
                trampolineWidth: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolineWidth]').val(Value)
                    }
                },
                trampolineLength: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolineLength]').val(Value)
                    }
                },
                trampolineDescription: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolineDescription]').val(Value)
                    }
                },
                trampolinePrice: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolinePrice]').val(Value)
                    }
                },
                trampolineActivity: {
                    set: function (Value) {
                        $('#updateTrampolineModal input[name=trampolineActivity]').prop('checked', Value)
                    }
                }
            },
            fillDataForm: function (BackendResponse) {
                this.dataForm.trampolineName.set(BackendResponse.title)
                this.dataForm.trampolineDescription.set(BackendResponse.description)
                if (BackendResponse.parameter !== null) {
                    this.dataForm.trampolineColor.set(BackendResponse.parameter.color)
                    this.dataForm.trampolineHeight.set(BackendResponse.parameter.height)
                    this.dataForm.trampolineWidth.set(BackendResponse.parameter.width)
                    this.dataForm.trampolineLength.set(BackendResponse.parameter.length)
                    this.dataForm.trampolinePrice.set(BackendResponse.parameter.price)
                    this.dataForm.trampolineActivity.set(BackendResponse.parameter.activity)
                }
            },
            prepareModal: function (TrampolineID) {
                $('#overlay').css('display', 'flex')
                console.log('Trampolines.Modals.updateTrampoline.prepareModal(' + TrampolineID + ')')
                this.trampolineIdToUpdate = TrampolineID
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    dataType: 'json',
                    method: "GET",
                    url: "/trampolines/admin/trampoline",
                    data: {
                        trampoline_id: TrampolineID
                    }
                }).done((response) => {
                    $('#overlay').hide();
                    console.log("done => response : ", response);
                    console.log("done => response.trampoline : ", response.trampoline);
                    if (response.status) {
                        this.fillDataForm(response.trampoline)
                        Trampolines.Modals.updateTrampoline.element.show()
                    }
                }).fail((jqXHR) => {
                    $('#overlay').hide();
                    Trampolines.Modals.addTrampoline.element.hide();
                    let errorMessage = 'An error occurred';
                    if (jqXHR.responseJSON) {
                        errorMessage = 'Nepavyko atidaryti modalo: ' + jqXHR.responseJSON.message;
                    } else if (jqXHR.responseText) {
                        errorMessage = 'Nepavyko atidaryti modalo: ' + jqXHR.responseText;
                    }
                    $('#failedAlertMessage').text(errorMessage);
                    $('#failedAlert').show().css('display', 'flex');
                    Trampolines.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
                })
            },
            Events: {
                init: function () {
                    $('#updateTrampolineModal .updateTrampoline').on('click', (event) => {
                        event.stopPropagation()
                        this.updateTrampoline();
                        console.log('pagautas clickas')
                    })
                },
                updateTrampoline: function () {
                    $('#overlay').css('display', 'flex')
                    let form_data = Variables.getTrampolineFormInputs('updateTrampolineModal')
                    form_data.trampolineID = Trampolines.Modals.updateTrampoline.trampolineIdToUpdate
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "PUT",
                        url: "/trampolines/admin/trampoline",
                        data: form_data
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status === false) {
                            $('#updateTrampolineModal form input').removeClass('is-invalid');
                            Object.keys(response.failed_input).forEach(function (FailedInput) {
                                $('#updateTrampolineModal form .' + FailedInput + 'InValidFeedback').text(response.failed_input[FailedInput][0]);
                                $('#updateTrampolineModal form input[name=' + FailedInput + ']').addClass('is-invalid');
                            })
                        }
                        if (response.status) {
                            $('#successAlertMessage').text('Batutas atnaujintas sėkmingai!')
                            $('#successAlert').show().css('display', 'flex')
                            Trampolines.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
                            $('#updateTrampolineModal form input[type=text], #updateTrampolineModal form input[type=number], #updateTrampolineModal form textarea').val('');
                            $('#updateTrampolineModal form input').removeClass('is-invalid');
                            Trampolines.Modals.updateTrampoline.element.hide()
                        }
                        Trampolines.Table.Table.draw()
                    }).fail((jqXHR) => {
                        $('#overlay').hide();
                        Trampolines.Modals.updateTrampoline.element.hide();
                        let errorMessage = 'An error occurred';
                        if (jqXHR.responseJSON) {
                            errorMessage = 'Nepavyko atnaujinti batuto: ' + jqXHR.responseJSON.message;
                        } else if (jqXHR.responseText) {
                            errorMessage = 'Nepavyko atnaujinti batuto: ' + jqXHR.responseText;
                        }
                        $('#failedAlertMessage').text(errorMessage);
                        $('#failedAlert').show().css('display', 'flex');
                        Trampolines.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)

                    })
                }
            }
        },
        deleteTrampoline: {
            trampolineIdToDelete: 0,
            element: new bootstrap.Modal('#removeTrampolineModal'),
            prepareModal: function (TrampolineID) {
                $('#overlay').css('display', 'flex')
                this.trampolineIdToDelete = TrampolineID
                $.ajax({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                    dataType: 'json',
                    method: "GET",
                    url: "/trampolines/admin/trampoline",
                    data: {
                        trampoline_id: TrampolineID
                    }
                }).done((response) => {
                    $('#overlay').hide();
                    if (response.status) {
                        $('#removeTrampolineModal .modal-body p').
                        html('Ar tikrai norite ištrinti batutą "' + response.trampoline.title + '"?');
                        this.element.show()
                    }
                }).fail((jqXHR) => {
                    $('#overlay').hide();
                    Trampolines.Modals.updateTrampoline.element.hide();
                    let errorMessage = 'An error occurred';
                    if (jqXHR.responseJSON) {
                        errorMessage = 'Nepavyko atidaryti modalo: ' + jqXHR.responseJSON.message;
                    } else if (jqXHR.responseText) {
                        errorMessage = 'Nepavyko atidaryti modalo: ' + jqXHR.responseText;
                    }
                    $('#failedAlertMessage').text(errorMessage);
                    $('#failedAlert').show().css('display', 'flex');
                    Trampolines.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
                })
            },
            Events: {
                init: function () {
                    $('#removeTrampolineModal .removeTrampoline').on('click', (event) => {
                        event.stopPropagation()
                        this.removeTrampoline(Trampolines.Modals.deleteTrampoline.trampolineIdToDelete)
                    })
                },
                removeTrampoline: function (TrampolineID) {
                    $('#overlay').css('display', 'flex')
                    console.log('removeTrampoline TrampolineID => ',TrampolineID);
                    $.ajax({
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        method: "DELETE",
                        url: "/trampolines/admin/trampoline",
                        data: {
                            trampolineID: TrampolineID
                        }
                    }).done((response) => {
                        $('#overlay').hide();
                        if (response.status) {
                            $('#successAlertMessage').text('Batutas ištrintas sėkmingai!')
                            $('#successAlert').show().css('display', 'flex')
                            Trampolines.Events.dismissAlertsAfterTimeout('#successAlert', 5000)
                            Trampolines.Modals.deleteTrampoline.element.hide()
                        }
                        Trampolines.Table.Table.draw()
                    }).fail((jqXHR) => {
                        $('#overlay').hide();
                        Trampolines.Modals.deleteTrampoline.element.hide();
                        let errorMessage = 'An error occurred';
                        if (jqXHR.responseJSON) {
                            errorMessage = 'Nepavyko ištrinti batuto: ' + jqXHR.responseJSON.message;
                        } else if (jqXHR.responseText) {
                            errorMessage = 'Nepavyko ištrinti batuto: ' + jqXHR.responseText;
                        }
                        $('#failedAlertMessage').text(errorMessage);
                        $('#failedAlert').show().css('display', 'flex');
                        Trampolines.Events.dismissAlertsAfterTimeout('#failedAlert', 5000)
                    })
                }
            }
        },
        showPicture: {
            trampolinePicturesToShow: 0,
            element: new bootstrap.Modal('#showTrampolinePicturesModal'),
            prepareModal: function (TrampolineID) {
                this.trampolinePicturesToShow = TrampolineID
                this.element.show()
            }
        }
    },
    Events: {
        init: function (){
          $('#activeTrampolines').on('change', function () {
              Trampolines.filterActive = $(this).is(':checked');
              Trampolines.Table.Table.draw();
          });
            $('#inactiveTrampolines').on('change', function () {
                Trampolines.filterInactive = $(this).is(':checked');
                Trampolines.Table.Table.draw();
            });
        },
        dismissAlertsAfterTimeout: function (alertId, timeout){
            setTimeout(function() {
                $(alertId).fadeOut('slow', function() {
                    $(this).alert('close');
                });
            }, timeout);
        }
    }
}
$(document).ready(function () {
    console.log("/js/trampolines/private/trampolines_admin.js -> ready!");
    Trampolines.init()
});
