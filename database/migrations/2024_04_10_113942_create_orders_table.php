<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50); /*UNIQ STRING - HSjhdjdj */
            $table->dateTime('order_date'); /*Uzsakymo patiekimo data*/
            $table->decimal('rental_duration'); /*Kodel float - todel kad jeigu ateityje kils poreikis valandu paskaitai, gali kilti situacija kai bus x.6 val.*/
            $table->integer('delivery_address_id'); /*Mano pasiulymas yra daryti atskira adresu teibla, ir adresus siesti tu klienut*/
            $table->decimal('advance_sum'); /*Kiek klientas sumokejo avanso*/
            $table->boolean('advance_status'); /*Ar avansas sumoketas*/
            $table->decimal('total_sum'); /*Bendra mokama suma*/
            $table->integer('client_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
