import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response.data;

    return NextResponse.json({
      status: true,
      message: 'Verification successful',
      data: {
        reference: data.reference,
        amount: data.amount / 100,
        currency: data.currency,
        status: data.status,
        paid_at: data.paid_at,
        channel: data.channel,
        customer: {
          email: data.customer.email,
          customer_code: data.customer.customer_code,
        },
        metadata: data.metadata,
      },
    });
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);

    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to verify payment',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
