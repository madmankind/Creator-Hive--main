import { NextRequest, NextResponse } from 'next/server';

// Mock clients data
const mockClients = [
  {
    id: 'client_001',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    company: 'Acme Corporation',
    phone: '+1 (555) 123-4567',
    address: {
      line1: '123 Business St',
      line2: 'Suite 100',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US'
    },
    totalInvoiced: 15000.00,
    totalPaid: 12500.00,
    invoiceCount: 8,
    status: 'active',
    createdDate: '2023-06-15',
    lastInvoiceDate: '2024-01-01'
  },
  {
    id: 'client_002',
    name: 'TechStart Inc',
    email: 'finance@techstart.com',
    company: 'TechStart Inc.',
    phone: '+1 (555) 234-5678',
    address: {
      line1: '456 Innovation Ave',
      line2: '',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US'
    },
    totalInvoiced: 8500.00,
    totalPaid: 7300.00,
    invoiceCount: 5,
    status: 'active',
    createdDate: '2023-09-20',
    lastInvoiceDate: '2024-01-05'
  },
  {
    id: 'client_003',
    name: 'Creative Studio',
    email: 'payments@creative.studio',
    company: 'Creative Studio LLC',
    phone: '+1 (555) 345-6789',
    address: {
      line1: '789 Design Blvd',
      line2: 'Floor 3',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    totalInvoiced: 4200.00,
    totalPaid: 4200.00,
    invoiceCount: 3,
    status: 'active',
    createdDate: '2023-11-10',
    lastInvoiceDate: '2024-01-08'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let filteredClients = [...mockClients];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredClients = filteredClients.filter(client => client.status === status);
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredClients = filteredClients.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.company.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by last invoice date (most recent first)
    filteredClients.sort((a, b) => 
      new Date(b.lastInvoiceDate).getTime() - new Date(a.lastInvoiceDate).getTime()
    );
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return NextResponse.json({
      clients: paginatedClients,
      total: filteredClients.length,
      page,
      limit,
      totalPages: Math.ceil(filteredClients.length / limit)
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Create new client
    const newClient = {
      id: `client_${Date.now()}`,
      name: body.name,
      email: body.email,
      company: body.company || '',
      phone: body.phone || '',
      address: body.address || {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      },
      totalInvoiced: 0,
      totalPaid: 0,
      invoiceCount: 0,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      lastInvoiceDate: null
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return NextResponse.json(newClient, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}