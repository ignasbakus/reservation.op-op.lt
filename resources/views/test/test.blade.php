@extends('layouts.layout')

@section('content')
    <div class="container">
        <div>
            <label for="flatPickerCalendar">Užsakymo datos</label>
            <input name="flatPickerCalendar" class="form-control" type="text" id="flatPickerCalendar" placeholder="Pasirinkite datas" required>
        </div>
    </div>
@endsection

@section('custom_js')
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="/js/test/testFlatPicker.js"></script>
{{--    <script src="/js/orders/public/order_public.js"></script>--}}
@endsection
