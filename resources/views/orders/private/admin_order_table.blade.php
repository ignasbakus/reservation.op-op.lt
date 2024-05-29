@extends('layouts.admin_panel_layout')
@section('content')

    <div class="row mb-5">
        <div class="col-4">
            {{--            <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#createTrampolineModal">Pridėti--}}
            {{--                naują batutą--}}
            {{--            </button>--}}
            <button id="refreshTable" class="btn btn-secondary">
                Atnaujinti lentelė
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
                                <input class="form-check-input informClient" name="informClient" type="checkbox" value="" id="flexCheckChecked" checked>
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
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-4">
                            <form id="updateOrderForm" class="needs-validation" novalidate>
                                <div class="row mb-3">
                                    <div class="form-group col-6">
                                        <label for="customerName">Vardas:</label>
                                        <input name="customerName" type="text" class="form-control" id="customerName" placeholder="Įveskite vardą" required>
                                        <div class="invalid-feedback customerNameInValidFeedback"></div>
                                    </div>
                                    <div class="form-group col-6">
                                        <label for="customerSurname">Pavardė:</label>
                                        <input name="customerSurname" type="text" class="form-control" id="customerSurname" placeholder="Įveskite pavardę" required>
                                        <div class="invalid-feedback customerSurnameInValidFeedback"></div>
                                    </div>
                                </div>
                                <div class="form-group mt-3">
                                    <label for="customerPhoneNumber">Telefono Numeris:</label>
                                    <input name="customerPhoneNumber" type="tel" class="form-control" id="customerPhoneNumber" placeholder="Įveskite telefono numerį">
                                    <div class="invalid-feedback customerPhoneNumberInValidFeedback"></div>
                                </div>
                                <div class="form-group mt-3">
                                    <label for="customerEmail">El. Paštas:</label>
                                    <input name="customerEmail" type="email" class="form-control" id="customerEmail" placeholder="Įveskite el. paštą" required>
                                    <div class="invalid-feedback customerEmailInValidFeedback"></div>
                                </div>
                                <div class="row mt-3">
                                    <div class="form-group col-6">
                                        <label for="customerDeliveryCity">Pristatymo Miestas:</label>
                                        <input name="customerDeliveryCity" type="text" class="form-control" id="customerDeliveryCity"
                                               placeholder="Įveskite pristatymo miestą" required>
                                        <div class="invalid-feedback customerDeliveryCityInValidFeedback"></div>
                                    </div>
                                    <div class="form-group col-6">
                                        <label for="customerDeliveryPostCode">Pašto Kodas:</label>
                                        <input name="customerDeliveryPostCode" type="text" class="form-control" id="customerDeliveryPostCode" placeholder="Įveskite pašto kodą" required>
                                        <div class="invalid-feedback customerDeliveryPostCodeInValidFeedback"></div>
                                    </div>
                                </div>
                                <div class="form-group mt-3">
                                    <label for="customerDeliveryAddress">Pristatymo Adresas:</label>
                                    <input name="customerDeliveryAddress" class="form-control" id="customerDeliveryAddress" placeholder="Įveskite pristatymo adresą" required>
                                    <div class="invalid-feedback customerDeliveryAddressNameInValidFeedback"></div>
                                </div>
                                <div class="form-check mt-3">
                                    <input class="form-check-input informClient" name="informClient" type="checkbox" value="" id="flexCheckChecked" checked>
                                    <label class="form-check-label" for="informClient">
                                        Informuoti klientą
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="col-2"></div>
                        <div class="col-4">
                            <div id="calendar"></div>
                            <div class="mt-5">
                                <div class="confirmation-container" style="display: none" >
                                    <h4 class="confirmation-title">Ar tikrai norite pakeisti užsakymo datas?</h4>
                                    <div class="dates-info">
                                        <p class="date-label">Užsakymo datas bus pakeistos į:</p>
                                        <p><strong>Pradžia:</strong> 2024-06-01</p>
                                        <p><strong>Pabaiga:</strong> 2024-06-03</p>
                                    </div>
                                    <div class="button-container">
                                        <button class="cancel-btn">Atšaukti</button>
                                        <button class="confirm-btn">Patvirtinti</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
{{--                    <div class="row">--}}
{{--                        <div class="col-8"></div>--}}
{{--                        <div class="col-4">--}}
{{--                            <h3>Ar tikrai norite pakeisti užsakymo datas?</h3>--}}
{{--                        </div>--}}
{{--                    </div>--}}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Uždaryti</button>
                    <button type="submit" class="btn btn-primary updateOrder">Atnaujinti</button>
                </div>
            </div>
        </div>
    </div>
@endsection
@section('custom_js')
    <script src='/frameworks/fullcalendar6111/dist/index.global.js'></script>
    <script src="/js/orders/private/order_table_admin.js"></script>
@endsection
