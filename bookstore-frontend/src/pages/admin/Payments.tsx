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
  Select,
  Row,
  Col,
  Statistic,
  Form,
  InputNumber,
  Input,
  Popconfirm
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  DollarOutlined,
  AlipayOutlined,
  WechatOutlined,
  CreditCardOutlined,
  BankOutlined
} from '@ant-design/icons';
import { paymentAPI } from '../../services/api';
import { Payment, PaymentMethod, PaymentStatus, PaymentStatistics, PageResponse } from '../../types';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<PageResponse<Payment> | null>(null);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundForm] = Form.useForm();

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, [currentPage, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let response;
      if (statusFilter === 'ALL') {
        response = await paymentAPI.getAllPayments(currentPage - 1, pageSize);
      } else {
        response = await paymentAPI.getPaymentsByStatus(statusFilter, currentPage - 1, pageSize);
      }
      setPayments(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取支付记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await paymentAPI.getPaymentStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取统计信息失败');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: number) => {
    try {
      await paymentAPI.confirmPayment(paymentId);
      message.success('支付确认成功');
      fetchPayments();
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.error || '确认支付失败');
    }
  };

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundModalVisible(true);
    refundForm.setFieldsValue({
      refundAmount: payment.amount,
      reason: '',
      adminNote: ''
    });
  };

  const handleRefundSubmit = async () => {
    if (!selectedPayment) return;

    try {
      const values = await refundForm.validateFields();
      await paymentAPI.processRefund(selectedPayment.id, {
        paymentId: selectedPayment.id,
        refundAmount: values.refundAmount,
        refundReason: values.reason,
        adminNote: values.adminNote
      });
      message.success('退款处理成功');
      setRefundModalVisible(false);
      fetchPayments();
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.error || '退款处理失败');
    }
  };

  const handleCleanupExpired = async () => {
    try {
      await paymentAPI.cleanupExpiredPayments();
      message.success('过期支付清理完成');
      fetchPayments();
    } catch (error: any) {
      message.error(error.response?.data?.error || '清理失败');
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
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === PaymentStatus.PENDING && (
            <Popconfirm
              title="确认支付"
              description="确定要确认这笔支付吗？"
              onConfirm={() => handleConfirmPayment(record.id)}
            >
              <Button
                type="link"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
              >
                确认
              </Button>
            </Popconfirm>
          )}
          {record.status === PaymentStatus.SUCCESS && (
            <Button
              type="link"
              icon={<DollarOutlined />}
              onClick={() => handleRefund(record)}
              style={{ color: '#722ed1' }}
            >
              退款
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>💳 支付管理</Title>
      
      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="成功支付笔数"
              value={statistics?.totalSuccessfulPayments || 0}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总支付金额"
              value={statistics?.totalPaymentAmount || 0}
              prefix="¥"
              precision={2}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总退款金额"
              value={statistics?.totalRefundAmount || 0}
              prefix="¥"
              precision={2}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="净收入"
              value={(statistics?.totalPaymentAmount || 0) - (statistics?.totalRefundAmount || 0)}
              prefix="¥"
              precision={2}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 150 }}
          >
            <Option value="ALL">全部状态</Option>
            {Object.values(PaymentStatus).map((status) => (
              <Option key={status} value={status}>
                {getStatusTag(status)}
              </Option>
            ))}
          </Select>
          
          <Button icon={<ReloadOutlined />} onClick={fetchPayments}>
            刷新
          </Button>
          
          <Popconfirm
            title="清理过期支付"
            description="确定要清理所有过期的待支付订单吗？"
            onConfirm={handleCleanupExpired}
          >
            <Button icon={<CloseOutlined />}>
              清理过期
            </Button>
          </Popconfirm>
        </Space>

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

      {/* 退款弹窗 */}
      <Modal
        title="处理退款"
        open={refundModalVisible}
        onCancel={() => setRefundModalVisible(false)}
        onOk={handleRefundSubmit}
        width={500}
      >
        {selectedPayment && (
          <Form form={refundForm} layout="vertical">
            <Form.Item label="支付信息">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>交易号：<Text code>{selectedPayment.transactionId}</Text></Text>
                <Text>支付金额：<Text strong style={{ color: '#f5222d' }}>¥{selectedPayment.amount}</Text></Text>
                <Text>已退款：<Text style={{ color: '#722ed1' }}>¥{selectedPayment.refundAmount || 0}</Text></Text>
              </Space>
            </Form.Item>
            
            <Form.Item
              name="refundAmount"
              label="退款金额"
              rules={[
                { required: true, message: '请输入退款金额' },
                { type: 'number', min: 0.01, message: '退款金额必须大于0' },
                {
                  validator: (_, value) => {
                    const maxRefund = selectedPayment.amount - (selectedPayment.refundAmount || 0);
                    if (value > maxRefund) {
                      return Promise.reject(new Error(`退款金额不能超过¥${maxRefund}`));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={2}
                min={0.01}
                max={selectedPayment.amount - (selectedPayment.refundAmount || 0)}
                addonBefore="¥"
              />
            </Form.Item>
            
            <Form.Item
              name="reason"
              label="退款原因"
              rules={[{ required: true, message: '请输入退款原因' }]}
            >
              <TextArea rows={3} placeholder="请输入退款原因" />
            </Form.Item>
            
            <Form.Item
              name="adminNote"
              label="管理员备注"
            >
              <TextArea rows={2} placeholder="管理员备注（可选）" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AdminPayments;