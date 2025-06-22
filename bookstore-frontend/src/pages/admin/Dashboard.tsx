import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space,
  Button,
  List,
  Tag,
  message
} from 'antd';
import { 
  BookOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  DollarOutlined,
  PlusOutlined,
  SettingOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { bookAPI, orderAPI, userAPI, paymentAPI } from '../../services/api';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取真实统计数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 获取图书总数
        const booksResponse = await bookAPI.getBooks(0, 1, 'id', 'asc');
        const totalBooks = booksResponse.totalElements;
        
        // 获取订单总数
        const ordersResponse = await orderAPI.getAllOrders(0, 1);
        const totalOrders = ordersResponse.totalElements;
        
        // 获取用户总数
        const usersResponse = await userAPI.getAllUsers(0, 1);
        const totalUsers = usersResponse.totalElements;
        
        // 获取支付统计信息（总收入）
        const paymentStatsResponse = await paymentAPI.getPaymentStatistics();
        const totalRevenue = paymentStatsResponse.data.totalPaymentAmount || 0;
        
        setStats({
          totalBooks,
          totalOrders,
          totalUsers,
          totalRevenue
        });
        
        // 获取最近订单
        const recentOrdersResponse = await orderAPI.getAllOrders(0, 4);
        setRecentOrders(recentOrdersResponse.content);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        message.error('获取统计数据失败，显示模拟数据');
        // 加载失败时使用模拟数据
        setStats({
          totalBooks: 156,
          totalOrders: 89,
          totalUsers: 234,
          totalRevenue: 12580.50
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: '添加新书',
      description: '向系统中添加新的图书',
      icon: <PlusOutlined />,
      link: '/admin/books',
      color: '#1890ff'
    },
    {
      title: '订单管理',
      description: '查看和管理所有订单',
      icon: <ShoppingCartOutlined />,
      link: '/admin/orders',
      color: '#52c41a'
    },
    {
      title: '支付管理',
      description: '管理支付记录和退款',
      icon: <CreditCardOutlined />,
      link: '/admin/payments',
      color: '#f5222d'
    },
    {
      title: '用户管理',
      description: '管理用户账户和权限',
      icon: <UserOutlined />,
      link: '/admin/users',
      color: '#faad14'
    },
    {
      title: '系统设置',
      description: '配置系统参数',
      icon: <SettingOutlined />,
      link: '/admin/settings',
      color: '#722ed1'
    }
  ];

  const getStatusColor = (status: string): string => {
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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>📊 管理后台</Title>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="图书总数"
              value={stats.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="订单总数"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 快捷操作 */}
        <Col xs={24} lg={12}>
          <Card title="快捷操作">
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card 
                    size="small" 
                    hoverable
                    style={{ textAlign: 'center' }}
                  >
                    <Space direction="vertical">
                      <div style={{ fontSize: '24px', color: action.color }}>
                        {action.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{action.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {action.description}
                        </div>
                      </div>
                      <Link to={action.link}>
                        <Button type="primary" size="small">
                          进入
                        </Button>
                      </Link>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 最近订单 */}
        <Col xs={24} lg={12}>
          <Card 
            title="最近订单" 
            extra={<Link to="/admin/orders">查看全部</Link>}
            loading={loading}
          >
            <List
              size="small"
              dataSource={recentOrders}
              renderItem={(order) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Link to={`/admin/orders/${order.id}`}>订单 #{order.id}</Link>}
                    description={`客户: ${order.user?.username || '未知用户'}`}
                  />
                  <div>
                    <div>¥{order.totalPrice?.toFixed(2)}</div>
                    <Tag color={getStatusColor(order.status)} style={{ fontSize: '12px' }}>
                      {getStatusText(order.status)}
                    </Tag>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无订单数据' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
