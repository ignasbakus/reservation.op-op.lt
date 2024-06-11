@extends('layouts.layout')

@section('custom_css')
    <link href="/css/order/public/public_order_view.css" rel="stylesheet" crossorigin="anonymous">
@endsection

@section('content')
    <div class="container flex-grow-1">
        <div class="row justify-content-center">
            <div class="col-lg-4" id="columnAfterSentOrder" style="display: none">
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
            <div id="sendOrderColumn" class="col-4 ms-5 infoBeforeSuccessfulOrder" style="display: block">
                <h2>Užsakymo Forma</h2>
                <form id="orderForm" class="needs-validation" novalidate>
                    <div class="row">
                        <div class="form-group col-6">
                            <label for="customerName">Vardas:</label>
                            <input name="customerName" type="text" class="form-control" id="customerName"
                                   placeholder="Įveskite vardą" required>
                            <div class="invalid-feedback customerNameInValidFeedback"></div>
                        </div>
                        <div class="form-group col-6">
                            <label for="customerSurname">Pavardė:</label>
                            <input name="customerSurname" type="text" class="form-control" id="customerSurname"
                                   placeholder="Įveskite pavardę" required>
                            <div class="invalid-feedback customerSurnameInValidFeedback"></div>
                        </div>
                    </div>
                    <div class="form-group mt-3">
                        <label for="customerPhoneNumber">Telefono Numeris:</label>
                        <input name="customerPhoneNumber" type="tel" class="form-control" id="customerPhoneNumber"
                               placeholder="Įveskite telefono numerį">
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
                        <input name="customerDeliveryAddress" class="form-control" id="customerDeliveryAddress"
                               placeholder="Įveskite pristatymo adresą" required>
                        <div class="invalid-feedback customerDeliveryAddressNameInValidFeedback"></div>

                    </div>
                    <div class="row">
                        <div class="col-2 infoBeforeSuccessfulOrder" style="display: block">
                            <button class="btn btn-primary mt-3 createOrder">Siųsti</button>
                        </div>
                        <div class="col-6"></div>
                    </div>
                </form>
            </div>
            <div class="col-2"></div>
            <div class="col me-5">
                <!--select class="form-select showTrampolineSelect" aria-label="Default select example" style="display: none">
                <option selected>Pasirinkite batutą ...</option>
{{--                @foreach($Trampolines as $Trampoline)--}}
                {{--                    <option value="{{$Trampoline->id}}">{{$Trampoline->title}} / {{$Trampoline->description}}</option>--}}
                {{--                @endforeach--}}
                </select-->
                <div id="calendar"></div>
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
    </script>
    <script src='/frameworks/fullcalendar6111/dist/index.global.js'></script>
    <script src="/js/orders/public/order_public.js"></script>
@endsection
