import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  InputNumber, 
  Space, 
  Divider,
  message,
  Spin,
  Tag
} from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { bookAPI } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Book } from '../types';

const { Title, Text, Paragraph } = Typography;

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchBookDetail(parseInt(id));
    }
  }, [id]);

  const fetchBookDetail = async (bookId: number) => {
    setLoading(true);
    try {
      const response = await bookAPI.getBookById(bookId);
      setBook(response);
    } catch (error) {
      message.error('获取图书详情失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!book) return;
    
    if (book.stock < quantity) {
      message.warning('库存不足');
      return;
    }
    
    addToCart(book, quantity);
    message.success(`已添加 ${quantity} 本到购物车`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/')}
        style={{ marginBottom: 24 }}
      >
        返回图书列表
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={10}>
          <Card>
            <div 
              style={{ 
                height: 400, 
                background: book.coverUrl ? `url(${book.coverUrl})` : '#f0f0f0',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '120px',
                borderRadius: '8px'
              }}
            >
              {!book.coverUrl && '📖'}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <div>
            <Title level={2}>{book.title}</Title>
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>作者：</Text>
                <Text>{book.author}</Text>
              </div>

              <div>
                <Text strong>价格：</Text>
                <Text style={{ fontSize: '24px', color: '#ff4d4f' }}>
                  ¥{book.price}
                </Text>
              </div>

              <div>
                <Text strong>库存：</Text>
                <Tag color={book.stock > 10 ? 'green' : book.stock > 0 ? 'orange' : 'red'}>
                  {book.stock > 0 ? `${book.stock} 本` : '缺货'}
                </Tag>
              </div>

              <div>
                <Text strong>上架时间：</Text>
                <Text>{new Date(book.createdAt).toLocaleDateString()}</Text>
              </div>

              <Divider />

              {book.description && (
                <div>
                  <Title level={4}>图书简介</Title>
                  <Paragraph>{book.description}</Paragraph>
                </div>
              )}

              <Divider />

              <div>
                <Space direction="vertical" size="middle">
                  <div>
                    <Text strong>购买数量：</Text>
                    <InputNumber
                      min={1}
                      max={book.stock}
                      value={quantity}
                      onChange={(value) => setQuantity(value || 1)}
                      style={{ marginLeft: 8 }}
                    />
                  </div>

                  <Space>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleAddToCart}
                      disabled={book.stock <= 0}
                    >
                      {book.stock <= 0 ? '缺货' : '加入购物车'}
                    </Button>
                  </Space>
                </Space>
              </div>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BookDetail;
