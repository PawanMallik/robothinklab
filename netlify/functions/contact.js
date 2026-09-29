import nodemailer from 'nodemailer';

export const handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight OPTIONS check
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { first_name, last_name, email, school_name, role, phone, city, state, message } = data;

    if (!first_name || !email || !school_name || !phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Please provide all required fields (Name, Email, School, Phone).' })
      };
    }

    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;
    const toEmail = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER || 'robothinklab@gmail.com';

    // If environment variables are not yet configured
    if (!smtpUser || !smtpPass) {
      console.warn('EMAIL_USER and EMAIL_PASS environment variables are not set.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'SMTP credentials missing. Please set EMAIL_USER and EMAIL_PASS in your Netlify Environment Variables.'
        })
      };
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const fullName = `${first_name} ${last_name || ''}`.trim();

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #0b0f19; color: #f3f4f6;">
        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="color: #3b82f6; font-size: 24px; margin: 0; letter-spacing: -0.5px;">RoboThinkLab</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 6px 0 0 0;">New School Partnership Inquiry</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 15px;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 12px 0; color: #9ca3af; width: 38%;">School / Institution</td>
            <td style="padding: 12px 0; color: #ffffff; font-weight: 600;">${school_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 12px 0; color: #9ca3af;">Contact Person</td>
            <td style="padding: 12px 0; color: #ffffff;">${fullName}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 12px 0; color: #9ca3af;">Designation / Role</td>
            <td style="padding: 12px 0; color: #ffffff;">${role || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 12px 0; color: #9ca3af;">Phone Number</td>
            <td style="padding: 12px 0; color: #3b82f6; font-weight: 600;">
              <a href="tel:+91${phone}" style="color: #3b82f6; text-decoration: none;">+91 ${phone}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 12px 0; color: #9ca3af;">Email</td>
            <td style="padding: 12px 0; color: #ffffff;">
              <a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 12px 0; color: #9ca3af;">Location</td>
            <td style="padding: 12px 0; color: #ffffff;">${city || ''}, ${state || ''}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #9ca3af; vertical-align: top;">Message</td>
            <td style="padding: 14px 0; color: #e5e7eb; line-height: 1.6; white-space: pre-wrap;">${message || 'No additional requirements specified.'}</td>
          </tr>
        </table>

        <div style="background-color: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #93c5fd; margin-bottom: 20px;">
          Tip: You can reply directly to this email to contact <strong>${fullName}</strong> (${email}).
        </div>

        <div style="font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); pt: 16px; padding-top: 16px;">
          Received via RoboThinkLab Website | <a href="https://robothinklab.com" style="color: #9ca3af; text-decoration: underline;">robothinklab.com</a>
        </div>
      </div>
    `;

    // Send Mail
    await transporter.sendMail({
      from: `"RoboThinkLab Leads" <${smtpUser}>`,
      to: toEmail,
      replyTo: email,
      subject: `🚨 New School Partnership Inquiry: ${school_name} (${fullName})`,
      text: `New School Inquiry:
School: ${school_name}
Name: ${fullName}
Role: ${role}
Phone: +91 ${phone}
Email: ${email}
Location: ${city}, ${state}
Message: ${message}
      `,
      html: htmlContent
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inquiry received and email delivered successfully!'
      })
    };
  } catch (error) {
    console.error('Nodemailer Send Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to send email'
      })
    };
  }
};
