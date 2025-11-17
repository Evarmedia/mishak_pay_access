'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Home } from 'lucide-react';

interface PaymentData {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  channel: string;
  customer: {
    email: string;
    customer_code: string;
  };
}

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setError('No transaction reference provided');
      setLoading(false);
      return;
    }

    verifyPayment(reference);
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      setPaymentData(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while verifying payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="w-16 h-16 text-slate-400 animate-spin" />;
    }
    if (error) {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }
    if (paymentData?.status === 'success') {
      return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
    }
    return <AlertCircle className="w-16 h-16 text-amber-500" />;
  };

  const getStatusBadge = () => {
    if (!paymentData) return null;

    const statusColors: Record<string, string> = {
      success: 'bg-emerald-500 hover:bg-emerald-600',
      failed: 'bg-red-500 hover:bg-red-600',
      pending: 'bg-amber-500 hover:bg-amber-600',
      abandoned: 'bg-slate-500 hover:bg-slate-600',
    };

    return (
      <Badge className={`${statusColors[paymentData.status] || 'bg-slate-500'} text-white`}>
        {paymentData.status.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            {getStatusIcon()}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {loading ? 'Verifying Payment...' : error ? 'Verification Failed' : 'Payment Verified'}
          </h1>
          <p className="text-slate-600">
            {loading
              ? 'Please wait while we verify your payment'
              : error
              ? 'We encountered an issue verifying your payment'
              : 'Your payment has been processed'}
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Details</CardTitle>
              {!loading && !error && getStatusBadge()}
            </div>
            <CardDescription>
              {loading
                ? 'Processing your transaction...'
                : error
                ? error
                : 'Your transaction has been completed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!loading && !error && paymentData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Reference</p>
                    <p className="font-mono text-sm font-medium text-slate-900 break-all">
                      {paymentData.reference}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ₦{paymentData.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900">{paymentData.customer.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Payment Method</p>
                    <p className="font-medium text-slate-900 capitalize">{paymentData.channel}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Currency</p>
                    <p className="font-medium text-slate-900">{paymentData.currency}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date</p>
                    <p className="font-medium text-slate-900">{formatDate(paymentData.paid_at)}</p>
                  </div>
                </div>

                {paymentData.status === 'success' && (
                  <>
                    <Separator />
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-emerald-900">Payment Successful</p>
                          <p className="text-sm text-emerald-700 mt-1">
                            Your payment has been processed successfully. A confirmation email has been sent to{' '}
                            {paymentData.customer.email}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {paymentData.status === 'failed' && (
                  <>
                    <Separator />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-900">Payment Failed</p>
                          <p className="text-sm text-red-700 mt-1">
                            Your payment could not be processed. Please try again or contact support.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-900 font-semibold mb-2">Verification Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Make Another Payment
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact support at{' '}
            <a href="mailto:mishakmanuel@gmail.com" className="text-emerald-600 hover:underline">
              mishakmanuel@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
