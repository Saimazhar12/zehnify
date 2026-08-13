export interface WelcomeEmailParams {
    firstName: string;
    frontendUrl: string;
}

export function buildWelcomeEmailHtml({
    firstName,
    frontendUrl,
}: WelcomeEmailParams): string {
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Zehnify</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f8;padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(44,62,80,0.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#4A90E2 0%,#357ABD 100%);padding:36px 32px;text-align:center;">
                            <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.85);">Welcome aboard</p>
                            <h1 style="margin:0;font-size:30px;line-height:1.2;color:#ffffff;font-weight:700;">Zehnify</h1>
                            <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.92);">Your mental wellness companion</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px 12px;">
                            <h2 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#2c3e50;">Hi ${firstName},</h2>
                            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#4a5568;">
                                We're so glad you joined Zehnify. Your account has been created successfully, and you're all set to begin your wellness journey with us.
                            </p>
                            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#4a5568;">
                                Whether you want supportive conversations, thoughtful guidance, or a calm space to check in with yourself, Zehnify is here for you.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                                <tr>
                                    <td style="border-radius:10px;background-color:#4A90E2;">
                                        <a href="${frontendUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                                            Go to your dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fbff;border:1px solid #e3edf7;border-radius:12px;">
                                <tr>
                                    <td style="padding:20px 22px;">
                                        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;">What you can do next</p>
                                        <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#4a5568;">&#10003; Start a supportive wellness conversation</p>
                                        <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#4a5568;">&#10003; Track how you're feeling over time</p>
                                        <p style="margin:0;font-size:15px;line-height:1.6;color:#4a5568;">&#10003; Access resources designed to help you feel better</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 32px;">
                            <p style="margin:0;font-size:14px;line-height:1.6;color:#718096;">
                                If you didn't create this account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f7fafc;padding:24px 32px;text-align:center;border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 6px;font-size:13px;color:#a0aec0;">With care,</p>
                            <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#4a5568;">The Zehnify Team</p>
                            <p style="margin:0;font-size:12px;color:#a0aec0;">&copy; ${year} Zehnify. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
