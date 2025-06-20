import React, { useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Typography, 
  Space, 
  Divider, 
  Empty,
  Row,
  Col,
  message
} from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const { Title, Text } = Typography;

const Cart: React.FC = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalPrice, 
    getTotalItems,
    fetchCart
  } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = (bookId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      message.success('已从购物车移除');
    } else {
      updateQuantity(bookId, quantity);
    }
  };

  const handleRemoveItem = (bookId: number) => {
    removeFromCart(bookId);
    message.success('已从购物车移除');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      message.warning('购物车为空');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    clearCart();
    message.success('购物车已清空');
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="购物车为空"
        >
          <Button type="primary" onClick={() => navigate('/')}>
            去购物
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>🛒 购物车</Title>
        <Text type="secondary">共 {getTotalItems()} 件商品</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item.book.id)}
                    >
                      移除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          background: item.book.coverUrl ? `url(${item.book.coverUrl})` : '#f0f0f0',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          borderRadius: '4px'
                        }}
                      >
                        {!item.book.coverUrl && '📖'}
                      </div>
                    }
                    title={
                      <div>
                        <Text strong>{item.book.title}</Text>
                        <br />
                        <Text type="secondary">作者: {item.book.author}</Text>
                      </div>
                    }
                    description={
                      <Space direction="vertical">
                        <Text style={{ color: '#ff4d4f', fontSize: '16px' }}>
                          ¥{item.book.price}
                        </Text>
                        <Space>
                          <Text>数量:</Text>
                          <InputNumber
                            min={1}
                            max={item.book.stock}
                            value={item.quantity}
                            onChange={(value) => 
                              handleQuantityChange(item.book.id, value || 1)
                            }
                            size="small"
                          />
                          <Text type="secondary">
                            (库存: {item.book.stock})
                          </Text>
                        </Space>
                        <Text strong>
                          小计: ¥{(item.book.price * item.quantity).toFixed(2)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="订单摘要">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>商品数量:</Text>
                <Text>{getTotalItems()} 件</Text>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>商品总价:</Text>
                <Text>¥{getTotalPrice().toFixed(2)}</Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: '16px' }}>总计:</Text>
                <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                  ¥{getTotalPrice().toFixed(2)}
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<ShoppingOutlined />}
                onClick={handleCheckout}
              >
                去结算
              </Button>

              <Button
                type="default"
                block
                onClick={handleClearCart}
              >
                清空购物车
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Cart;
