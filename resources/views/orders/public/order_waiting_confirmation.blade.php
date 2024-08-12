@php

    $homepage = config('app.link_to_homepage');
@endphp

@extends('layouts.layout')

@section('content')
    <div id="successPayment"  class="text-center" style="display:block;">
        <div class="mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <h1 class="mt-3">Laukiame Jūsų Mokėjimo</h1>
            <p class="mt-3">Šiame lange laukti nereikia. Jei užsakymą apmokėjote, patvirtinimą su papildoma informacija
                atsiųsime į el. paštą.</p>
        </div>
    </div>
    <div id="failedPayment" class="text-center" style="display: none;">
{{--        <div class="spinner-border text-primary" role="status"></div>--}}
        <h1 class="mt-3">Jūsų užsakymas buvo neapmokėtas</h1>
        <p class="mt-3">Jei norite užsakymą pateikti iš naujo, spauskite <a href="{{$homepage}}">čia</a></p>
    </div>
@endsection

@section('custom_js')
    <script>
        let order_number = {{ Illuminate\Support\Js::from($order_number) }}
    </script>
    <script src="/js/orders/public/order_waiting_confirmation.js"></script>
@endsection
