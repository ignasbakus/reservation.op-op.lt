<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders_trampolines', function (Blueprint $table) {
            $table->id();
            $table->integer('orders_id');
            $table->integer('trampolines_id');
            $table->date('rental_start');
            $table->date('rental_end');
            $table->decimal('rental_duration');
            $table->decimal('total_sum');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders_trampolines');
    }
};
