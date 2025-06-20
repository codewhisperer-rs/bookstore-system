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
  Tag
} from 'antd';
import { 
  BookOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  DollarOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, you would fetch these stats from the API
    setStats({
      totalBooks: 156,
      totalOrders: 89,
      totalUsers: 234,
      totalRevenue: 12580.50
    });
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

  const recentOrders = [
    { id: 1, customer: '张三', amount: 89.50, status: 'PENDING' },
    { id: 2, customer: '李四', amount: 156.00, status: 'PAID' },
    { id: 3, customer: '王五', amount: 234.80, status: 'SHIPPED' },
    { id: 4, customer: '赵六', amount: 67.20, status: 'DELIVERED' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'PAID': return 'blue';
      case 'SHIPPED': return 'cyan';
      case 'DELIVERED': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待支付';
      case 'PAID': return '已支付';
      case 'SHIPPED': return '已发货';
      case 'DELIVERED': return '已送达';
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
          <Card>
            <Statistic
              title="图书总数"
              value={stats.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
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
          >
            <List
              size="small"
              dataSource={recentOrders}
              renderItem={(order) => (
                <List.Item>
                  <List.Item.Meta
                    title={`订单 #${order.id}`}
                    description={`客户: ${order.customer}`}
                  />
                  <div>
                    <div>¥{order.amount}</div>
                    <Tag color={getStatusColor(order.status)} size="small">
                      {getStatusText(order.status)}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
