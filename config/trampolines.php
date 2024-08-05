<?php
return [

    /*Custom params, variables of Trampoline rent business*/
    'currency' => env('TRAMPOLINES_TRANSACTIONS_CURRENCY', '€'),

    /* Custom param, which declares minimum rental duration to 1 */
    'rental_duration' => env('TRAMPOLINES_RENTAL_DURATION', 1),

    /* Custom param, which declares the rental duration type, which now is day */
    'rental_duration_type' => env('TRAMPOLINES_RENTAL_DURATION_TYPE', 'd'),

    /* Custom param, which declares the advance percentage to 0.3 */
    'advance_percentage' => env('TRAMPOLINES_ADVANCE_PERCENTAGE', 0.3),

    /* Custom param, which declares when the user won't be able to edit an order. For example, if 3, if the rental start
    is less than 3 days from now, user wont be allowed to edit. */
    'amount_of_days' => env('ALLOWED_DAYS_TO_UPDATE', 3),

    /* Custom param, units of measure */
    'unit_of_measure' => env('TRAMPOLINE_UNIT_OF_MEASURE', 'm'),
];
