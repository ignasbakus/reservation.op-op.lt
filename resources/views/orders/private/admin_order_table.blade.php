@extends('layouts.admin_panel_layout')
@section('custom_css')
    <link href="/css/order/admin/admin_order_calendar.css" rel="stylesheet" crossorigin="anonymous">
@endsection
@section('content')
    <div class="row mb-5">
        <div class="col-4">
            <button id="refreshTable" class="btn btn-secondary">
                Atnaujinti lentelė
            </button>
            <button id="deleteUnpaidOrders" class="btn btn-secondary">
                Ištrinti neapmokėtus užsakymus
            </button>
        </div>
    </div>
    <div class="row mb-5">
        <div class="col-12">
            <table id="orderTable" class="display" style="width:100%">
                <tbody></tbody>
            </table>
        </div>
    </div>
    <div class="modal fade" id="removeOrderModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Ištrinimas</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col editable">
                            <p>Ar tikrai norite ištrinti užsakymą?</p>
                        </div>
                    </div>
                    <div class="row mt-3 border-top">
                        <div class="col">
                            <div class="form-check mt-3">
                                <input class="form-check-input informClient" name="informClient" type="checkbox"
                                       value="" id="flexCheckChecked" checked>
                                <label class="form-check-label" for="informClient">
                                    Informuoti klientą
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Išeiti</button>
                    <button type="submit" class="btn btn-danger removeOrder">Ištrinti</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="updateOrderModal" data-bs-backdrop="static" tabindex="-1"
         aria-labelledby="updateOrderModal" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Užsakymo atnaujinimas</h1>
                    <button type="button" class="btn-close modalClose" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-4">
                            <form id="updateOrderForm" class="needs-validation" novalidate>
                                <div class="row mb-3">
                                    <div class="form-group col-6">
                                        <label for="customerName">Vardas:</label>
                                        <input name="customerName" type="text" class="form-control" id="customerName"
                                               placeholder="Įveskite vardą" required>
                                        <div class="invalid-feedback customerNameInValidFeedback"></div>
                                    </div>
                                    <div class="form-group col-6">
                                        <label for="customerSurname">Pavardė:</label>
                                        <input name="customerSurname" type="text" class="form-control"
                                               id="customerSurname" placeholder="Įveskite pavardę" required>
                                        <div class="invalid-feedback customerSurnameInValidFeedback"></div>
                                    </div>
                                </div>
                                <div class="form-group mt-3">
                                    <label for="customerPhoneNumber">Telefono Numeris:</label>
                                    <input name="customerPhoneNumber" type="tel" class="form-control"
                                           id="customerPhoneNumber" placeholder="Įveskite telefono numerį">
                                    <div class="invalid-feedback customerPhoneNumberInValidFeedback"></div>
                                </div>
                                <div class="form-group mt-3">
                                    <label for="customerEmail">El. Paštas:</label>
                                    <input name="customerEmail" type="email" class="form-control" id="customerEmail"
                                           placeholder="Įveskite el. paštą" required>
                                    <div class="invalid-feedback customerEmailInValidFeedback"></div>
                                </div>
                                <div class="row mt-3">
                                    <div class="form-group col-6">
                                        <label for="customerDeliveryCity">Pristatymo Miestas:</label>
                                        <input name="customerDeliveryCity" type="text" class="form-control"
                                               id="customerDeliveryCity"
                                               placeholder="Įveskite pristatymo miestą" required>
                                        <div class="invalid-feedback customerDeliveryCityInValidFeedback"></div>
                                    </div>
                                    <div class="form-group col-6">
                                        <label for="customerDeliveryPostCode">Pašto Kodas:</label>
                                        <input name="customerDeliveryPostCode" type="text" class="form-control"
                                               id="customerDeliveryPostCode" placeholder="Įveskite pašto kodą" required>
                                        <div class="invalid-feedback customerDeliveryPostCodeInValidFeedback"></div>
                                    </div>
                                </div>
                                <div class="form-group mt-3">
                                    <label for="customerDeliveryAddress">Pristatymo Adresas:</label>
                                    <input name="customerDeliveryAddress" class="form-control"
                                           id="customerDeliveryAddress" placeholder="Įveskite pristatymo adresą"
                                           required>
                                    <div class="invalid-feedback customerDeliveryAddressNameInValidFeedback"></div>
                                </div>
                            </form>
                            <div class="mt-5">
                                <div id="confirmationContainer" class="confirmation-container ms-lg-5 mt-3" style="display: none">
                                    <h4 class="confirmation-title">Ar tikrai norite pakeisti užsakymo datas?</h4>
                                    <div class="d-flex justify-content-between align-items-start">
                                        <button type="button" class="btn btn-secondary confirmationClose">Atšaukti</button>
                                        <div class="checkbox-container d-flex flex-column align-items-end">
                                            <label for="confirmChange1" class="d-flex align-items-center">
                                                <input type="checkbox" id="confirmChange1" class="mr-2 form-check-input confirmChanges" required>
                                                Patvirtinti pakeitimą
                                                <div class="invalid-feedback">Pažymėkite, jog patvirtinate datų pakeitimą</div>
                                            </label>
                                            <label for="confirmChange2" class="d-flex align-items-center mt-2">
                                                <input type="checkbox" id="confirmChange2" class="mr-2 form-check-input informClient" checked>
                                                Informuoti klientą
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-1"></div>
                        <div class="col me-5">
                            <div id="calendar" style="position: relative;"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modalClose" data-bs-dismiss="modal">Uždaryti</button>
                    <button type="submit" class="btn btn-primary updateOrder">Atnaujinti</button>
                </div>
            </div>
        </div>
    </div>
    <div class="alert alert-warning alert-dismissible fade show custom-alert" id="failedAlert" role="alert" style="display: none;">
        <span id="failedAlertMessage"></span>
        <button type="button" class="btn-close" aria-label="Close" onclick="$('#failedAlert').hide()"></button>
    </div>
    <div class="alert alert-success alert-dismissible fade show custom-alert" id="successAlert" role="alert" style="display: none;">
        <span id="successAlertMessage"></span>
        <button type="button" class="btn-close" aria-label="Close" onclick="$('#successAlert').hide()"></button>
    </div>
@endsection
@section('custom_js')
    <script src='/frameworks/fullcalendar6111/dist/index.global.js'></script>
    <script src="/js/orders/private/order_table_admin.js"></script>
@endsection
