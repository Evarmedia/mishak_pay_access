import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { email, amount } = await request.json();

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    const amountInKobo = Math.round(parseFloat(amount) * 100);

    if (amountInKobo < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least ₦1' },
        { status: 400 }
      );
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      status: true,
      message: 'Authorization URL created',
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);

    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to initialize payment',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
