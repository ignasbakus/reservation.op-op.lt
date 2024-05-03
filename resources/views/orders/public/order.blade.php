@extends('layouts.layout')

@section('content')
    <div class="row">
        <div class="col-5">
            <h2>Užsakymo Forma</h2>
            <form>
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
                    <input class="form-control" id="deliveryAddress" rows="3"
                           placeholder="Įveskite pristatymo adresą" required></input>
                </div>
                <button type="submit" class="btn btn-primary mt-3">Siųsti</button>
            </form>
        </div>
        <div class="col-1"></div>
{{--        <div class="col-4">--}}
{{--            <div id="myCarousel" class="carousel slide" data-ride="carousel">--}}
{{--                <div class="carousel-inner">--}}
{{--                    <div class="carousel-item active">--}}
{{--                        <div class="card">--}}
{{--                            <img class="card-img-top" src="https://5.imimg.com/data5/SELLER/Default/2023/6/316404293/SS/QV/DR/144487269/inflatable-bouncy-castle.jpg" alt="Card image cap">--}}
{{--                            <div class="card-body">--}}
{{--                                <h5 class="card-title">First Card Title</h5>--}}
{{--                            </div>--}}
{{--                        </div>--}}
{{--                    </div>--}}
{{--                    <div class="carousel-item">--}}
{{--                        <div class="card">--}}
{{--                            <img class="card-img-top" src="https://m.media-amazon.com/images/I/711Hnk9Va5L.jpg" alt="Card image cap">--}}
{{--                            <div class="card-body">--}}
{{--                                <h5 class="card-title">Second Card Title</h5>--}}
{{--                            </div>--}}
{{--                        </div>--}}
{{--                    </div>--}}
{{--                    <div class="carousel-item">--}}
{{--                        <div class="card">--}}
{{--                            <img class="card-img-top" src="https://backyardbounce.ca/cdn/shop/products/image000004.jpg?v=1678810396" alt="Card image cap">--}}
{{--                            <div class="card-body">--}}
{{--                                <h5 class="card-title">Third Card Title</h5>--}}
{{--                            </div>--}}
{{--                        </div>--}}
{{--                    </div>--}}
{{--                </div>--}}
{{--                <button class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">--}}
{{--                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>--}}
{{--                    <span class="visually-hidden">Previous</span>--}}
{{--                </button>--}}
{{--                <button class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">--}}
{{--                    <span class="carousel-control-next-icon" aria-hidden="true"></span>--}}
{{--                    <span class="visually-hidden">Next</span>--}}
{{--                </button>--}}
{{--            </div>--}}
{{--        </div>--}}
        <div class="col-6">
            <div id="calendar" class="container">
                <h2>Kalendorius</h2>
                <!-- Placeholder for Calendar -->
                <!-- You can integrate your calendar here -->
            </div>
        </div>
    </div>
@endsection

@section('custom_js')
    <script src="/js/trampolines/public/order_public.js"></script>
@endsection
