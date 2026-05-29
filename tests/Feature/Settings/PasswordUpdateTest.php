<?php

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/password');

    expect(Hash::check('new-password', $admin->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect('/settings/password');
});