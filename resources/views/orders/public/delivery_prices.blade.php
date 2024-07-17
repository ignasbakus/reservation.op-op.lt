@php
    $currency = config('trampolines.currency');
@endphp

@extends('layouts.layout')

@section('content')
    <div class="container flex-grow-1 mt-5">
        <div class="card shadow-sm mb-3">
            <div class="card-header bg-secondary text-white">
                <h1 class="mb-0">Pristatymo kainos į didžiuosius Lietuvos miestus</h1>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="thead-dark">
                        <tr>
                            <th>Miestas</th>
                            <th>Kaina</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Vilnius</td>
                            <td>5.00{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Kaunas</td>
                            <td>4.50{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Klaipėda</td>
                            <td>6.00{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Šiauliai</td>
                            <td>5.50{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Panevėžys</td>
                            <td>5.00{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Alytus</td>
                            <td>4.00{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Marijampolė</td>
                            <td>4.50{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Utena</td>
                            <td>5.00{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Telšiai</td>
                            <td>5.50{{$currency}}</td>
                        </tr>
                        <tr>
                            <td>Tauragė</td>
                            <td>5.00{{$currency}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer text-muted text-center">
                Pristatymo kainos gali keistis priklausomai nuo užsakymo dydžio ir svorio.
            </div>
        </div>
    </div>
@endsection

@section('custom_js')
@endsection
