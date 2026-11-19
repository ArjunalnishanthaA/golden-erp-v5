import React, { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquareShare,
  Plus,
  Search,
  Truck,
} from 'lucide-react';
import { AgencyName, BillStatus, CreditInvoice } from './types';

const INITIAL_INVOICES: CreditInvoice[] = [
  {
    id: '1',
    invoiceNo: 'GD-2026-1001',
    agency: 'අනුරාධපුර',
    route: 'ANP-R1',
    shopName: 'නෙළුබෑව ස්ටෝර්ස්',
    amount: 48500,
    paidAmount: 0,
    issuedDate: '2026-11-15',
    dueDate: '2026-11-30',
    status: 'Handed Over',
    smsSent: true,
  },
  {
    id: '2',
    invoiceNo: 'GD-2026-1002',
    agency: 'මිහින්තලේ',
    route: 'MHT-R2',
    shopName: 'මිහින්තලේ මිනි මාර්ට්',
    amount: 32000,
    paidAmount: 15000,
    issuedDate: '2026-11-12',
    dueDate: '2026-11-25',
    status: 'Pending',
    smsSent: false,
  },
];

export default function App() {
  const [invoices, setInvoices] = useState<CreditInvoice[]>(INITIAL_INVOICES);
  const [selectedAgency, setSelectedAgency] = useState<'ALL' | AgencyName>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQrInvoice, setActiveQrInvoice] = useState<CreditInvoice | null>(null);

  const [shopName, setShopName] = useState('');
  const [agency, setAgency] = useState<AgencyName>('අනුරාධපුර');
  const [route, setRoute] = useState('ANP-R1');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-05');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const agencyMatch = selectedAgency === 'ALL' || inv.agency === selectedAgency;
      const query = searchTerm.trim().toLowerCase();
      const searchMatch =
        !query ||
        inv.invoiceNo.toLowerCase().includes(query) ||
        inv.shopName.toLowerCase().includes(query) ||
        inv.route.toLowerCase().includes(query);
      return agencyMatch && searchMatch;
    });
  }, [invoices, selectedAgency, searchTerm]);

  const totalCredit = useMemo(
    () =>
      filteredInvoices.reduce(
        (sum, inv) => sum + Math.max(0, inv.amount - inv.paidAmount),
        0
      ),
    [filteredInvoices]
  );

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!shopName.trim() || !numericAmount || numericAmount <= 0) return;

    const nextNum = 1000 + invoices.length + 1;
    const newInvoice: CreditInvoice = {
      id: String(Date.now()),
      invoiceNo: `GD-2026-${nextNum}`,
      agency,
      route: route.trim() || 'R1',
      shopName: shopName.trim(),
      amount: numericAmount,
      paidAmount: 0,
      issuedDate: new Date().toISOString().slice(0, 10),
      dueDate,
      status: 'Pending',
      smsSent: false,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setShopName('');
    setAmount('');
  };

  const updateStatus = (id: string, status: BillStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  };

  const triggerSmsAlert = (inv: CreditInvoice) => {
    const balance = inv.amount - inv.paidAmount;
    const smsText = `Golden Distributors: Bill ${inv.invoiceNo} (${inv.shopName}) Balance Rs.${balance.toLocaleString()}. Due: ${inv.dueDate}.`;
    setInvoices((prev) =>
      prev.map((item) => (item.id === inv.id ? { ...item, smsSent: true } : item))
    );
    window.location.href = `sms:?body=${encodeURIComponent(smsText)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-16">
      <div className="max-w-3xl mx-auto space-y-5">
        <header className="flex flex-col gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-amber-400">
              Golden Distributors ERP
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              Credit & Handover
            </span>
          </div>
          <p className="text-sm text-slate-400">
            අනුරාධපුර & මිහින්තලේ — QR Invoices, Handover Status & SMS Alerts
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">ඉතිරි Credit Balance</div>
            <div className="text-lg font-bold text-amber-400 mt-1">
              Rs. {totalCredit.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">සක්‍රීය Bills ගණන</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {filteredInvoices.length}
            </div>
          </div>
        </section>

        <form
          onSubmit={handleAddInvoice}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>අලුත් Credit Bill එකක් ඇතුළත් කරන්න</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="කඩයේ නම"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="මුදල (Rs.)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={agency}
              onChange={(e) => setAgency(e.target.value as AgencyName)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="අනුරාධපුර">අනුරාධපුර</option>
              <option value="මිහින්තලේ">මිහින්තලේ</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Route (e.g. R1)"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2 rounded-lg text-sm transition"
          >
            Bill එක සේව් කරන්න
          </button>
        </form>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Bill No, Route හෝ කඩයේ නම සොයන්න..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-1.5">
            {(['ALL', 'අනුරාධපුර', 'මිහින්තලේ'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedAgency(tab)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                  selectedAgency === tab
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {tab === 'ALL' ? 'සියල්ල' : tab}
              </button>
            ))}
          </div>
        </div>

        <section className="space-y-3">
          {filteredInvoices.map((inv) => {
            const balance = Math.max(0, inv.amount - inv.paidAmount);
            return (
              <div
                key={inv.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-sm">{inv.invoiceNo}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {inv.agency} • {inv.route}
                      </span>
                    </div>
                    <div className="text-base font-bold mt-1">{inv.shopName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Due: {inv.dueDate} • Status: {inv.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Balance</div>
                    <div className="text-base font-bold text-amber-400">
                      Rs. {balance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveQrInvoice(inv)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium"
                  >
                    QR Code
                  </button>

                  <button
                    onClick={() => updateStatus(inv.id, 'Handed Over')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-medium"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Handed Over</span>
                  </button>

                  <button
                    onClick={() => updateStatus(inv.id, 'Settled')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settled</span>
                  </button>

                  <button
                    onClick={() => triggerSmsAlert(inv)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium"
                  >
                    <MessageSquareShare className="w-3.5 h-3.5" />
                    <span>{inv.smsSent ? 'SMS Sent ✓' : 'SMS Alert'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {activeQrInvoice && (
          <div
            onClick={() => setActiveQrInvoice(null)}
            className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full text-center space-y-3"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeQrInvoice.invoiceNo}</span>
              </div>
              <div className="font-bold text-base">{activeQrInvoice.shopName}</div>
              <div className="bg-white p-3 rounded-xl inline-block">
                <QRCodeCanvas
                  value={JSON.stringify({
                    bill: activeQrInvoice.invoiceNo,
                    shop: activeQrInvoice.shopName,
                    balance: activeQrInvoice.amount - activeQrInvoice.paidAmount,
                    due: activeQrInvoice.dueDate,
                  })}
                  size={176}
                />
              </div>
              <button
                onClick={() => setActiveQrInvoice(null)}
                className="w-full py-2 rounded-lg bg-slate-800 text-sm font-medium"
              >
                වසන්න
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
