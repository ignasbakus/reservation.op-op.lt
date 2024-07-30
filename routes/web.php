<?php

use App\Http\Controllers\ClientsController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentsController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrampolinesController;

Route::controller(PaymentsController::class)->group(function () {
    Route::get('/status', 'checkPaymentStatus');
    Route::post('/webhook/montonio', 'paymentResponse');
});

Route::controller(OrderController::class)->prefix('orders')->group(function () {
    /*For admin usage (authenticated user)*/
    Route::middleware('auth')->prefix('admin')->group(function () {
        Route::get('/', 'adminGetIndex')->name("orderTableIndex");
        /* Route for admin managing of orders */
        Route::prefix('order')->group(function () {
            Route::get('getOrderUpdateData', 'prepareOrderUpdateModalInfo');
            Route::get('getCalendarInitial', 'initializeOrderUpdateCalendar');
            Route::post('private_calendar/get', 'privateUpdateCalendar');
            Route::post('datatable/get', 'adminGetDatatable');
            Route::delete('deleteUnpaidOrders', 'checkForUnpaidOrders');
            Route::post('sendEmail', 'sendAdditionalEmail');
            //http://locahost:8000/orders/admin/order [CRUD]
            Route::get('/', 'orderGet');
            Route::post('/', 'orderInsert');
            Route::put('/', 'orderUpdate');
            Route::delete('/', 'orderDelete');
        });
    });
    /*For customer usage (no authentication)*/
    Route::prefix('public')->group(function () {
        Route::get('/', 'publicGetIndex'); //http://locahost:8000/orders/public
        Route::get('delivery_prices', 'deliveryPricesIndex')->name('deliveryPricesIndex');
        Route::get('contacts', 'contactsIndex')->name('contactsIndex');
        /* Route for new orders/customers */
        Route::prefix('order')->group(function () {
            Route::get('test', 'test');
            Route::get('getCalendarInitial', 'initializeOrderUpdateCalendar');
            Route::get('getOrderUpdateData', 'prepareOrderUpdateModalInfo');
            Route::get('waiting_confirmation/view/{order_number}', 'orderWaitingConfirmationView');
            Route::get('check_payment_status/view/{order_number}', 'waitingForWebhook');
            Route::post('generate_url', 'generatePaymentUrl');
            Route::post('private_calendar/get', 'privateUpdateCalendar');
            Route::post('public_calendar/get', 'publicUpdateCalendar');
            Route::put('updateDeliveryTime', 'updateDeliveryTime');
            //http://locahost:8000/orders/public/order [CRUD] without UUID
            Route::get('/', 'orderGet');
            Route::post('/', 'orderInsert');
            Route::put('/', 'orderUpdate');
            Route::delete('/', 'orderDelete');

            //http://locahost:8000/orders/public/order/view [CRUD] with UUID
            Route::get('/view/{order_number}', 'publicGetIndexViaEmail')->name('publicGetIndexViaEmail');
            //Route::post('/view/{order_number}', 'orderInsert');
            Route::put('/view/{order_number}', 'orderCancel');
            //Route::delete('/view/{order_number}', 'orderDelete');
        });
    });
});

Route::controller(TrampolinesController::class)->group(function () {
    Route::get('/', 'publicIndex')->name('trampolinesPublic');
    Route::prefix('trampolines')->group(function () {
        Route::post('public/render_selected_view', 'publicRenderSelectedTrampolines')->name('trampolinesPublicSectionA');
        //http://localhost:8000/trampolines/admin/
        Route::middleware('auth')->prefix('admin')->group(function () {
            Route::get('/', 'privateIndex')->name('adminIndex');
            /*http://locahost:8000/trampolines/admin/trampoline [GET/POST/PUT/DELETE]*/
            Route::prefix('trampoline')->group(function () {
                Route::post('datatable/get', 'adminGetDatatable');
                /*CRUD*/
                Route::get('/', 'adminGet');
                Route::post('/', 'adminInsert');
                Route::put('/', 'adminUpdate');
                Route::delete('/', 'adminDelete');
            });
            Route::prefix('calendar')->group(function () {
                Route::get('/', 'calendarIndex')->name('calendarIndex');
            });
        });
    });
});

Auth::routes();

Route::get('/home', [TrampolinesController::class, 'publicIndex']);
