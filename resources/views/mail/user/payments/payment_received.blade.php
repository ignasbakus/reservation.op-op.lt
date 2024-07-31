<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batuto Nuomos Patvirtinimas</title>
    <link href="/frameworks/bootstrap-5.3.3/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="/frameworks/bootstrap-icons-1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body>
<div style="max-width: 600px; margin: 0 auto;">
    <div style="max-width: 650px; margin: 0 auto;">
        <!-- Table-based centering for better compatibility -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
               style="background-color: #B6D2F7; height: 100px; margin: 0 auto;">
            <tr>
                <td align="center" style="vertical-align: middle;">
                    <img src="{{config('app.link_to_homepage')}}/images/companyLogo/logo.png" width="70" height="70"
                         style="display: block;" alt="Company Logo" title="Company Logo">
                </td>
            </tr>
        </table>
    </div>
    <div style="max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 50px;">
            <p style="font-weight: 500; font-size: 27px;">Jūsų užsakymas apmokėtas!</p>
            <p>Užsakymo nr. <span style="font-weight: 600;">{{ $order->order_number }}</span></p>
        </div>

        <p>Gerb. kliente,</p>

        <p style="margin-bottom: 40px;">Jūsų batuto nuomos užsakymas apmokėtas. Žemiau rasite užsakymo detales.</p>

        <div
            style="background-color: #F5F7F7; padding: 30px; border-radius: 5px; margin-bottom: 40px; color: #124E78; text-align: center;">
            <!-- Use an anchor tag styled as a button -->
            <a href="{{ url('/orders/public/order/view/' . $order->order_number) }}"
               style="background-color: #B6D2F7; color: black; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: 500;">Redaguoti
                užsakymą</a>
        </div>

        <p style="margin-bottom: 40px;"><span style="font-weight: 700;">Svarbi informacija!</span> Jeigu užsakymą
            atšauksite, avansas bus negrąžinamas.</p>

        <h4 style="font-weight: 500; font-size: 1.5rem; margin-bottom: 10px">Užsakymo informacija</h4>
        <div style="background-color: #B6D2F7; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="font-weight: 500; width: 50%; vertical-align: top;">Rezervuotos dienos:</td>
                    <td style="text-align: right;">{{ \Carbon\Carbon::parse($order->trampolines->first()->rental_start)->format('Y-m-d') }}
                        -
                        {{ \Carbon\Carbon::parse($order->trampolines->first()->rental_end)->subDay()->format('Y-m-d') }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Pristatymo laikas:</td>
                    <td style="text-align: right;">{{ $order->trampolines->first()->delivery_time }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Batutai:</td>
                    <td style="text-align: right;"> @foreach($order->trampolines as $orderTrampoline)
                            {{$orderTrampoline->trampoline->title}}<br>
                        @endforeach
                    </td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Avansas:</td>
                    <td style="text-align: right;">{{ number_format($order->advance_sum, 2) }}{{ config('trampolines.currency') }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Likusi mokėti suma:<span style="color: red"> *</span></td>
                    <td style="text-align: right;">{{ number_format($order->total_sum, 2) - number_format($order->advance_sum, 2) }}{{ config('trampolines.currency') }} </td>
                </tr>
            </table>
        </div>

        <div style="font-weight: 500; font-size: 1.5rem;">
            <p style="font-size: 13px; margin-bottom: 40px;"><span style="color: red">* </span>Prie likusios mokėti
                sumos prisidės papildomos išlaidos už pristatymą.</p>
        </div>

        <h4 style="font-weight: 500; font-size: 1.5rem; margin-bottom: 10px">Kliento informacija</h4>
        <div style="background-color: #B6D2F7; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="font-weight: 500;">Vardas Pavardė:</td>
                    <td style="text-align: right;">{{ $order->client->name }} {{ $order->client->surname }} </td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Telefonas:</td>
                    <td style="text-align: right;">{{ $order->client->phone }} </td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Miestas:</td>
                    <td style="text-align: right;">{{ $order->address->address_town }} </td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Gatvė:</td>
                    <td style="text-align: right;">{{ $order->address->address_street }} </td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Pašto kodas:</td>
                    <td style="text-align: right;">{{ $order->address->address_postcode }} </td>
                </tr>
            </table>
        </div>

        <div style="margin-top: 40px;">
            <p>Dėkojame, kad pasirinkote op-op batutų nuomą!</p>
            <p>Jei kiltų klausimų - drąsiai susisiekite telefonu {{config('contactInfo.phone')}} ar
                el.paštu {{config('contactInfo.email')}} ir mes Jums mielai padėsime.</p>
        </div>
    </div>

    <table role="presentation" style="width: 100%; max-width: 650px; margin: 0 auto; background-color: #B6D2F7; padding: 20px; border-collapse: collapse; min-height: 150px">
        <tbody>
        <tr>
            <td style="text-align: center; font-size: 12px; color: black; vertical-align: middle;">
                <!-- Facebook Icon -->
                <a href="ADDLINKTOFACEBOOK" style="display: block; text-decoration: none; color: black; font-family: 'Open Sans', sans-serif;" target="_blank">
                    <svg style="display: block; margin: 0 auto;" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"></path>
                    </svg>
                </a>
            </td>
        </tr>
        <tr>
            <td style="text-align: center; font-size: 16px; color: black; font-family: 'Open Sans', sans-serif; padding-top: 10px;">
                <a href="{{config('app.link_to_homepage')}}" style="text-decoration: none; color: black;" target="_blank">
                    op-op.lt
                </a>
            </td>
        </tr>
        <tr>
            <td style="text-align: center; font-size: 18px; color: black; font-weight: 500; font-family: 'Open Sans', sans-serif; padding-top: 10px;">
                <a href="tel:{{config('contactInfo.phone')}}" style="text-decoration: none; color: black;" target="_blank">
                    <svg style="display: block; margin: 0 auto;" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"></path>
                    </svg>
                    {{config('contactInfo.phone')}}
                </a>
            </td>
        </tr>
        </tbody>
    </table>

</div>
</body>
</html>
