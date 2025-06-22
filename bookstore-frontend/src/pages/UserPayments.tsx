import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Descriptions,
  Divider
} from 'antd';
import {
  EyeOutlined,
  AlipayOutlined,
  WechatOutlined,
  CreditCardOutlined,
  BankOutlined
} from '@ant-design/icons';
import { paymentAPI } from '../services/api';
import { Payment, PaymentMethod, PaymentStatus, PageResponse } from '../types';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const UserPayments: React.FC = () => {
  const [payments, setPayments] = useState<PageResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getUserPayments(currentPage - 1, pageSize);
      setPayments(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取支付记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.ALIPAY:
        return <AlipayOutlined style={{ color: '#1677ff' }} />;
      case PaymentMethod.WECHAT_PAY:
        return <WechatOutlined style={{ color: '#52c41a' }} />;
      case PaymentMethod.BANK_CARD:
        return <BankOutlined style={{ color: '#722ed1' }} />;
      case PaymentMethod.CREDIT_CARD:
        return <CreditCardOutlined style={{ color: '#fa8c16' }} />;
      default:
        return null;
    }
  };

  const getStatusTag = (status: PaymentStatus) => {
    const statusConfig = {
      [PaymentStatus.PENDING]: { color: 'orange', text: '待支付' },
      [PaymentStatus.PROCESSING]: { color: 'blue', text: '支付中' },
      [PaymentStatus.SUCCESS]: { color: 'green', text: '支付成功' },
      [PaymentStatus.FAILED]: { color: 'red', text: '支付失败' },
      [PaymentStatus.CANCELLED]: { color: 'default', text: '已取消' },
      [PaymentStatus.REFUNDED]: { color: 'purple', text: '已退款' },
      [PaymentStatus.PARTIAL_REFUNDED]: { color: 'purple', text: '部分退款' }
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleViewDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<Payment> = [
    {
      title: '交易号',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId'
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method, record) => (
        <Space>
          {getPaymentMethodIcon(method)}
          <Text>{record.paymentMethodName}</Text>
        </Space>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#f5222d' }}>¥{amount}</Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: '支付时间',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (date) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>💳 我的支付记录</Title>
      
      <Card>
        <Table
          columns={columns}
          dataSource={payments?.content || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: payments?.totalElements || 0,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page) => setCurrentPage(page)
          }}
        />
      </Card>

      {/* 支付详情弹窗 */}
      <Modal
        title="支付详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedPayment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="交易号">
              <Text code>{selectedPayment.transactionId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="订单号">
              {selectedPayment.orderId}
            </Descriptions.Item>
            <Descriptions.Item label="支付方式">
              <Space>
                {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                <Text>{selectedPayment.paymentMethodName}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="支付金额">
              <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                ¥{selectedPayment.amount}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="支付状态">
              {getStatusTag(selectedPayment.status)}
            </Descriptions.Item>
            <Descriptions.Item label="支付网关">
              {selectedPayment.paymentGateway || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedPayment.createdAt).toLocaleString()}
            </Descriptions.Item>
            {selectedPayment.paidAt && (
              <Descriptions.Item label="支付时间">
                {new Date(selectedPayment.paidAt).toLocaleString()}
              </Descriptions.Item>
            )}
            {selectedPayment.refundedAt && (
              <>
                <Descriptions.Item label="退款时间">
                  {new Date(selectedPayment.refundedAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="退款金额">
                  <Text style={{ color: '#722ed1' }}>¥{selectedPayment.refundAmount}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="退款原因">
                  {selectedPayment.refundReason || '-'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default UserPayments;