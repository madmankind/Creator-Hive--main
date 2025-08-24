import { NextRequest, NextResponse } from 'next/server';

// Mock invoices data
const mockInvoices = [
  {
    id: 'inv_001',
    number: 'INV-2024-001',
    customer: 'Acme Corp',
    customerEmail: 'billing@acme.com',
    amount: 2500.00,
    currency: 'USD',
    status: 'paid',
    dueDate: '2024-01-15',
    createdDate: '2024-01-01',
    paidDate: '2024-01-12',
    items: [
      {
        description: 'Website Design & Development',
        quantity: 1,
        rate: 2500.00,
        amount: 2500.00
      }
    ]
  },
  {
    id: 'inv_002',
    number: 'INV-2024-002',
    customer: 'TechStart Inc',
    customerEmail: 'finance@techstart.com',
    amount: 1200.00,
    currency: 'USD',
    status: 'sent',
    dueDate: '2024-01-20',
    createdDate: '2024-01-05',
    paidDate: null,
    items: [
      {
        description: 'Mobile App UI/UX Design',
        quantity: 20,
        rate: 60.00,
        amount: 1200.00
      }
    ]
  },
  {
    id: 'inv_003',
    number: 'INV-2024-003',
    customer: 'Creative Studio',
    customerEmail: 'payments@creative.studio',
    amount: 850.00,
    currency: 'USD',
    status: 'draft',
    dueDate: '2024-01-25',
    createdDate: '2024-01-08',
    paidDate: null,
    items: [
      {
        description: 'Brand Identity Package',
        quantity: 1,
        rate: 850.00,
        amount: 850.00
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let filteredInvoices = [...mockInvoices];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInvoices = filteredInvoices.filter(inv => 
        inv.number.toLowerCase().includes(searchLower) ||
        inv.customer.toLowerCase().includes(searchLower) ||
        inv.customerEmail.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json({
      invoices: paginatedInvoices,
      total: filteredInvoices.length,
      page,
      limit,
      totalPages: Math.ceil(filteredInvoices.length / limit)
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customer || !body.amount || !body.items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new invoice
    const newInvoice = {
      id: `inv_${Date.now()}`,
      number: `INV-2024-${String(mockInvoices.length + 1).padStart(3, '0')}`,
      customer: body.customer,
      customerEmail: body.customerEmail,
      amount: body.amount,
      currency: body.currency || 'USD',
      status: 'draft',
      dueDate: body.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      paidDate: null,
      items: body.items
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(newInvoice, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}