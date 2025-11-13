import express from 'express';
import { transporter } from '../email/transporter.js';
import { serviceLabels } from '../utils.js';
import { adminEmailHtml, customerEmailHtml } from '../email/templates.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      serviceType,
      message,
      preferredDate,
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !serviceType || !preferredDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    const serviceName = serviceLabels[serviceType] || serviceType;

    // Admin email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Consultation Enquiry – ${serviceName} – ${firstName} ${lastName}`,
      html: adminEmailHtml({ firstName, lastName, email, phone, serviceName, preferredDate, message }),
      replyTo: email,
    });

    console.log(`ADMIN EMAIL SENT -> ${process.env.RECIPIENT_EMAIL} | Enquiry: ${firstName} ${lastName} | Service: ${serviceName}`);

    // Customer confirmation
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Consultation Request Received - 24ShapesLab',
      html: customerEmailHtml({ firstName, serviceName, preferredDate, email, phone }),
    });

    console.log(`CUSTOMER EMAIL SENT -> ${email} | Confirmation for ${firstName} ${lastName}`);

    res.json({
      success: true,
      message: 'Enquiry submitted successfully. Check your email for confirmation.',
    });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry. Please try again later.',
    });
  }
});

export default router;
