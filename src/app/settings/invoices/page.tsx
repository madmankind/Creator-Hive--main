'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsLayout } from '@/components/stripekit/SettingsLayout';
import { Table, Column } from '@/components/stripekit/Table';
import { Badge } from '@/components/stripekit/Badge';
import { Modal } from '@/components/stripekit/Modal';
import { formatCurrency } from '@/lib/utils';
import { Plus, Eye, Download, Send } from 'lucide-react';

interface Invoice extends Record<string, unknown> {
  id: string;
  number: string;
  customer: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdDate: string;
  paidDate: string | null;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

const statusVariants = {
  draft: 'default' as const,
  sent: 'info' as const,
  paid: 'success' as const,
  overdue: 'danger' as const,
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Create invoice form state
  const [createForm, setCreateForm] = useState({
    customer: '',
    customerEmail: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchValue,
        status: statusFilter,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      
      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();
      
      setInvoices(data.invoices);
      setTotalInvoices(data.total);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [searchValue, statusFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCreateInvoice = async () => {
    try {
      const totalAmount = createForm.items.reduce((sum, item) => sum + item.amount, 0);
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          amount: totalAmount,
        }),
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setCreateForm({
          customer: '',
          customerEmail: '',
          dueDate: '',
          items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        });
        fetchInvoices();
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const updateCreateFormItem = (index: number, field: string, value: string | number) => {
    const newItems = [...createForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount for quantity/rate changes
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setCreateForm({ ...createForm, items: newItems });
  };

  const addCreateFormItem = () => {
    setCreateForm({
      ...createForm,
      items: [...createForm.items, { description: '', quantity: 1, rate: 0, amount: 0 }],
    });
  };

  const removeCreateFormItem = (index: number) => {
    if (createForm.items.length > 1) {
      const newItems = createForm.items.filter((_, i) => i !== index);
      setCreateForm({ ...createForm, items: newItems });
    }
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: 'Invoice',
      accessor: 'number',
      sortable: true,
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: 'customer',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (invoice) => formatCurrency(invoice.amount, invoice.currency),
      align: 'right',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (invoice) => (
        <Badge variant={statusVariants[invoice.status]}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      ),
      align: 'center',
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      accessor: (invoice) => new Date(invoice.dueDate).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (invoice) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInvoice(invoice);
              setShowDetailModal(true);
            }}
            className="p-1 text-muted hover:text-text transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle download
            }}
            className="p-1 text-muted hover:text-text transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          {invoice.status === 'draft' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle send
              }}
              className="p-1 text-muted hover:text-text transition-colors"
              title="Send Invoice"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
      align: 'center',
    },
  ];

  const toolbar = (
    <div className="flex items-center gap-3">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        <option value="all">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
      </select>
      
      <button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Create Invoice
      </button>
    </div>
  );

  return (
    <SettingsLayout
      title="Invoices"
      description="Create and manage your invoices"
    >
      <Table
        data={invoices}
        columns={columns}
        searchable
        searchPlaceholder="Search invoices..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        loading={loading}
        toolbar={toolbar}
        pagination={{
          current: currentPage,
          total: totalInvoices,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        onRowClick={(invoice) => {
          setSelectedInvoice(invoice);
          setShowDetailModal(true);
        }}
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Invoice"
        size="lg"
      >
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={createForm.customer}
                onChange={(e) => setCreateForm({ ...createForm, customer: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Customer Email
              </label>
              <input
                type="email"
                value={createForm.customerEmail}
                onChange={(e) => setCreateForm({ ...createForm, customerEmail: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="Enter customer email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-text">
                Invoice Items
              </label>
              <button
                onClick={addCreateFormItem}
                className="text-accent text-sm font-medium hover:text-accent/80"
              >
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {createForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateCreateFormItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCreateFormItem(index, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateCreateFormItem(index, 'rate', Number(e.target.value))}
                      placeholder="Rate"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="px-3 py-2 bg-surface-2 border border-border rounded-lg text-text text-sm">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {createForm.items.length > 1 && (
                      <button
                        onClick={() => removeCreateFormItem(index)}
                        className="p-2 text-danger hover:text-danger/80 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-medium text-text">Total:</span>
                <span className="font-semibold text-text">
                  ${createForm.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-border rounded-lg text-text hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInvoice}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedInvoice?.number}
        size="lg"
      >
        {selectedInvoice && (
          <div className="p-6 space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-text mb-2">Customer</h3>
                <p className="text-text">{selectedInvoice.customer}</p>
                <p className="text-muted text-sm">{selectedInvoice.customerEmail}</p>
              </div>
              <div>
                <h3 className="font-medium text-text mb-2">Invoice Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Status:</span>
                    <Badge variant={statusVariants[selectedInvoice.status]}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Created:</span>
                    <span className="text-text">{new Date(selectedInvoice.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Due:</span>
                    <span className="text-text">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  {selectedInvoice.paidDate && (
                    <div className="flex justify-between">
                      <span className="text-muted">Paid:</span>
                      <span className="text-text">{new Date(selectedInvoice.paidDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h3 className="font-medium text-text mb-4">Items</h3>
              <div className="bg-surface-2 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase">Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-text">{item.description}</td>
                        <td className="px-4 py-3 text-center text-text">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-text">${item.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-text font-medium">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="px-4 py-3 border-t border-border bg-surface">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-text">Total:</span>
                    <span className="font-semibold text-text text-lg">
                      {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-text hover:bg-surface-2 transition-colors">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              {selectedInvoice.status === 'draft' && (
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
                  <Send className="h-4 w-4" />
                  Send Invoice
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </SettingsLayout>
  );
}