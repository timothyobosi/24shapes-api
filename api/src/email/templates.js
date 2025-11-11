export const adminEmailHtml = ({
  firstName,
  lastName,
  email,
  phone,
  serviceName,
  preferredDate,
  message,
}) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Consultation Enquiry</h2>
  <div style="background:#f5f5f5;padding:20px;border-radius:5px;">
    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Service:</strong> ${serviceName}</p>
    <p><strong>Preferred Date:</strong> ${preferredDate}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;">${message || 'N/A'}</p>
  </div>
</div>`;

export const customerEmailHtml = ({
  firstName,
  serviceName,
  preferredDate,
  email,
  phone,
}) => `
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
