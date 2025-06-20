import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  message, 
  Space,
  Typography,
  Tag,
  Select,
  Switch,
  Input,
  Popconfirm
} from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { userAPI } from '../../services/api';
import { User, PageResponse } from '../../types';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface UserData extends User {
  key: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<PageResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      if (searchKeyword.trim()) {
        response = await userAPI.searchUsers(searchKeyword, currentPage - 1, pageSize);
      } else {
        response = await userAPI.getAllUsers(currentPage - 1, pageSize);
      }
      setUsers(response);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
    setTimeout(fetchUsers, 100);
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await userAPI.toggleUserStatus(userId);
      message.success(`用户已${currentStatus ? '禁用' : '启用'}`);
      fetchUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await userAPI.updateUserRole(userId, newRole);
      message.success('角色更新成功');
      fetchUsers();
    } catch (error) {
      message.error('角色更新失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => (
        <Space>
          <UserOutlined />
          {username}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: User) => (
        <Select
          value={role}
          style={{ width: 100 }}
          onChange={(value) => handleRoleChange(record.id, value)}
        >
          <Option value="USER">用户</Option>
          <Option value="ADMIN">管理员</Option>
        </Select>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: User) => (
        <Space>
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? '正常' : '禁用'}
          </Tag>
          <Popconfirm
            title={`确定要${isActive ? '禁用' : '启用'}该用户吗？`}
            onConfirm={() => handleToggleStatus(record.id, isActive)}
            okText="确定"
            cancelText="取消"
          >
            <Switch
              checked={isActive}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: true,
    },
  ];

  const tableData: UserData[] = users?.content.map(user => ({
    ...user,
    key: user.id.toString()
  })) || [];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>👥 用户管理</Title>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索用户名或邮箱"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: users?.totalElements || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
        }}
      />
    </div>
  );
};

export default AdminUsers;
