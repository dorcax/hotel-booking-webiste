import React from 'react';

interface OtpEmailProps {
  name: string;
  code: string;
  year: number;
}

export const OtpEmail = ({ name, code, year }: OtpEmailProps) => (
  <div className="bg-gray-100 min-h-screen py-8 px-4">
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-blue-600 text-2xl font-bold mb-4">Verify Your Email Address</h2>
      <p className="mb-2">Hello {name},</p>
      <p className="mb-4">
        Thank you for signing up with Haven Hotel. Please use the OTP code below to verify your email address. 
        This code will expire in <strong>10 minutes</strong>.
      </p>

      <div className="text-2xl font-bold text-blue-600 bg-blue-50 p-4 rounded text-center tracking-widest mb-4">
        {code}
      </div>

      <p className="text-gray-700 text-sm mb-4">
        If you didn’t create this account, you can safely ignore this email.
      </p>

      <div className="text-gray-500 text-xs text-center mt-6">
        &copy; {year} Haven Hotel. All rights reserved.
      </div>
    </div>
  </div>
);
