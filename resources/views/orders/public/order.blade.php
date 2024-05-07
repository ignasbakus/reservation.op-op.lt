@extends('layouts.layout')

@section('content')
    <div class="row">
        <div id="sendOrderColumn" class="col-4 ms-5">
            <h2>Užsakymo Forma</h2>
            <form id="orderForm">
                <div class="row">
                    <div class="form-group col-6">
                        <label for="customerName">Vardas:</label>
                        <input name="customerName" type="text" class="form-control" id="customerName" placeholder="Įveskite vardą">
                    </div>
                    <div class="form-group col-6">
                        <label for="customerSurname">Pavardė:</label>
                        <input name="customerSurname" type="text" class="form-control" id="customerSurname" placeholder="Įveskite pavardę">
                    </div>
                </div>
                <div class="form-group mt-3">
                    <label for="customerPhoneNumber">Telefono Numeris:</label>
                    <input name="customerPhoneNumber" type="tel" class="form-control" id="customerPhoneNumber" placeholder="Įveskite telefono numerį">
                </div>
                <div class="form-group mt-3">
                    <label for="customerEmail">El. Paštas:</label>
                    <input name="customerEmail" type="email" class="form-control" id="customerEmail" placeholder="Įveskite el. paštą">
                </div>
                <div class="row mt-3">
                    <div class="form-group col-6">
                        <label for="customerDeliveryCity">Pristatymo Miestas:</label>
                        <input name="customerDeliveryCity" type="text" class="form-control" id="customerDeliveryCity"
                               placeholder="Įveskite pristatymo miestą">
                    </div>
                    <div class="form-group col-6">
                        <label for="customerDeliveryPostCode">Pašto Kodas:</label>
                        <input name="customerDeliveryPostCode" type="text" class="form-control" id="customerDeliveryPostCode" placeholder="Įveskite pašto kodą">
                    </div>
                </div>
                <div class="form-group mt-3">
                    <label for="customerDeliveryAddress">Pristatymo Adresas:</label>
                    <input name="customerDeliveryAddress" class="form-control" id="customerDeliveryAddress" placeholder="Įveskite pristatymo adresą"></input>
                </div>
                <div class="row">
                    <div class="col-2">
                        <button class="btn btn-primary mt-3 createOrder">Siųsti</button>
                    </div>
                    <div class="col-6"></div>
                    <div class="col-4">
                        <div class="form-check mt-3">
                            <input class="form-check-input orderSameDay" type="checkbox" value="" id="flexCheckChecked" checked>
                            <label class="form-check-label" for="flexCheckChecked">
                                Batutus uzsakyti ta pacia diena
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="col-2"></div>
        <div class="col-5">
            <select class="form-select showTrampolineSelect" aria-label="Default select example" style="display: none">
                <option selected>Open this select menu</option>
                <option value="1">Batutas drambliukas</option>
                <option value="2">Batutas kiskutis</option>
                <option value="3">Batutas peliukas</option>
            </select>
            <div id="calendar"></div>
        </div>
    </div>
    <div class="row">
        <div class="col-6">
        </div>
    </div>
@endsection

@section('custom_js')
    <script src='/frameworks/fullcalendar6111/dist/index.global.js'></script>
    <script src="/js/orders/public/order_public.js"></script>
@endsection
