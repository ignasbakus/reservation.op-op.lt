@extends('layouts.layout')

@section('custom_css')
    <link href="/css/order/public/public_order_view_via_email.css" rel="stylesheet" crossorigin="anonymous">
@endsection

@section('content')
    <div class="container flex-grow-1">
        <div class="row justify-content-center">
            <div class="col-lg-4" id="columnAfterSentOrder">
                <div id="thankYouDiv" class="ms-lg-5"></div>
                <div id="confirmationContainer" class="confirmation-container ms-lg-5 mt-3" style="display: none;">
                    <h4 class="confirmation-title">Ar tikrai norite pakeisti užsakymo datas?</h4>
                    <div class="checkbox-container d-flex justify-content-end mt-2">
                        <button type="button" class="btn btn-danger me-2 confirmationClose">Atšaukti</button>
                        <button type="button" class="btn btn-primary confirmChanges confirmDatesChange">Pakeisti
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-10 col-lg-7 mt-3 mt-lg-0">
                <div id="calendar"></div>
            </div>
            <div class="col-1"></div>
            <div class="col-lg-4 me-5 mt-3 mt-lg-0">
                <div class="alert alert-warning alert-dismissible fade show custom-alert" id="failedAlert" role="alert"
                     style="display: none;">
                    <span id="failedAlertMessage"></span>
                    <button type="button" class="btn-close" aria-label="Close"
                            onclick="$('#failedAlert').hide()"></button>
                </div>
                <div class="alert alert-success alert-dismissible fade show custom-alert" id="successfulDateChangeAlert"
                     role="alert" style="display: none;">
                    <span id="dateChangeAlertMessage"></span>
                    <button type="button" class="btn-close" aria-label="Close"
                            onclick="$('#successfulDateChangeAlert').hide()"></button>
                </div>
            </div>
        </div>
        <div class="modal fade" id="cancelOrderModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Atšaukimas</h3>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5>Ar tikrai norite atšaukti užsakymą?</h5>
                        <p style="color: red">Jeigu nuspręsite užsakymą atšaukti, pinigai už avansą negražinami</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Išeiti</button>
                        <button type="submit" class="btn btn-danger cancelOrderModalButton">Atšaukti</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="updateOrderModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Užsakymo atnaujinimas</h3>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="dateCalendarForMobile">
                            <label for="flatPickerCalendar">Užsakymo datos</label>
                            <input name="flatPickerCalendar" class="form-control" type="text" id="flatPickerCalendar"
                                   placeholder="Pasirinkite datas">
                            <hr>
                        </div>
                        <div>
                            <label for="customerDeliveryTime">Pristatymo laikas</label>
                            <input name="customerDeliveryTime" class="form-control" type="number"
                                   id="customerDeliveryTime" placeholder="Pasirinkite pristatymo laiką">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Išeiti</button>
                        <button type="submit" class="btn btn-primary updateOrderModalButton">Atnaujinti</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="disabledDatesModal" tabindex="-1" role="dialog" aria-labelledby="reservationModalLabel"
             aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h4 class="modal-title" id="reservationModalLabel">Negalimos dienos</h4>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Informuojame, jog pasirinkote laikotarpį, kuriame yra užimtos dienos. Prašome pasirinkti
                            kitas dienas</h6>
                    </div>
                    <div id="disabledDatesModalButtons" class="modal-footer justify-content-between">
                        <button type="button" class="btn btn-secondary closeModal">Rinktis kitas dienas</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('custom_js')
    <script>
        let view = {{ Illuminate\Support\Js::from($view) }};
        let Client = {{ Illuminate\Support\Js::from($Client) }};
        let ClientAddress = {{ Illuminate\Support\Js::from($ClientAddress) }};
        let Order_trampolines = {{ Illuminate\Support\Js::from($Order_trampolines) }};
        let Order_id = {{ Illuminate\Support\Js::from($Order_id) }};
        let Occupied = {{ Illuminate\Support\Js::from($Occupied) }};
        let Dates = {{ Illuminate\Support\Js::from($Dates) }};
        let Availability = {{ Illuminate\Support\Js::from($Availability) }};
        let DeliveryTime = {{ Illuminate\Support\Js::from($DeliveryTime) }};
    </script>
    <script src='/frameworks/fullcalendar6111/dist/index.global.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="/js/orders/public/order_public_via_email.js"></script>
@endsection
