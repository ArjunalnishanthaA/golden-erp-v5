export type AgencyName = 'අනුරාධපුර' | 'මිහින්තලේ';

export type BillStatus = 'Pending' | 'Handed Over' | 'Settled' | 'Overdue';

export interface CreditInvoice {
  id: string;
  invoiceNo: string;
  agency: AgencyName;
  route: string;
  shopName: string;
  amount: number;
  paidAmount: number;
  issuedDate: string;
  dueDate: string;
  status: BillStatus;
  smsSent: boolean;
}
