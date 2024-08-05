@extends('layouts.layout')

@section('custom_css')
    <link href="/css/trampolines/public/public_index.css" rel="stylesheet" crossorigin="anonymous">
@endsection

@section('content')
    <div class="container">
        <div class="row mt-5">
            <div class="col-12 col-lg-6 mb-3 mt-lg-5">
{{--                <div class="text-center">--}}
{{--                    <h2>Pimpackiukai</h2> <!-- Display trampoline name -->--}}
{{--                </div>--}}
                <div id="trampolinesCarousel" class="carousel slide" data-bs-theme="dark">
                    <div class="carousel-inner">
                        @foreach($Trampolines as $Trampoline)
                            <div class="carousel-item {{ $Trampoline->active ? 'active' : '' }}" data-trampolineid='{{$Trampoline->id}}'>
                                <div class="trampoline-name text-center">
                                    <h3>{{ $Trampoline->title }}</h3> <!-- Display trampoline name -->
                                </div>
                                <a class="openModal" data-bs-target="#showTrampolineModal" data-bs-toggle="modal" href="#">
                                    <img src="{{$Trampoline->image_url}}" class="d-block w-100 modal-image" alt="...">
                                </a>
{{--                                <div class="trampoline-sizes mt-2">--}}
{{--                                    <p>Plotis: 5m, Ilgis: 5m, Aukstis: 5m</p> <!-- Display trampoline sizes -->--}}
{{--                                </div>--}}
{{--                                <div class="carousel-caption d-none d-md-block">--}}
{{--                                    <h5>Plotis: {{$Trampoline->parameter->width . config('trampolines.unit_of_measure')}},--}}
{{--                                        Ilgis: {{$Trampoline->parameter->length . config('trampolines.unit_of_measure')}},--}}
{{--                                    Aukštis: {{$Trampoline->parameter->height . config('trampolines.unit_of_measure')}}</h5>--}}
{{--                                </div>--}}
                            </div>
                        @endforeach
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#trampolinesCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#trampolinesCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
                <button id="selectTrampoline" type="button" class="btn btn-primary chooseButton w-100 mt-2">
                    Pasirinkti batutą
                </button>
            </div>
            <div class="col-12 col-lg-6 mt-5">
                <ul id="SelectedTrampolines" class="list-group">
                    {{-- <li class="list-group-item no-trampolines-message" style="display: block">No trampolines selected</li> --}}
                </ul>
                <div class="row mt-3">
                    <div class="col-12 col-md-8"></div>
                    <div class="col-12 col-md-4 text-end">
                        <button class="btn btn-primary mt-3 w-100 sendToOrderButton mb-5" id="sendToOrderButton" style="display: none;">
                            <span id="buttonText">Užsakyti</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="showTrampolineModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-custom">
                <div class="modal-content">
                    <div class="modal-body">
                        <div id="carouselExample" class="carousel slide" data-bs-theme="dark">
                            <div class="carousel-inner">
                                <!-- Carousel items for the modal -->
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
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
@endsection

@section('custom_js')
    <script> let firstTrampolineId = {{ Illuminate\Support\Js::from($firstTrampolineId) }};</script>
    <script> let trampolinesFromDb = {{ Illuminate\Support\Js::from($Trampolines) }};</script>
    <script> let unitOfMeasure = {{ Illuminate\Support\Js::from($Unit_of_measure) }};</script>
    <script src="/js/trampolines/public/trampolines_public.js"></script>
@endsection
