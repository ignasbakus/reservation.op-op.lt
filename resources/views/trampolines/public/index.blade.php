@extends('layouts.layout')

@section('custom_css')
    <link href="/css/trampolines/public/public_index.css" rel="stylesheet" crossorigin="anonymous">
@endsection

@section('content')
    {{--    <div id="banner-container" style="text-align: center; max-width: 100%">--}}
    {{--        <img width="100%" class="cover-photo" alt="banner" src="/images/coverPhoto/pc_main.png">--}}
    {{--    </div>--}}
    <div id="banner-container" style="text-align: center; max-width: 100%">
        <!-- Mobile Banner -->
        <img id="mobileBannerTop" width="100%" class="cover-photo mobile-banner" alt="banner"
             src="/images/coverPhoto/page top mobile.png">
        <!-- PC Banner -->
        <img id="pcBanner" width="100%" class="cover-photo pc-banner" alt="banner" src="/images/coverPhoto/pc_main.png">
    </div>
    <div class="container custom-container">
        <div id="carousel-row" class="row mt-5 mb-5">
            <div id="carouselColumn" class="col-12 col-lg-12">
                <div id="carousel-wrap">
                    <div id="trampolinesCarousel" class="carousel slide" data-bs-theme="dark">
                        <div class="carousel-inner">
                            @foreach($Trampolines as $Trampoline)
                                <div class="carousel-item {{ $Trampoline->active ? 'active' : '' }}"
                                     data-trampolineid='{{$Trampoline->id}}'>
                                    <div class="trampoline-name text-center" style="display: none">
                                        <h3>{{ $Trampoline->title }}</h3> <!-- Display trampoline name -->
                                    </div>
                                    <a class="openModal" data-bs-target="#showTrampolineModal" data-bs-toggle="modal"
                                       href="#">
                                        <img src="{{$Trampoline->image_url}}" class="d-block w-100 modal-image"
                                             alt="...">
                                    </a>
                                </div>
                            @endforeach
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#trampolinesCarousel"
                                data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#trampolinesCarousel"
                                data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                    <button id="selectTrampoline" type="button" class="btn chooseButton w-100 mt-2">
                        Pasirinkti batutą
                    </button>
                </div>
            </div>
            <div id="selectedTrampolinesSection" class="col-12 col-lg-6 mt-5" style="display: none;">
                <ul id="SelectedTrampolines" class="list-group">
                </ul>
                <div class="row mt-3">
                    <div class="col-12 col-md-8"></div>
                    <div class="col-12 col-md-4 text-end">
                        <button class="btn mt-3 w-100 sendToOrderButton mb-5" id="sendToOrderButton"
                                style="display: none;">
                            <span id="buttonText">Užsakyti</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="showTrampolineModal" tabindex="-1" aria-labelledby="exampleModalLabel"
             aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-custom">
                <div class="modal-content">
                    <div class="modal-body">
                        <div id="carouselExample" class="carousel slide" data-bs-theme="dark">
                            <div class="carousel-inner">
                                <!-- Carousel items for the modal -->
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample"
                                    data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carouselExample"
                                    data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                    <div class="modal-description">
                        <div class="container containerModal">
                            <h2>Info apie batutą:</h2>
                            <h5 class="sizes"></h5>
                            {{--                            <h5 class="width"></h5>--}}
                            {{--                            <h5 class="height"></h5>--}}
                            <h6></h6>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Uždaryti</button>
                        <button type="button" class="btn btn-primary chooseTrampoline">Pasirinkti batutą</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="banner-bottom" style="text-align: center; max-width: 100%">
        <!-- Mobile Banner -->
        <img id="mobileBannerBottom" width="100%" class="cover-photo mobile-banner" alt="banner"
             src="/images/coverPhoto/page bottom mobile (3).png">
    </div>
@endsection

@section('custom_js')
    <script> let firstTrampolineId = {{ Illuminate\Support\Js::from($firstTrampolineId) }};</script>
    <script> let trampolinesFromDb = {{ Illuminate\Support\Js::from($Trampolines) }};</script>
    <script> let unitOfMeasure = {{ Illuminate\Support\Js::from($Unit_of_measure) }};</script>
    <script src="/js/trampolines/public/trampolines_public.js"></script>
@endsection
