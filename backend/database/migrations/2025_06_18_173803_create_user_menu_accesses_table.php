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
        Schema::create('user_menu_accesses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Usuario que tiene acceso
            $table->unsignedBigInteger('menu_id'); // Menú al que tiene acceso
            $table->enum('access_level', ['capturista', 'administrator', 'super_admin'])
                  ->default('capturista'); // Nivel de acceso
            $table->boolean('is_active')->default(true); // Si el acceso está activo
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('menu_id')->references('id')->on('menus')->onDelete('cascade');
            
            // Unique constraint - un usuario no puede tener múltiples accesos al mismo menú
            $table->unique(['user_id', 'menu_id']);
            
            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index(['menu_id', 'access_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_menu_accesses');
    }
};
