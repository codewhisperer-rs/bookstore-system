import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Radio,
  Typography,
  Space,
  Divider,
  message,
  Modal,
  Spin,
  QRCode,
  Row,
  Col,
  Tag,
  Alert
} from 'antd';
import {
  AlipayOutlined,
  WechatOutlined,
  CreditCardOutlined,
  BankOutlined,

  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { paymentAPI, orderAPI } from '../services/api';
import { Payment, PaymentMethod, PaymentStatus, PaymentMethodLabels, Order, PaymentResponse } from '../types';

const { Title, Text } = Typography;

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.ALIPAY);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [pollingTimer, setPollingTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderAndPayment();
    }
    return () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
    };
  }, [orderId]);

  const fetchOrderAndPayment = async () => {
    try {
      setOrderLoading(true);
      const orderData = await orderAPI.getOrderById(Number(orderId));
      setOrder(orderData);

      // 检查是否已有支付记录
      try {
        const response = await paymentAPI.getPaymentByOrderId(Number(orderId));
        setPayment(response.data);
      } catch (error: any) {
        // 如果没有支付记录，这是正常的
        if (error.response?.status !== 404) {
          console.error('获取支付信息失败:', error);
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取订单信息失败');
      navigate('/orders');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const response = await paymentAPI.createPayment({
        orderId: order.id,
        paymentMethod: selectedMethod
      });
      setPayment(response.data);
      setPaymentModalVisible(true);
      startPollingPaymentStatus(response.data.id);
    } catch (error: any) {
      message.error(error.response?.data?.error || '创建支付失败');
    } finally {
      setLoading(false);
    }
  };

  const startPollingPaymentStatus = (paymentId: number) => {
    const timer = setInterval(async () => {
      try {
        const response = await paymentAPI.getPaymentById(paymentId);
        const paymentData = response.data;
        setPayment(paymentData);
        
        if (paymentData.status === PaymentStatus.SUCCESS) {
          clearInterval(timer);
          setPollingTimer(null);
          Modal.success({
            title: '支付成功！',
            content: '您的订单已支付成功，我们将尽快为您发货。',
            onOk: () => {
              setPaymentModalVisible(false);
              navigate('/orders');
            }
          });
        } else if (paymentData.status === PaymentStatus.FAILED || paymentData.status === PaymentStatus.CANCELLED) {
          clearInterval(timer);
          setPollingTimer(null);
          message.error('支付失败，请重试');
          setPaymentModalVisible(false);
        }
      } catch (error) {
        console.error('轮询支付状态失败:', error);
      }
    }, 3000); // 每3秒轮询一次
    
    setPollingTimer(timer);
  };

  const handleCancelPayment = async () => {
    if (!payment) return;

    try {
      await paymentAPI.cancelPayment(payment.id);
      message.success('支付已取消');
      setPaymentModalVisible(false);
      if (pollingTimer) {
        clearInterval(pollingTimer);
        setPollingTimer(null);
      }
      fetchOrderAndPayment();
    } catch (error: any) {
      message.error(error.response?.data?.error || '取消支付失败');
    }
  };

  // 模拟支付成功（用于演示）
  const simulatePaymentSuccess = async () => {
    if (!payment) return;

    try {
      await paymentAPI.simulateCallback(payment.transactionId, true);
      message.success('支付模拟成功');
    } catch (error: any) {
      message.error('模拟支付失败');
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.ALIPAY:
        return <AlipayOutlined style={{ color: '#1677ff', fontSize: '20px' }} />;
      case PaymentMethod.WECHAT_PAY:
        return <WechatOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
      case PaymentMethod.BANK_CARD:
        return <BankOutlined style={{ color: '#722ed1', fontSize: '20px' }} />;
      case PaymentMethod.CREDIT_CARD:
        return <CreditCardOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />;
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

  if (orderLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载订单信息...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>订单不存在</Text>
        <br />
        <Button type="primary" onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>
      </div>
    );
  }

  if (order.status !== 'PENDING') {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Alert
          message="订单状态异常"
          description="该订单不是待支付状态，无法进行支付操作。"
          type="warning"
          showIcon
        />
        <br />
        <Button type="primary" onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/orders')}
        style={{ marginBottom: 24 }}
      >
        返回订单列表
      </Button>

      <Title level={2}>💳 订单支付</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* 订单信息 */}
          <Card title="订单信息" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>订单号：</Text>
                <Text>{order.id}</Text>
              </div>
              <div>
                <Text strong>订单金额：</Text>
                <Text style={{ fontSize: '18px', color: '#f5222d' }}>¥{order.totalPrice}</Text>
              </div>
              <div>
                <Text strong>商品数量：</Text>
                <Text>{order.orderItems.length} 件商品</Text>
              </div>
            </Space>
          </Card>

          {/* 支付方式选择 */}
          {!payment && (
            <Card title="选择支付方式">
              <Radio.Group 
                value={selectedMethod} 
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.values(PaymentMethod).map((method) => (
                    <Radio key={method} value={method} style={{ padding: '12px 0' }}>
                      <Space>
                        {getPaymentMethodIcon(method)}
                        <Text>{PaymentMethodLabels[method]}</Text>
                      </Space>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
              
              <Divider />
              
              <Button 
                type="primary" 
                size="large" 
                loading={loading}
                onClick={handleCreatePayment}
                style={{ width: '100%' }}
              >
                立即支付 ¥{order.totalPrice}
              </Button>
            </Card>
          )}

          {/* 支付状态 */}
          {payment && (
            <Card title="支付状态">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div key={payment.id}>
                  <Text strong>支付方式：</Text>
                  <Space>
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <Text>{payment.paymentMethodName}</Text>
                  </Space>
                </div>
                <div>
                  <Text strong>支付状态：</Text>
                  {getStatusTag(payment.status)}
                </div>
                <div>
                  <Text strong>交易号：</Text>
                  <Text code>{payment.transactionId}</Text>
                </div>
                {payment.status === PaymentStatus.PENDING && (
                  <>
                    <Divider />
                    <Space>
                      <Button 
                        type="primary" 
                        onClick={() => setPaymentModalVisible(true)}
                      >
                        继续支付
                      </Button>
                      <Button onClick={handleCancelPayment}>
                        取消支付
                      </Button>
                      <Button 
                        type="dashed" 
                        onClick={simulatePaymentSuccess}
                        style={{ color: '#52c41a' }}
                      >
                        模拟支付成功
                      </Button>
                    </Space>
                  </>
                )}
              </Space>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* 商品清单 */}
          <Card title="商品清单">
            <Space direction="vertical" style={{ width: '100%' }}>
              {order.orderItems.map((item) => (
                <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <Text strong>{item.bookTitle}</Text>
                  </div>
                  <div>
                    <Text type="secondary">{item.bookAuthor}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>¥{item.price} × {item.quantity}</Text>
                    <Text strong>¥{item.subtotal}</Text>
                  </div>
                </div>
              ))}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>总计：</Text>
                <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>¥{order.totalPrice}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 支付弹窗 */}
      <Modal
        title="扫码支付"
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          if (pollingTimer) {
            clearInterval(pollingTimer);
            setPollingTimer(null);
          }
        }}
        footer={[
          <Button key="cancel" onClick={handleCancelPayment}>
            取消支付
          </Button>,
          <Button key="simulate" type="dashed" onClick={simulatePaymentSuccess}>
            模拟支付成功
          </Button>
        ]}
        width={400}
      >
        {payment && (
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>支付金额：</Text>
                <Text style={{ fontSize: '20px', color: '#f5222d' }}>¥{payment.amount}</Text>
              </div>
              
              {payment.qrCodeData && (
                <QRCode value={payment.qrCodeData} size={200} />
              )}
              
              <div>
                <Space>
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <Text>{payment.paymentMethodName}</Text>
                </Space>
              </div>
              
              <Alert
                message="请使用对应的支付应用扫描二维码完成支付"
                type="info"
                showIcon
              />
              
              {payment.status === PaymentStatus.PENDING && (
                <div>
                  <Spin />
                  <Text style={{ marginLeft: 8 }}>等待支付中...</Text>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentPage;