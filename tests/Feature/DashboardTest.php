<?php

use App\Models\Admin;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($admin = Admin::factory()->create());

    $this->get('/dashboard')->assertOk();
});