@extends('layouts.layout')

@section('content')
    <div class="row">
        <div class="col text-center mb-3">
            <h1>Musu batutai</h1>
        </div>
    </div>
    <div class="row ">
        <div class="col-4">
            <div id="trampolinesCarousel" class="carousel slide" data-bs-theme="dark">
                <div class="carousel-inner">
                    @foreach($Trampolines as $Trampoline)
                        @if ($Trampoline->active)
                            <div class="carousel-item active" data-trampolineid='{{$Trampoline->id}}'>
                                <img src="{{$Trampoline->image_url}}" class="d-block w-100" alt="...">
                            </div>
                        @else
                            <div class="carousel-item" data-trampolineid='{{$Trampoline->id}}'>
                                <img src="{{$Trampoline->image_url}}" class="d-block w-100" alt="...">
                            </div>
                        @endif
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
            <button id="selectTrampoline" type="button" class="col btn opacity-50 btn-light chooseButton"
                    style="width: 100%">
                Pasirinkti batuta
            </button>
        </div>
        <div class="col-1"></div>
        <div class="col-7">
            Jusu pasirinkti batutai
            <ul id="SelectedTrampolines" class="list-group"></ul>
            <div class="row mt-3 ">
                <div class="col-8"></div>
                <div class="col-4 text-end">
                    <button name="sendToOrder" id="sendToOrder" type="button" class="btn btn-primary w-75">Užsakyti</button>
                </div>
            </div>
        </div>
    </div>

@endsection

@section('custom_js')
    <script src="/js/trampolines/public/trampolines_public.js"></script>
@endsection

