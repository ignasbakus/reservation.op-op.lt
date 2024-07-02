<?php

use App\Http\Controllers\ClientsController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrampolinesController;

Route::post('/webhook/initiated', [WebhookController::class, 'handleInitiated']);
Route::post('/webhook/opened', [WebhookController::class, 'handleOpened']);
Route::post('/webhook/processing', [WebhookController::class, 'handleProcessing']);
Route::post('/webhook/completed', [WebhookController::class, 'handleCompleted']);
Route::post('/webhook/canceled', [WebhookController::class, 'handleCanceled']);
Route::post('/webhook/expired', [WebhookController::class, 'handleExpired']);



Route::controller(ClientsController::class)->group(function () {
    Route::get('/clients', 'index')->name('clients');
});

Route::controller(OrderController::class)->prefix('orders')->group(function () {
    /*For admin usage (authenticated user)*/
    Route::prefix('admin')->group(function () {
        Route::get('/', 'adminGetIndex')->name("orderTableIndex"); //http://locahost:8000/orders/admin
        /* Route for admin managing of orders */
        Route::prefix('order')->group(function () {
            Route::get('getOrderUpdateData', 'prepareOrderUpdateModalInfo');
            Route::get('getCalendarInitial', 'initializeOrderUpdateCalendar');
            Route::post('private_calendar/get', 'privateUpdateCalendar');
            Route::post('datatable/get', 'adminGetDatatable');
            Route::delete('deleteUnpaidOrders', 'checkForUnpaidOrders');
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
        /* Route for new orders/customers */
        Route::prefix('order')->group(function () {
            Route::post('public_calendar/get', 'publicUpdateCalendar');
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
        Route::prefix('admin')->group(function () {
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



