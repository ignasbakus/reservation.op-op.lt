@extends('layouts.layout')

@section('content')
    <div class="text-center">
        <div class="spinner-border text-primary" role="status">
{{--            <span class="sr-only"></span>--}}
        </div>
        <h1 class="mt-3">Laukiame Jūsų Mokėjimo</h1>
        <p class="mt-3">Šiame lange laukti nereikia. Jei užsakymą apmokėjote, patvirtinimą su papildoma informacija atsiųsime į el. paštą.</p>
    </div>
@endsection

@section('custom_js')
    <script>
        let order_number = {{ Illuminate\Support\Js::from($order_number) }}
    </script>
    <script src="/js/orders/public/order_waiting_confirmation.js"></script>
@endsection
