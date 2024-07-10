@extends('layouts.layout')

@section('custom_css')
    <link href="/css/order/public/public_order_view.css" rel="stylesheet" crossorigin="anonymous">
@endsection

@section('content')
    <div class="container flex-grow-1">
        <div class="row justify-content-center">
            <div class="col-lg-4" id="columnAfterSentOrder" style="display: block">
                <div id="thankYouDiv" class="ms-lg-5"></div>
                <div id="confirmationContainer" class="confirmation-container ms-lg-5 mt-3" style="display: none">
                    <h4 class="confirmation-title">Ar tikrai norite pakeisti užsakymo datas?</h4>
                    <div class="checkbox-container d-flex justify-content-end mt-2">
                        <button type="button" class="btn btn-danger me-2 confirmationClose">
                            Atšaukti
                        </button>
                        <button type="button" class="btn btn-primary confirmChanges confirmDatesChange">
                            Pakeisti
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-1"></div>
            <div class="col me-5">
                <div id="calendar"></div>
            </div>
            <div class="alert alert-warning alert-dismissible fade show custom-alert" id="failedAlert" role="alert"
                 style="display: none;">
                <span id="failedAlertMessage"></span>
                <button type="button" class="btn-close" aria-label="Close" onclick="$('#failedAlert').hide()"></button>
            </div>
            <div class="alert alert-success alert-dismissible fade show custom-alert" id="successfulDateChangeAlert"
                 role="alert" style="display: none;">
                <span id="dateChangeAlertMessage"></span>
                <button type="button" class="btn-close" aria-label="Close"
                        onclick="$('#successfulDateChangeAlert').hide()"></button>
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
                        <p style="color: red">Jei iki pirmosios rezervacijos dienos yra likusios mažiau nei 3 dienos, užsakymo atšaukti neleis</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Išeiti</button>
                        <button type="submit" class="btn btn-danger cancelOrderModalButton">Atšaukti</button>
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
    <script src="/js/orders/public/order_public_via_email.js"></script>
@endsection
