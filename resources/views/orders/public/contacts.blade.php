@extends('layouts.layout')

@section('content')
    <div class="container flex-grow-1 mt-5">
        <div class="card shadow-sm mb-3">
            <div class="card-header bg-primary text-white">
                <h1 class="mb-0">Kontaktinė informacija</h1>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h4>Susisiekite su mumis</h4>
                        <p><strong>Adresas:</strong> Gedimino pr. 1, Vilnius, Lietuva</p>
                        <p><strong>Telefonas:</strong> +370 600 12345</p>
                        <p><strong>El. paštas:</strong> info@imone.lt</p>
                    </div>
                    <div class="col-md-6">
                        <h4>Darbo laikas</h4>
                        <p><strong>Pirmadienis - Penktadienis:</strong> 8:00 - 18:00</p>
                        <p><strong>Šeštadienis:</strong> 9:00 - 15:00</p>
                        <p><strong>Sekmadienis:</strong> Nedirbame</p>
                    </div>
                </div>
            </div>
            <div class="card-footer text-muted text-center">
                Laukiame jūsų laiškų ir skambučių!
            </div>
        </div>
    </div>
@endsection

@section('custom_js')
@endsection

