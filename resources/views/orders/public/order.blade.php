@php
    $currency = config('trampolines.currency');
//    dd($currency);
    $advancePercentage = config('trampolines.advance_percentage');
@endphp

@extends('layouts.layout')

@section('custom_css')
    <link href="/css/order/public/public_order_view.css" rel="stylesheet" crossorigin="anonymous">
@endsection

@section('content')
    <div class="container flex-grow-1">
        <div class="row justify-content-center">
            <div id="sendOrderColumn" class="col-lg-4 col-md-6 col-sm-12 infoBeforeSuccessfulOrder">
                <h2>Užsakymo Forma</h2>
                <form id="orderForm" class="needs-validation" novalidate>
                    <div class="row">
                        <div class="form-group col-6">
                            <label for="customerName">Vardas <span class="required-asterisk">*</span></label>
                            <input name="customerName" type="text" class="form-control" id="customerName"
                                   placeholder="Įveskite vardą" required>
                            <div class="invalid-feedback customerNameInValidFeedback"></div>
                        </div>
                        <div class="form-group col-6">
                            <label for="customerSurname">Pavardė <span class="required-asterisk">*</span></label>
                            <input name="customerSurname" type="text" class="form-control" id="customerSurname"
                                   placeholder="Įveskite pavardę" required>
                            <div class="invalid-feedback customerSurnameInValidFeedback"></div>
                        </div>
                    </div>
                    <div class="form-group mt-3">
                        <label for="customerPhoneNumber">Telefono Numeris <span
                                class="required-asterisk">*</span></label>
                        <input name="customerPhoneNumber" type="tel" class="form-control" id="customerPhoneNumber"
                               placeholder="Įveskite telefono numerį">
                        <div class="invalid-feedback customerPhoneNumberInValidFeedback"></div>
                    </div>
                    <div class="form-group mt-3">
                        <label for="customerEmail">El. Paštas <span class="required-asterisk">*</span></label>
                        <input name="customerEmail" type="email" class="form-control" id="customerEmail"
                               placeholder="Įveskite el. paštą" required>
                        <div class="invalid-feedback customerEmailInValidFeedback"></div>
                    </div>
                    <div class="row mt-3">
                        <div class="form-group col-6">
                            <label for="customerDeliveryCity">Miestas <span
                                    class="required-asterisk">*</span></label>
                            <input name="customerDeliveryCity" type="text" class="form-control"
                                   id="customerDeliveryCity"
                                   placeholder="Įveskite pristatymo miestą" required>
                            <div class="invalid-feedback customerDeliveryCityInValidFeedback"></div>
                        </div>
                        <div class="form-group col-6">
                            <label for="customerDeliveryPostCode">Pašto Kodas <span
                                    class="required-asterisk">*</span></label>
                            <input name="customerDeliveryPostCode" type="text" class="form-control"
                                   id="customerDeliveryPostCode" placeholder="Įveskite pašto kodą" required>
                            <div class="invalid-feedback customerDeliveryPostCodeInValidFeedback"></div>
                        </div>
                    </div>
                    <div class="form-group mt-3">
                        <label for="customerDeliveryAddress">Pristatymo Adresas <span class="required-asterisk">*</span></label>
                        <input name="customerDeliveryAddress" class="form-control" id="customerDeliveryAddress"
                               placeholder="Įveskite pristatymo adresą" required>
                        <div class="invalid-feedback customerDeliveryAddressNameInValidFeedback"></div>
                    </div>
                    <div class="row mt-3" id="orderDates">
                        <div class="form-group col">
                            <label for="flatPickerCalendar">Užsakymo datos <span
                                    class="required-asterisk">*</span></label>
                            <input name="flatPickerCalendar" class="form-control" type="text" id="flatPickerCalendar"
                                   placeholder="Pasirinkite datas" required>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="form-group col">
                            <label for="customerDeliveryTime">Pristatymo laikas <span class="required-asterisk">*</span></label>
                            <input name="customerDeliveryTime" class="form-control" type="time"
                                   id="customerDeliveryTime" placeholder="Pasirinkite pristatymo laiką" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col infoBeforeSuccessfulOrder">
                            <button
                                class="btn btn-primary mt-3 d-flex align-items-center justify-content-center viewOrderButton"
                                id="viewOrderButton">
                                <span id="buttonText">Peržiūrėti užsakymą</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="col-lg-7 col-md-6 col-sm-12">
                <div data-bs-toggle="tooltip" id="calendar"></div>
            </div>
            <div class="alert alert-warning alert-dismissible fade show custom-alert col-12 mt-3" id="failedAlert"
                 role="alert"
                 style="display: none;">
                <span id="failedAlertMessage"></span>
                <button type="button" class="btn-close" aria-label="Close" onclick="$('#failedAlert').hide()"></button>
            </div>
            <div class="alert alert-success alert-dismissible fade show custom-alert col-12 mt-3"
                 id="successfulDateChangeAlert"
                 role="alert" style="display: none;">
                <span id="dateChangeAlertMessage"></span>
                <button type="button" class="btn-close" aria-label="Close"
                        onclick="$('#successfulDateChangeAlert').hide()"></button>
            </div>
        </div>
        <div class="modal fade" id="viewOrderModal" tabindex="-1" role="dialog" aria-labelledby="reservationModalLabel"
             aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="reservationModalLabel">Užsakymo Informacija</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="reservation-dates-container text-center mb-4">
                            <h6 class="reservation-dates-title"><strong>Rezervuotos dienos:</strong></h6>
                            <div class="reservation-dates" id="reservation-dates"></div>
                        </div>
                        <div class="order-summary">
                            <h5 class="mb-3">Užsakomi batutai</h5>
                            @foreach($Trampolines as $trampoline)
                                <div class="d-flex justify-content-between trampoline-item py-2"
                                     data-price="{{ $trampoline->Parameter->price }}">
                                    <span class="font-weight-bold trampoline-name">Batutas {{$trampoline->title}}</span>
                                    <span
                                        class="font-weight-bold trampoline-price">{{ number_format($trampoline->Parameter->price, 2) }}{{$currency}}</span>
                                </div>
                            @endforeach
                            {{--                            <hr>--}}
                            <h5 class="mb-3">Kainos</h5>
                            <div class="d-flex justify-content-between py-2">
                                <span class="font-weight-bold">Avansas</span>
                                <span class="font-weight-bold" id="advance-payment">0.00{{$currency}}</span>
                            </div>
                            <div class="d-flex justify-content-between py-2">
                                <span class="font-weight-bold">Galutinė mokama suma vietoje *</span>
                                <span class="font-weight-bold" id="final-payment">0.00{{$currency}}</span>
                            </div>
                            <hr>
                            <div>
                                <span class="text-danger py-2">
                                    * Prie galutinės sumos dar nėra priskaičiuota pristatymo kaina. Dėl daugiau informacijos
                                    skambinkite numeriu {{config('contactInfo.phone')}} arba rašykite el. paštu {{config('contactInfo.email')}}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id="viewOrderModalButtons" class="modal-footer justify-content-between">
                        <button type="button" class="btn btn-secondary closeView">Keisti užsakymą</button>
                        <button type="button" class="btn btn-primary payForOrderAdvance">Apmokėti avansą</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="disabledDatesModal" tabindex="-1" role="dialog"
             aria-labelledby="reservationModalLabel"
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
        let Trampolines = {{ Illuminate\Support\Js::from($Trampolines) }};
        let Occupied = {{ Illuminate\Support\Js::from($Occupied) }};
        let Dates = {{ Illuminate\Support\Js::from($Dates) }};
        let Availability = {{ Illuminate\Support\Js::from($Availability) }};
        let AdvancePercentage = {{ Illuminate\Support\Js::from($AdvancePercentage)}};
        let Currency = {{ Illuminate\Support\Js::from($currency) }};
    </script>
    <script src='/frameworks/fullcalendar6111/dist/index.global.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://npmcdn.com/flatpickr/dist/l10n/lt.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"
            crossorigin="anonymous"></script>
    <script src="/js/orders/public/order_public.js"></script>
@endsection
