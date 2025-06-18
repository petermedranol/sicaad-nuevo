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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('user_type_id')->nullable()->after('email_verified_at');
            $table->string('campus', 100)->nullable()->after('user_type_id'); // Plantel del usuario
            $table->boolean('is_active')->default(true)->after('campus'); // Si el usuario está activo
            
            // Foreign key
            $table->foreign('user_type_id')->references('id')->on('user_types')->onDelete('set null');
            
            // Index
            $table->index(['user_type_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['user_type_id']);
            $table->dropIndex(['user_type_id', 'is_active']);
            $table->dropColumn(['user_type_id', 'campus', 'is_active']);
        });
    }
};
