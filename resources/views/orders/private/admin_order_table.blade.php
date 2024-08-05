@extends('layouts.admin_panel_layout')
@section('custom_css')
    <link href="/css/order/admin/admin_order_calendar.css" rel="stylesheet" crossorigin="anonymous">
    <style>
    </style>
@endsection
@section('content')
    <div class="row mb-3">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center button-container">
                <div class="d-flex">
                    <button id="refreshTable" type="button" class="btn btn-dark me-2">
                        <svg width="20" height="20" fill="currentColor" class="bi bi-arrow-clockwise"
                             viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                  d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"></path>
                            <path
                                d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"></path>
                        </svg>
                    </button>
                    <button id="deleteUnpaidOrders" class="btn btn-secondary">
                        Ištrinti visus užsakymus
                    </button>
                </div>
                <div class="d-flex form-group">
                    {{--                    <div class="form-check form-switch mt-2">--}}
                    {{--                        <input class="form-check-input" type="checkbox" id="showWeeklyOrders">--}}
                    {{--                        <label class="form-check-label" for="showWeeklyOrders">Rodyti 7 dienų užsakymus</label>--}}
                    {{--                    </div>--}}
                    <div id="dateForm" class="form-group me-2">
                        <input name="dateRangePicker" type="text" class="form-control" id="dateRangePicker" placeholder="Rodyti užsak. nuo - iki" />
                    </div>
                    <button type="button" class="btn btn-dark" id="clearDatesButton">
                        <svg  width="20" height="20" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="row mb-5">
        <div class="col-12">
            <table id="orderTable" class="display" style="width:100%">
                <tbody></tbody>
            </table>
        </div>
    </div>
    <div class="container flex-grow-1">
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
                                           value="checked" id="flexCheckChecked">
                                    <label class="form-check-label" for="flexCheckChecked">
                                        Informuoti klientą
                                    </label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="mt-3 cancellationDropdown" style="display:none;">
                                    <select name="cancellationExcuse" class="form-select">
                                        <option value="normalCancellation">Be priežasties</option>
                                        <option value="technicalFailure">Techninis gedimas</option>
                                        <option value="badWeather">Blogos oro sąlygos</option>
                                        <option value="trampolineReserved">Batutas jau rezervuotas</option>
                                        <option value="paymentMissing">Negautas mokėjimas</option>
                                    </select>
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
                            <div id="formRow" class="col-4">
                                <form id="updateOrderForm" class="needs-validation" novalidate>
                                    <div class="row mb-3">
                                        <div class="form-group col-6">
                                            <label for="customerName">Vardas:</label>
                                            <input name="customerName" type="text" class="form-control"
                                                   id="customerName"
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
                                                   id="customerDeliveryPostCode" placeholder="Įveskite pašto kodą"
                                                   required>
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
                                    <div class="row mt-3">
                                        <div class="form-group col">
                                            <label for="customerDeliveryTime">Pristatymo laikas</label>
                                            <input name="customerDeliveryTime" class="form-control" type="text"
                                                   id="customerDeliveryTime" placeholder="Pasirinkite pristatymo laiką"
                                                   required>
                                        </div>
                                    </div>
                                </form>
                                <div class="mt-5">
{{--                                    <div id="confirmationContainer" class="confirmation-container ms-lg-5 mt-3"--}}
{{--                                         style="display: none">--}}
{{--                                        <h4 class="confirmation-title">Ar tikrai norite pakeisti užsakymo datas?</h4>--}}
{{--                                        <div class="d-flex justify-content-between align-items-start">--}}
{{--                                            <button type="button" class="btn btn-secondary confirmationClose">Atšaukti--}}
{{--                                            </button>--}}
{{--                                            <div class="checkbox-container d-flex flex-column align-items-end">--}}
{{--                                                <label for="confirmChange1" class="d-flex align-items-center">--}}
{{--                                                    <input type="checkbox" id="confirmChange1"--}}
{{--                                                           class="mr-2 form-check-input confirmChanges" required>--}}
{{--                                                    Patvirtinti pakeitimą--}}
{{--                                                    <div class="invalid-feedback">Pažymėkite, jog patvirtinate datų--}}
{{--                                                        pakeitimą--}}
{{--                                                    </div>--}}
{{--                                                </label>--}}
{{--                                                <label for="confirmChange2" class="d-flex align-items-center mt-2">--}}
{{--                                                    <input type="checkbox" id="confirmChange2"--}}
{{--                                                           class="mr-2 form-check-input informClient" checked>--}}
{{--                                                    Informuoti klientą--}}
{{--                                                </label>--}}
{{--                                            </div>--}}
{{--                                        </div>--}}
{{--                                    </div>--}}
                                    <div id="confirmationContainer" class="confirmation-container p-3 bg-light border rounded shadow-sm" style="display: none">
                                        <h4 class="confirmation-title mb-3">Ar tikrai norite pakeisti užsakymo datas?</h4>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <button type="button" class="btn btn-secondary confirmationClose">Atšaukti</button>
                                            <div class="form-check">
                                                <input type="checkbox" id="confirmChange1" class="form-check-input confirmChanges" required>
                                                <label for="confirmChange1" class="form-check-label">
                                                    Patvirtinti pakeitimą
                                                </label>
                                                <div class="invalid-feedback">
                                                    Pažymėkite, jog patvirtinate datų pakeitimą
                                                </div>
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
                        <button type="button" class="btn btn-secondary modalClose" data-bs-dismiss="modal">Uždaryti
                        </button>
                        <button type="submit" class="btn btn-primary updateOrder">Atnaujinti</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="sendEmailModal" data-bs-backdrop="static" tabindex="-1"
             aria-labelledby="updateOrderModal" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">El. laiško pakartotinis siuntimas</h1>
                        <button type="button" class="btn-close modalClose" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col">
                                <label for="recipientEmail" class="form-label">Gavėjo el. paštas</label>
                                <input type="email" id="recipientEmail" name="customerEmail" class="form-control"
                                       value="">
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col">
                                <label for="emailType" class="form-label">El. laiško tipas</label>
                                <select name="emailType" class="form-select">
                                    <option value="OrderPaid">Gautas apmokėjimas</option>
                                    <option value="OrderPlaced">Gautas užsakymas</option>
                                    <option value="OrderNotPaid">Užsakymas neapmokėtas</option>
                                    <option value="OrderCancelled">Užsakymas atšauktas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary modalClose" data-bs-dismiss="modal">Uždaryti
                        </button>
                        <button type="submit" class="btn btn-primary sendEmail">Siųsti</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-warning alert-dismissible fade show custom-alert" id="failedAlert" role="alert"
             style="display: none;">
            <span id="failedAlertMessage"></span>
            <button type="button" class="btn-close" aria-label="Close" onclick="$('#failedAlert').hide()"></button>
        </div>
        <div class="alert alert-success alert-dismissible fade show custom-alert" id="successAlert" role="alert"
             style="display: none;">
            <span id="successAlertMessage"></span>
            <button type="button" class="btn-close" aria-label="Close" onclick="$('#successAlert').hide()"></button>
        </div>
    </div>
@endsection
@section('custom_js')
    <script src='/frameworks/fullcalendar6111/dist/index.global.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="/js/orders/private/order_table_admin.js"></script>
@endsection
