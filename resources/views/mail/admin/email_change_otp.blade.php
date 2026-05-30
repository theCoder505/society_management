<!DOCTYPE html>
<html>
<head>
    <style>
        .container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .brand {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .otp-box {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 5px;
            color: #1e293b;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand">{{ $brandname }}</div>
        </div>
        <h3>Verify Email Change</h3>
        <p>Hello {{ $user->name }},</p>
        <p>You are receiving this email because you requested to change your email address on your <strong>{{ $brandname }}</strong> account.</p>
        <div class="otp-box">
            <p style="margin-bottom: 10px; font-weight: 600;">Your Verification Code</p>
            <div class="otp-code">{{ $otp }}</div>
        </div>
        <p>This code will expire in 10 minutes. If you did not request this change, please ignore this email.</p>
        <div class="footer">
            &copy; {{ date('Y') }} {{ $brandname }}. All rights reserved.
        </div>
    </div>
</body>
</html>