export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  paymentMethodName: string;
  amount: number;
  status: PaymentStatus;
  statusName: string;
  transactionId: string;
  paymentGateway: string;
  createdAt: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  paymentUrl?: string;
  qrCodeData?: string;
}

export type PaymentResponse = Payment;

export enum PaymentMethod {
  ALIPAY = 'ALIPAY',
  WECHAT_PAY = 'WECHAT_PAY',
  BANK_CARD = 'BANK_CARD',
  CREDIT_CARD = 'CREDIT_CARD'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUNDED = 'PARTIAL_REFUNDED'
}

export interface PaymentRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  notifyUrl?: string;
}

export interface RefundRequest {
  paymentId: number;
  refundAmount: number;
  refundReason: string;
  adminNote?: string;
}

export interface PaymentStatistics {
  totalSuccessfulPayments: number;
  totalPaymentAmount: number;
  totalRefundAmount: number;
  statusStatistics: Record<string, number>;
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.ALIPAY]: '支付宝',
  [PaymentMethod.WECHAT_PAY]: '微信支付',
  [PaymentMethod.BANK_CARD]: '银行卡',
  [PaymentMethod.CREDIT_CARD]: '信用卡'
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '待支付',
  [PaymentStatus.PROCESSING]: '支付中',
  [PaymentStatus.SUCCESS]: '支付成功',
  [PaymentStatus.FAILED]: '支付失败',
  [PaymentStatus.CANCELLED]: '已取消',
  [PaymentStatus.REFUNDED]: '已退款',
  [PaymentStatus.PARTIAL_REFUNDED]: '部分退款'
};