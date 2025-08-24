import { NextRequest, NextResponse } from 'next/server';

// Mock payment methods data
const mockPaymentMethods = [
  {
    id: 'pm_card_001',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2027,
    isDefault: true,
    nickname: 'Business Visa',
    createdDate: '2023-06-15'
  },
  {
    id: 'pm_card_002',
    type: 'card',
    brand: 'mastercard',
    last4: '5555',
    expMonth: 8,
    expYear: 2026,
    isDefault: false,
    nickname: 'Personal MasterCard',
    createdDate: '2023-09-20'
  },
  {
    id: 'pm_bank_001',
    type: 'bank_account',
    bankName: 'Chase Bank',
    accountType: 'checking',
    last4: '1234',
    isDefault: false,
    nickname: 'Chase Checking',
    createdDate: '2023-07-10'
  }
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      paymentMethods: mockPaymentMethods
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.type) {
      return NextResponse.json(
        { error: 'Payment method type is required' },
        { status: 400 }
      );
    }
    
    // Mock creation - in real implementation, this would integrate with Stripe
    const newPaymentMethod = {
      id: `pm_${body.type}_${Date.now()}`,
      type: body.type,
      ...(body.type === 'card' ? {
        brand: body.brand || 'unknown',
        last4: body.last4 || '0000',
        expMonth: body.expMonth,
        expYear: body.expYear,
      } : {
        bankName: body.bankName,
        accountType: body.accountType || 'checking',
        last4: body.last4 || '0000',
      }),
      isDefault: body.isDefault || false,
      nickname: body.nickname || '',
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(newPaymentMethod, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}