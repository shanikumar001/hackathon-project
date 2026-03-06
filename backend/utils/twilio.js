const twilio = require('twilio');

/**
 * Twilio Utility for OTP Verification
 */
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send an OTP via SMS
 * @param {string} phone - Target phone number with country code
 * @param {string} otp - The OTP code to send
 */
exports.sendOTP = async (phone, otp) => {
    try {
        console.log(`📤 Sending OTP ${otp} to ${phone}...`);

        // For testing/demo purposes, if TWILIO_PHONE_NUMBER is missing, just log it
        if (!process.env.TWILIO_PHONE_NUMBER) {
            console.warn('⚠️ TWILIO_PHONE_NUMBER missing in .env. Skipping real SMS.');
            return { success: true, mock: true };
        }

        const message = await client.messages.create({
            body: `Your Local Connect verification code is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone.startsWith('+') ? phone : `+91${phone}`,
        });

        console.log(`✅ OTP sent via Twilio: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('❌ Twilio Send Error:', error.message);
        throw new Error('Failed to send OTP via SMS');
    }
};
