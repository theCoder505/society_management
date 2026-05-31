<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Property Inquiry</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #eef2f5;
        }
        .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
            color: #334155;
            line-height: 1.6;
        }
        .content h2 {
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 18px;
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .data-table td {
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }
        .data-table td.label {
            font-weight: 600;
            color: #64748b;
            width: 140px;
        }
        .data-table td.value {
            color: #0f172a;
        }
        .message-box {
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            border-radius: 4px;
            font-style: italic;
            color: #475569;
            margin-top: 10px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            border-top: 1px solid #eef2f5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Property Inquiry & Society Lead Form</h1>
        </div>
        <div class="content">
            <h2>Customer Inquiry Details</h2>
            <table class="data-table">
                <tr>
                    <td class="label">Full Name</td>
                    <td class="value">{{ $inquiryData['name'] ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Email Address</td>
                    <td class="value">{{ $inquiryData['email'] ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Contact Number</td>
                    <td class="value">{{ $inquiryData['contact'] ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Interest Type</td>
                    <td class="value" style="text-transform: capitalize;">{{ $inquiryData['type'] ?? 'N/A' }}</td>
                </tr>
                @if(!empty($inquiryData['flat_id']))
                <tr>
                    <td class="label">Preferred Flat</td>
                    <td class="value">{{ $inquiryData['flat_id'] }}</td>
                </tr>
                @endif
            </table>

            <h2>Customer Message</h2>
            <div class="message-box">
                "{{ $inquiryData['message'] ?? 'No message provided.' }}"
            </div>
        </div>
        <div class="footer">
            <p>This email was generated from the public surface web contact system.</p>
        </div>
    </div>
</body>
</html>
