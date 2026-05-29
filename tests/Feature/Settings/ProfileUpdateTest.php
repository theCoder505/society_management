<?php

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;

test('profile page is displayed', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->get('/settings/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    $admin->refresh();

    expect($admin->name)->toBe('Test User');
    expect($admin->email)->toBe('test@example.com');
    expect($admin->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => $admin->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    expect($admin->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->delete('/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    expect($admin->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->from('/settings/profile')
        ->delete('/settings/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/settings/profile');

    expect($admin->fresh())->not->toBeNull();
});