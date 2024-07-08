

let checkOrderStatus = {
    init: function () {
        this.Event.checkPaymentStatus()
        this.Event.startPolling()
    },
    Event:  {
        checkPaymentStatus: function () {
            $.ajax({
                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                method: 'GET',
                url: `/orders/public/order/check_payment_status/view/${order_number}`,
            }).done((response) => {
                if (response.status === 'true') {
                    window.location.href = response.private_page;
                }``
            });
        },
        startPolling: function () {
            setInterval(this.checkPaymentStatus, 5000);
        }
    }
}
$(document).ready(function () {
    console.log("/js/orders/public/order_waiting_confirmation.js");
    checkOrderStatus.init();
});
