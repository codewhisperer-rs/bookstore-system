import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Typography, 
  Space, 
  Divider, 
  Row,
  Col,
  message,
  Modal
} from 'antd';
import { CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { orderAPI } from '../services/api';

const { Title, Text } = Typography;

const Checkout: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      message.warning('购物车为空');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        bookId: item.book.id,
        quantity: item.quantity
      }));

      const response = await orderAPI.createOrder({ orderItems });
      
      Modal.success({
        title: '订单创建成功！',
        content: `订单号: ${response.id}`,
        onOk: () => {
          clearCart();
          navigate(`/payment/${response.id}`);
        }
      });
    } catch (error: any) {
      message.error(error.response?.data?.error || '订单创建失败');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>购物车为空，无法结算</Text>
        <br />
        <Button type="primary" onClick={() => navigate('/')}>
          去购物
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/cart')}
        style={{ marginBottom: 24 }}
      >
        返回购物车
      </Button>

      <Title level={2}>📋 确认订单</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="订单商品">
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div 
                        style={{ 
                          width: 60, 
                          height: 60, 
                          background: item.book.coverUrl ? `url(${item.book.coverUrl})` : '#f0f0f0',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          borderRadius: '4px'
                        }}
                      >
                        {!item.book.coverUrl && '📖'}
                      </div>
                    }
                    title={item.book.title}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">作者: {item.book.author}</Text>
                        <Text>单价: ¥{item.book.price}</Text>
                        <Text>数量: {item.quantity}</Text>
                      </Space>
                    }
                  />
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>
                      ¥{(item.book.price * item.quantity).toFixed(2)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="订单总计">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>商品数量:</Text>
                <Text>{items.reduce((sum, item) => sum + item.quantity, 0)} 件</Text>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>商品总价:</Text>
                <Text>¥{getTotalPrice().toFixed(2)}</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>运费:</Text>
                <Text>免费</Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: '16px' }}>应付总额:</Text>
                <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                  ¥{getTotalPrice().toFixed(2)}
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined />}
                onClick={handlePlaceOrder}
                loading={loading}
              >
                确认下单
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
