import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Tag, 
  Space, 
  Pagination,
  Empty,
  Spin,
  message,
  Collapse,
  Row,
  Col,
  Button,
  Modal,
  Input,
  Popconfirm
} from 'antd';
import { CalendarOutlined, ShoppingOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { orderAPI } from '../services/api';
import { Order, PageResponse } from '../types';
import CancelRequestInfo from '../components/CancelRequestInfo';

const { TextArea } = Input;

const { Title, Text } = Typography;
const { Panel } = Collapse;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getUserOrders(currentPage - 1, pageSize);
      setOrders(response);
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'PAID': return 'blue';
      case 'SHIPPED': return 'cyan';
      case 'DELIVERED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待支付';
      case 'PAID': return '已支付';
      case 'SHIPPED': return '已发货';
      case 'DELIVERED': return '已送达';
      case 'CANCELLED': return '已取消';
      default: return status;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 直接取消订单（待支付、已支付状态）
  const handleDirectCancel = async (orderId: number) => {
    try {
      await orderAPI.cancelOrder(orderId);
      message.success('订单取消成功');
      fetchOrders();
    } catch (error: any) {
      message.error(error.response?.data?.error || '取消订单失败');
    }
  };

  // 申请取消订单（已发货状态）
  const handleRequestCancel = (order: Order) => {
    setSelectedOrder(order);
    setCancelModalVisible(true);
    setCancelReason('');
  };

  // 提交取消申请
  const handleSubmitCancelRequest = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      message.warning('请填写取消原因');
      return;
    }

    setCancelLoading(true);
    try {
      await orderAPI.requestCancelOrder(selectedOrder.id, cancelReason.trim());
      message.success('取消申请已提交，等待管理员审核');
      setCancelModalVisible(false);
      fetchOrders();
    } catch (error: any) {
      message.error(error.response?.data?.error || '提交申请失败');
    } finally {
      setCancelLoading(false);
    }
  };

  // 判断是否可以取消订单
  const canCancelOrder = (order: Order) => {
    return ['PENDING', 'PAID'].includes(order.status);
  };

  // 判断是否可以申请取消
  const canRequestCancel = (order: Order) => {
    return order.status === 'SHIPPED' && !order.cancelRequest;
  };

  // 获取取消申请状态文本
  const getCancelRequestStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '审核中';
      case 'APPROVED': return '已同意';
      case 'REJECTED': return '已拒绝';
      default: return status;
    }
  };

  // 获取取消申请状态颜色
  const getCancelRequestStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!orders || orders.content.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无订单"
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>📋 我的订单</Title>
        <Text type="secondary">共 {orders.totalElements} 个订单</Text>
      </div>

      <List
        itemLayout="vertical"
        dataSource={orders.content}
        renderItem={(order) => (
          <Card style={{ marginBottom: 16 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Space>
                  <Text strong>订单号: {order.id}</Text>
                  <Tag color={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Tag>
                  {order.cancelRequest && (
                    <Tag color={getCancelRequestStatusColor(order.cancelRequest.status)}>
                      取消申请: {getCancelRequestStatusText(order.cancelRequest.status)}
                    </Tag>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  <CalendarOutlined />
                  <Text type="secondary">
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                  {canCancelOrder(order) && (
                    <Popconfirm
                      title="确认取消订单？"
                      description="取消后无法恢复，确定要取消这个订单吗？"
                      onConfirm={() => handleDirectCancel(order.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button 
                        type="text" 
                        danger 
                        size="small"
                        icon={<CloseOutlined />}
                      >
                        取消订单
                      </Button>
                    </Popconfirm>
                  )}
                  {canRequestCancel(order) && (
                    <Button 
                      type="text" 
                      danger 
                      size="small"
                      icon={<ExclamationCircleOutlined />}
                      onClick={() => handleRequestCancel(order)}
                    >
                      申请取消
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>

            <Collapse ghost>
              <Panel 
                header={
                  <Space>
                    <ShoppingOutlined />
                    <Text>订单详情 ({order.orderItems.length} 件商品)</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>
                      总计: ¥{order.totalPrice}
                    </Text>
                  </Space>
                } 
                key={order.id}
              >
                <List
                  size="small"
                  dataSource={order.orderItems}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.bookTitle}
                        description={
                          <Space>
                            <Text type="secondary">作者: {item.bookAuthor}</Text>
                            <Text>单价: ¥{item.price}</Text>
                            <Text>数量: {item.quantity}</Text>
                            <Text strong>小计: ¥{item.subtotal}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
                {order.cancelRequest && (
                  <CancelRequestInfo cancelRequest={order.cancelRequest} />
                )}
              </Panel>
            </Collapse>
          </Card>
        )}
      />

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Pagination
          current={currentPage}
          total={orders.totalElements}
          pageSize={pageSize}
          showQuickJumper
          showTotal={(total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }
          onChange={handlePageChange}
        />
      </div>

      {/* 取消申请模态框 */}
      <Modal
        title="申请取消订单"
        open={cancelModalVisible}
        onOk={handleSubmitCancelRequest}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
        }}
        confirmLoading={cancelLoading}
        okText="提交申请"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>订单号: </Text>
            <Text>{selectedOrder?.id}</Text>
          </div>
          <div>
            <Text strong>订单状态: </Text>
            <Tag color={selectedOrder ? getStatusColor(selectedOrder.status) : 'default'}>
              {selectedOrder ? getStatusText(selectedOrder.status) : ''}
            </Tag>
          </div>
          <div>
            <Text strong style={{ color: '#ff4d4f' }}>注意: </Text>
            <Text type="secondary">
              由于订单已发货，取消申请需要管理员审核。请详细说明取消原因。
            </Text>
          </div>
          <div>
            <Text strong>取消原因: <Text style={{ color: '#ff4d4f' }}>*</Text></Text>
            <TextArea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="请详细说明取消订单的原因..."
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Orders;
