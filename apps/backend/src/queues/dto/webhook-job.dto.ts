export interface WebhookJobData {
  orderId: string;
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  signature?: string;
  timestamp: number;
}
