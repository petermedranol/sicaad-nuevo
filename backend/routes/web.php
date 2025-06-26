<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    //return view('welcome');
    $users = DB::table('users')->get();
    dd($users);
});
