import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Badge, Dropdown, Space } from 'antd';
import { 
  HomeOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DashboardOutlined,
  BookOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'orders',
      icon: <BookOutlined />,
      label: <Link to="/orders">我的订单</Link>,
    },
    {
      key: 'payments',
      icon: <CreditCardOutlined />,
      label: <Link to="/payments">支付记录</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const adminMenuItems = [
    {
      key: 'admin-dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">管理后台</Link>,
    },
    ...userMenuItems,
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : userMenuItems;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' }}>
            📚 图书销售系统
          </Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <Link to="/cart">
                <Badge count={getTotalItems()} size="small">
                  <Button 
                    type="text" 
                    icon={<ShoppingCartOutlined />} 
                    style={{ 
                      color: 'white',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      transition: 'all 0.3s ease'
                    }}
                    className="hover:bg-white/20"
                  >
                    购物车
                  </Button>
                </Badge>
              </Link>
              
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Button type="text" style={{ 
                  color: 'white',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  transition: 'all 0.3s ease'
                }}>
                  <Space>
                    <UserOutlined />
                    {user?.username}
                  </Space>
                </Button>
              </Dropdown>
            </>
          ) : (
            <Space>
              <Link to="/login">
                <Button 
                  type="primary" 
                  style={{
                    borderRadius: '8px',
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  style={{
                    borderRadius: '8px',
                    background: 'transparent',
                    color: 'white',
                    border: '1px solid white',
                    fontWeight: 'bold'
                  }}
                >
                  注册
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </Header>
      
      <Content style={{ padding: '0', flex: 1 }}>
        <Outlet />
      </Content>
      
      <Footer style={{ 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px 0'
      }}>
        图书销售系统 - 专业的在线图书销售平台 ©2025
      </Footer>
    </AntLayout>
  );
};

export default Layout;
