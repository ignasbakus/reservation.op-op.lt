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
        Schema::create('montonio_payment_creation_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('order_id');
            $table->integer('client_id')->nullable()->default(null);
            $table->json('payment_creation_response');
            $table->json('payload');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('montonio_payment_creation_logs');
    }
};
