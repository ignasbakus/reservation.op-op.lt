@extends('layouts.layout')

@section('content')
    <div class="row">
        <div class="col-4 ms-5">
            <h2>Užsakymo Forma</h2>
            <form id="orderForm">
                <div class="row">
                    <div class="form-group col-6">
                        <label for="firstName">Vardas:</label>
                        <input type="text" class="form-control" id="firstName" placeholder="Įveskite vardą" required>
                    </div>
                    <div class="form-group col-6">
                        <label for="lastName">Pavardė:</label>
                        <input type="text" class="form-control" id="lastName" placeholder="Įveskite pavardę" required>
                    </div>
                </div>
                <div class="form-group mt-3">
                    <label for="phoneNumber">Telefono Numeris:</label>
                    <input type="tel" class="form-control" id="phoneNumber" placeholder="Įveskite telefono numerį"
                           required>
                </div>
                <div class="form-group mt-3">
                    <label for="email">El. Paštas:</label>
                    <input type="email" class="form-control" id="email" placeholder="Įveskite el. paštą" required>
                </div>
                <div class="row mt-3">
                    <div class="form-group col-6">
                        <label for="deliveryCity">Pristatymo Miestas:</label>
                        <input type="text" class="form-control" id="deliveryCity"
                               placeholder="Įveskite pristatymo miestą" required>
                    </div>
                    <div class="form-group col-6">
                        <label for="postCode">Pašto Kodas:</label>
                        <input type="text" class="form-control" id="postCode" placeholder="Įveskite pašto kodą"
                               required>
                    </div>
                </div>
                <div class="form-group mt-3">
                    <label for="deliveryAddress">Pristatymo Adresas:</label>
                    <input class="form-control" id="deliveryAddress" placeholder="Įveskite pristatymo adresą" required></input>
                </div>
                <div class="row">
                    <div class="col-2">
                        <button type="submit" class="btn btn-primary mt-3">Siųsti</button>
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
    <script src="/js/trampolines/public/order_public.js"></script>
@endsection
