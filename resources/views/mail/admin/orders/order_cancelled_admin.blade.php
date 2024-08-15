<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Užsakymas atšauktas</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
<div
    style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="background-color: #B6D2F7; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <img src="{{config('app.link_to_homepage')}}/images/companyLogo/logo.png" alt="Įmonės logotipas"
             style="width: 70px;">
    </div>
    <div style="padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; margin: 0 0 10px; font-weight: 500;">Užsakymas atšauktas</h1>
        <p style="font-size: 16px; margin: 0 0 10px;">Užsakymas Nr. <strong>{{$order->order_number}}</strong> buvo atšauktas.</p>
        <p style="font-size: 16px; margin: 0 0 10px;">Sumokėta avanso suma: <strong>{{ $order->advance_sum }}{{ config('trampolines.currency') }}</strong></p>
    </div>
    <table role="presentation" style="width: 100%; max-width: 650px; margin: 0 auto; background-color: #B6D2F7; padding: 20px; border-collapse: collapse; min-height: 70px">
        <tbody>
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
