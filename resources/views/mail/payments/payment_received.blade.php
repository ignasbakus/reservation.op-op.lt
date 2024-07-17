<!DOCTYPE html>
<html>
<head>
    <title>Užsakymas apmokėtas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }

        .container {
            width: 100%;
            padding: 20px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 8px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }

        .order-details, .customer-info, .trampolines, .address-info {
            margin-bottom: 20px;
        }

        .order-details table, .customer-info table, .trampolines table, .address-info table {
            width: 100%;
            border-collapse: collapse;
        }

        .order-details th, .customer-info th, .trampolines th, .address-info th, .order-details td, .customer-info td, .trampolines td, .address-info td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        .order-details th, .customer-info th, .trampolines th, .address-info th {
            background-color: #f2f2f2;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #555;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Jūsų užsakymas yra apmokėtas!</h1>
    </div>
    <div>
        <h2>Savo užsakymą galite peržiūrėti čia: <a
                href="{{ url('/orders/public/order/view/' . $order->order_number) }}">Spauskite čia</a></h2>
        <br>
        <h4>Svarbu! Atšaukus užakymą, avansas negražinamas</h4>
    </div>
    <div class="order-details">
        <h2>Užsakymo detalės</h2>
        <table>
            <tr>
                <th>Užsakymo numeris</th>
                <td>{{ $order->order_number }}</td>
            </tr>
            <tr>
                <th>Data</th>
                <td>{{ $order->created_at->format('Y-m-d') }}</td>
            </tr>
            <tr>
                <th>Sumokėta avanso suma</th>
                <td>{{ number_format($order->advance_sum, 2) }}{{config('trampolines.currency')}}</td>
            </tr>
            <tr>
                <th>Bendra suma</th>
                <td>{{ number_format($order->total_sum, 2) }}{{config('trampolines.currency')}}</td>
            </tr>
            <tr>
                <th>Galutinė mokama suma vietoje</th>
                <td>{{ number_format($order->total_sum, 2) - number_format($order->advance_sum, 2) }}{{config('trampolines.currency')}}</td>
            </tr>
        </table>
        <h6>
            Prie galutinės užsakymo sumos prisidės pristatymo kaina. Apytiksles kainas į didžiuosius Lietuvos miestus <a href="{{route('deliveryPricesIndex')}}">rasite čia</a>. <br>
            Jeigu savo miesto nerandate, prašome susisiekti su mumis el. paštu: op-op.lt arba telefonu: +370 600 00000
        </h6>
    </div>

    <div class="customer-info">
        <h2>Kliento informacija</h2>
        <table>
            <tr>
                <th>Vardas</th>
                <td>{{ $order->client->name }}</td>
            </tr>
            <tr>
                <th>Pavardė</th>
                <td>{{ $order->client->surname }}</td>
            </tr>
            <tr>
                <th>El. paštas</th>
                <td>{{ $order->client->email }}</td>
            </tr>
            <tr>
                <th>Telefonas</th>
                <td>{{ $order->client->phone }}</td>
            </tr>
        </table>
    </div>

    <div class="address-info">
        <h2>Pristatymo adresas</h2>
        <table>
            <tr>
                <th>Miestas</th>
                <td>{{ $order->address->address_town }}</td>
            </tr>
            <tr>
                <th>Gatvė</th>
                <td>{{ $order->address->address_street }}</td>
            </tr>
            <tr>
                <th>Pašto kodas</th>
                <td>{{ $order->address->address_postcode }}</td>
            </tr>
        </table>
    </div>

    <div class="trampolines">
        <h2>Pasirinkti batutai</h2>
        <table>
            <tr>
                <th>Pavadinimas</th>
                <th>Nuomos pradžia</th>
                <th>Nuomos pabaiga</th>
                <th>Pristatymo laikas</th>
                <th>Kaina</th>
            </tr>
            @foreach ($order->trampolines as $orderTrampoline)
                <tr>
                    <td>{{ $orderTrampoline->trampoline->title }}</td>
                    <td>{{ \Carbon\Carbon::parse($orderTrampoline->rental_start)->format('Y-m-d') }}</td>
                    <td>{{ \Carbon\Carbon::parse($orderTrampoline->rental_end)->subDay()->format('Y-m-d') }}</td>
                    <td> {{ $orderTrampoline->delivery_time }} </td>
                    <td>{{ number_format($orderTrampoline->total_sum, 2) }} €</td>
                </tr>
            @endforeach
        </table>
    </div>
    <div class="footeris">
        <p>Jeigu turite klausimų, susisiekite su mumis el. paštu uzsakymai@op-op.lt arba telefonu +370 600 00000</p>
        <p>Ačiū, kad rinkotės mus!</p>
    </div>
</div>
</body>
</html>
