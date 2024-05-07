<?php

use App\Http\Controllers\ClientsController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrampolinesController;

Route::controller(ClientsController::class)->group(function () {
    Route::get('/clients', 'index')->name('clients');
});

Route::controller(OrderController::class)->prefix('orders')->group(function () {
    /*For admin usage (authenticated user)*/
    Route::prefix('admin')->group(function () {
        Route::get('/', 'adminGetIndex'); //http://locahost:8000/orders/admin
        Route::prefix('order')->group(function () {
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
        Route::prefix('order')->group(function () {
            //http://locahost:8000/orders/public/order [CRUD]
            Route::get('/', 'orderGet');
            Route::post('/', 'orderInsert');
            Route::put('/', 'orderUpdate');
            Route::delete('/', 'orderDelete');
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


