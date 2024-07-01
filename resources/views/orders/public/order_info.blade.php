@php
    use Carbon\Carbon;
    $currency = config('trampolines.currency');
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
            <span class="font-weight-bold">
                {{$Order->trampolines->first()->rental_start}}
                @if($Order->trampolines->first()->rental_duration > 1)
                    @php
                        $rentalEnd = Carbon::parse($Order->trampolines->first()->rental_end)->subDay()
                    @endphp
                    - {{ $rentalEnd->format('Y-m-d') }}
                @endif
            </span>
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
            <span class="font-weight-bold">{{number_format($orderTrampolines->total_sum, 2)}} {{ $currency }}</span>
        </div>
    @endforeach
    <div class="d-flex justify-content-between mt-3">
        <span class="font-weight-bold">Avansas</span>
        <span class="font-weight-bold">{{number_format($Order->advance_sum, 2)}} {{ $currency }}</span>
    </div>
    <div class="d-flex justify-content-between mt-3">
        <span class="font-weight-bold">Galutinė mokama suma vietoje</span>
        <span class="font-weight-bold theme-color">{{ number_format($Order->total_sum - $Order->advance_sum, 2) }} {{ $currency }}</span>
    </div>
    <div id="orderButtons" class="text-center mt-5 d-flex justify-content-between">
        <button class="btn btn-primary btn-thankYou payAdvance">Apmokėti avansą</button>
        <button class="btn btn-cancel-order cancelOrder" data-bs-toggle="modal" data-bs-target="#cancelOrderModal">Atšaukti užsakymą</button>
    </div>
</div>
