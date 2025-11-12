// 24Shapes API – Gmail API with Auto-Refresh + Error Logging
const serviceLabels = {
  'blood-test': 'Blood Test',
  molecular: 'Molecular Diagnostics',
  microbiology: 'Microbiology',
  'urine-analysis': 'Urine Analysis',
  cardiac: 'Cardiac Markers',
  vaccination: 'Vaccination',
  consultation: 'General Consultation',
  other: 'Other',
};

const adminEmailHtml = ({ firstName, lastName, email, phone, serviceName, preferredDate, message }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Consultation Enquiry</h2>
  <div style="background:#f5f5f5;padding:20px;border-radius:5px;">
    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Service:</strong> ${serviceName}</p>
    <p><strong>Preferred Date:</strong> ${preferredDate}</p>
    <p><strong>Message:</strong> ${message || 'N/A'}</p>
  </div>
</div>`;

const customerEmailHtml = ({ firstName, serviceName, preferredDate, email, phone }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Thank You for Your Enquiry</h2>
  <p>Dear ${firstName},</p>
  <p>We have received your consultation request for <strong>${serviceName}</strong>.</p>
  <div style="background:#f5f5f5;padding:20px;border-radius:5px;margin:20px 0;">
    <h3 style="margin-top:0;">Your Submission Details:</h3>
    <p><strong>Service:</strong> ${serviceName}</p>
    <p><strong>Preferred Date:</strong> ${preferredDate}</p>
    <p><strong>Contact Email:</strong> ${email}</p>
    <p><strong>Contact Phone:</strong> ${phone}</p>
  </div>
  <p>Our team will review your request and get back to you within 24-48 hours.</p>
  <p>Best regards,<br/><strong>24ShapesLab Team</strong></p>
</div>`;

// === CORS Headers ===
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// === Get Access Token ===
async function getAccessToken(env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Token refresh failed:', data);
    throw new Error(`Token error: ${data.error || data.error_description}`);
  }
  return data.access_token;
}

// === Send Email ===
// === Send Email – UTF-8 + RFC 2047 + Base64 ===
async function sendEmail(env, { to, subject, html, replyTo }) {
  try {
    const accessToken = await getAccessToken(env);

    // Encode subject in UTF-8 Base64 (RFC 2047)
    const encodeSubject = (str) => {
      return `=?utf-8?B?${btoa(unescape(encodeURIComponent(str)))}?=`;
    };

    // Encode HTML body in UTF-8 Base64
    const encodedBody = btoa(unescape(encodeURIComponent(html)));

    // Build raw MIME message
    const rawMessage = [
      `From: ${env.EMAIL_USER}`,
      `To: ${to}`,
      `Reply-To: ${replyTo || to}`,
      `Subject: ${encodeSubject(subject)}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
      '',
      encodedBody
    ].join('\r\n');

    // Final base64 encode for Gmail API
    const finalRaw = btoa(rawMessage);

    const res = await fetch(`https://www.googleapis.com/gmail/v1/users/${env.EMAIL_USER}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: finalRaw })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Gmail send error:', err);
      throw new Error('Failed to send email');
    }
  } catch (err) {
    console.error('sendEmail error:', err.message);
    throw err;
  }
}

// === Main Handler ===
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (path === '/api/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'OK',
        app: '24Shapes API',
        time: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/api/enquiry' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { firstName, lastName, email, phone, serviceType, message, preferredDate } = body;

        if (!firstName || !lastName || !email || !phone || !serviceType || !preferredDate) {
          return new Response(JSON.stringify({
            success: false,
            message: 'All required fields must be provided'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const serviceName = serviceLabels[serviceType] || serviceType;

				// Admin Email
				await sendEmail(env, {
					to: env.RECIPIENT_EMAIL || env.EMAIL_USER,
					subject: `New Enquiry - ${serviceName} - ${firstName} ${lastName}`,
					html: adminEmailHtml({ firstName, lastName, email, phone, serviceName, preferredDate, message }),
					replyTo: email,
				});

				// Customer Email
				await sendEmail(env, {
					to: email,
					subject: 'Consultation Request Received - 24ShapesLab',
					html: customerEmailHtml({ firstName, serviceName, preferredDate, email, phone }),
				});

				return new Response(
					JSON.stringify({
						success: true,
						message: 'Enquiry submitted successfully. Check your email for confirmation.',
					}),
					{
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);

      } catch (err) {
        console.error('Enquiry error:', err.message);
        return new Response(JSON.stringify({
          success: false,
          message: 'Failed to submit enquiry. Please try again later.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};