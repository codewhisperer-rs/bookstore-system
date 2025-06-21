import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Button, 
  Pagination, 
  Select, 
  Space, 
  Typography,
  message,
  Spin,
  Carousel,
  Tabs,
  Tag
} from 'antd';
import { SearchOutlined, ShoppingCartOutlined, FireOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { bookAPI } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Book, PageResponse } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data for featured books
const mockBooks: Book[] = [
  { id: 1, title: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', price: 89.00, stock: 10, createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Vue.js实战', author: '梁灏', price: 69.00, stock: 15, createdAt: '2024-01-02T00:00:00Z' },
  { id: 3, title: 'React进阶之路', author: '徐超', price: 79.00, stock: 8, createdAt: '2024-01-03T00:00:00Z' },
  { id: 4, title: 'Node.js开发指南', author: '郭家宝', price: 59.00, stock: 12, createdAt: '2024-01-04T00:00:00Z' }
];

const Home: React.FC = () => {
  const [books, setBooks] = useState<PageResponse<Book> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const { addToCart } = useCartStore();
  const { isAuthenticated, hideRegister } = useAuthStore(); // Get hideRegister state
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let response;
      if (searchKeyword.trim()) {
        response = await bookAPI.searchBooks(searchKeyword, currentPage - 1, pageSize);
      } else {
        response = await bookAPI.getBooks(currentPage - 1, pageSize, sortBy, sortDir);
      }
      setBooks(response);
    } catch (error) {
      message.error('获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage, pageSize, sortBy, sortDir]);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
    setTimeout(fetchBooks, 100);
  };

  const handleAddToCart = (book: Book) => {
    if (book.stock <= 0) {
      message.warning('该图书库存不足');
      return;
    }
    
    addToCart(book);
    message.success('已添加到购物车');
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
        padding: '60px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: '16px' }}>
          图书销售系统
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '40px' }}>
          专业的在线图书销售平台，为您提供优质的图书购买体验
        </Paragraph>

        {!hideRegister && (
          <Button 
            type="primary" 
            size="large" 
            onClick={() => navigate('/register')}
            style={{
              marginRight: '20px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '25px',
              padding: '0 30px'
            }}
          >
            立即注册
          </Button>
        )}
        <Button 
          type="default" 
          size="large" 
          onClick={() => document.getElementById('book-list')?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            background: 'transparent',
            borderColor: 'white',
            color: 'white',
            borderRadius: '25px',
            padding: '0 30px'
          }}
        >
          浏览图书
        </Button>
        
        {/* Search Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Search
            placeholder="搜索图书、作者或关键词"
            allowClear
            size="large"
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ borderRadius: '25px' }}
          />
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: 'white', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>
            为什么选择我们？
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '20px'
                }}>
                  📚
                </div>
                <Title level={3}>正版图书</Title>
                <Text type="secondary">所有图书均为正版授权，品质保证，让您放心购买</Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '20px'
                }}>
                  🚚
                </div>
                <Title level={3}>快速配送</Title>
                <Text type="secondary">全国包邮，48小时内发货，让知识更快到达您身边</Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '20px'
                }}>
                  💰
                </div>
                <Title level={3}>优惠价格</Title>
                <Text type="secondary">直接与出版社合作，为您提供最优惠的图书价格</Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Categories Section */}
      <div style={{ background: '#f8f9fa', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
            <BookOutlined /> 热门分类
          </Title>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💻</div>
                <Text strong>科技计算机</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📖</div>
                <Text strong>文学小说</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💼</div>
                <Text strong>经济管理</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎨</div>
                <Text strong>艺术设计</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📚</div>
                <Text strong>教育考试</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌱</div>
                <Text strong>生活健康</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧸</div>
                <Text strong>童书绘本</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📜</div>
                <Text strong>历史传记</Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Statistics Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '80px 24px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', color: 'white', fontSize: '2.5rem' }}>
            我们的成就
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>50万+</div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>图书品种</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>100万+</div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>注册用户</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>99.8%</div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>好评率</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>24小时</div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>客服服务</Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Featured Books Section */}
      <div style={{ background: 'white', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>
            精选图书
          </Title>
          <Row gutter={[24, 24]}>
            {mockBooks.map((book) => (
              <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                <Card
                  hoverable
                  style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  cover={
                    <div style={{ 
                      height: '240px', 
                      background: 'linear-gradient(45deg, #f0f0f0, #e8e8e8)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <BookOutlined style={{ fontSize: '64px', color: '#ccc' }} />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#ff4d4f',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        热销
                      </div>
                    </div>
                  }
                  actions={[
                    <Button 
                      type="primary" 
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleAddToCart(book)}
                      disabled={book.stock <= 0}
                      style={{
                        background: book.stock <= 0 ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    >
                      {book.stock <= 0 ? '缺货' : '加入购物车'}
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={<Text strong style={{ fontSize: '16px' }}>{book.title}</Text>}
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: '14px' }}>{book.author}</Text>
                        <br />
                        <div style={{ margin: '12px 0' }}>
                          <Text strong style={{ color: '#ff4d4f', fontSize: '20px' }}>¥{book.price}</Text>
                          <Text delete style={{ marginLeft: '8px', color: '#999' }}>¥{(book.price * 1.3).toFixed(2)}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>已售{Math.floor(Math.random() * 1000 + 100)}本</Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>



      {/* Call to Action Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '80px 24px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: '20px' }}>
            开启您的阅读之旅
          </Title>
          <Text style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: '40px' }}>
            加入我们，发现更多精彩图书，享受优质的阅读体验
          </Text>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          
            
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div id="book-list" style={{ background: '#f5f5f5', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <Title level={2}>
              <FireOutlined style={{ color: '#ff4d4f' }} /> 热销图书
            </Title>
            <Space>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 120 }}
              >
                <Option value="id">默认排序</Option>
                <Option value="title">书名</Option>
                <Option value="author">作者</Option>
                <Option value="price">价格</Option>
                <Option value="createdAt">上架时间</Option>
              </Select>
              <Select
                value={sortDir}
                onChange={setSortDir}
                style={{ width: 80 }}
              >
                <Option value="asc">升序</Option>
                <Option value="desc">降序</Option>
              </Select>
            </Space>
          </div>

      <Spin spinning={loading}>
        {books && (
          <>
            <Row gutter={[24, 24]}>
              {books.content.map((book) => (
                <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                  <Card
                    hoverable
                    style={{ 
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ padding: '16px' }}
                    cover={
                      <div 
                        style={{ 
                          height: 240, 
                          background: book.coverUrl ? `url(${book.coverUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '48px',
                          color: 'white',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        {!book.coverUrl && <BookOutlined />}

                      </div>
                    }
                  >
                    <div style={{ padding: '0' }}>
                      <Title level={5} style={{ 
                        margin: '0 0 8px 0',
                        cursor: 'pointer',
                        fontSize: '16px',
                        lineHeight: '1.4'
                      }}
                      onClick={() => navigate(`/books/${book.id}`)}
                      >
                        {book.title}
                      </Title>
                      
                      <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                        {book.author}
                      </Text>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
                          ¥{book.price}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          库存: {book.stock}
                        </Text>
                      </div>
                      
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddToCart(book)}
                        disabled={book.stock <= 0}
                        block
                        style={{ 
                          borderRadius: '8px',
                          background: book.stock <= 0 ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none'
                        }}
                      >
                        {book.stock <= 0 ? '缺货' : '加入购物车'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 40, padding: '20px 0' }}>
              <Pagination
                current={currentPage}
                total={books.totalElements}
                pageSize={pageSize}
                showSizeChanger
                showQuickJumper

                showTotal={(total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }
                onChange={handlePageChange}
              />
            </div>
          </>
        )}
      </Spin>
        </div>
      </div>
    </div>
  );
};

export default Home;
