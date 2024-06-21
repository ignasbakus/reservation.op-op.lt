@php
    use Carbon\Carbon
@endphp
<div class="px-4 py-5">
    <h5 class="text-uppercase">{{$Order->client->name}} {{$Order->client->surname}}</h5>
    <h4 class="mt-5 theme-color mb-5">Ačiū už jūsų rezervaciją!</h4>
    @if($Order->trampolines->isNotEmpty())
        <div class="d-flex justify-content-between mb-5">
            @if($Order->trampolines->first()->rental_duration <= 1)
                <span class="font-weight-bold">Rezervuota diena</span>
            @else
                <span class="font-weight-bold">Rezervuotos dienos</span>
            @endif
            <span class="font-weight-bold">{{$Order->trampolines->first()->rental_start}}</span>
            @if($Order->trampolines->first()->rental_duration > 1)
                @php
                    $rentalEnd = Carbon::parse($Order->trampolines->first()->rental_end)->subDay()
                @endphp
                <span class="font-weight-bold">{{ $rentalEnd->format('Y-m-d') }}</span>
            @endif
        </div>
    @endif
    <span></span>
    <h5 class="theme-color">Mokėjimo suvestinė</h5>
    <div class="mb-3">
        <hr class="new1">
    </div>
    @foreach($Order->trampolines as $orderTrampolines)
        <div class="d-flex justify-content-between">
            <span class="font-weight-bold">Batutas {{$orderTrampolines->trampoline->title}}</span>
            <span class="font-weight-bold">{{number_format($orderTrampolines->total_sum, 2)}} €</span>
        </div>
    @endforeach
    <div class="d-flex justify-content-between mt-3">
        <span class="font-weight-bold">Avansas</span>
        <span class="font-weight-bold">{{number_format($Order->advance_sum, 2)}}</span>
    </div>
    <div class="d-flex justify-content-between mt-3">
        <span class="font-weight-bold">Galutinė mokama suma</span>
        <span class="font-weight-bold theme-color">{{ number_format($Order->total_sum - $Order->advance_sum, 2) }} €</span>
    </div>
    <div class="text-center mt-5">
        <button class="btn btn-primary btn-thankYou">Apmokėti avansą</button>
    </div>
</div>
