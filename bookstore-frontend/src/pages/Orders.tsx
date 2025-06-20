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
  Col
} from 'antd';
import { CalendarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { orderAPI } from '../services/api';
import { Order, PageResponse } from '../types';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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
                </Space>
              </Col>
              <Col>
                <Space>
                  <CalendarOutlined />
                  <Text type="secondary">
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
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
    </div>
  );
};

export default Orders;
