import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  message, 
  Space,
  Typography,
  Tag,
  Select,
  Modal,
  List,
  Descriptions
} from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { orderAPI } from '../../services/api';
import { Order, PageResponse } from '../../types';

const { Title } = Typography;
const { Option } = Select;

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response;
      if (statusFilter) {
        response = await orderAPI.getOrdersByStatus(statusFilter, currentPage - 1, pageSize);
      } else {
        response = await orderAPI.getAllOrders(currentPage - 1, pageSize);
      }
      setOrders(response);
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      message.success('订单状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('订单状态更新失败');
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
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

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '客户',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '商品数量',
      key: 'itemCount',
      render: (record: Order) => `${record.orderItems.length} 种商品`,
    },
    {
      title: '总金额',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `¥${price}`,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Order) => (
        <Space>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          <Select
            value={status}
            style={{ width: 100 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            size="small"
          >
            <Option value="PENDING">待支付</Option>
            <Option value="PAID">已支付</Option>
            <Option value="SHIPPED">已发货</Option>
            <Option value="DELIVERED">已送达</Option>
            <Option value="CANCELLED">已取消</Option>
          </Select>
        </Space>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>📋 订单管理</Title>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>状态筛选：</span>
          <Select
            value={statusFilter}
            style={{ width: 120 }}
            onChange={setStatusFilter}
            allowClear
            placeholder="全部状态"
          >
            <Option value="PENDING">待支付</Option>
            <Option value="PAID">已支付</Option>
            <Option value="SHIPPED">已发货</Option>
            <Option value="DELIVERED">已送达</Option>
            <Option value="CANCELLED">已取消</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={orders?.content || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: orders?.totalElements || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
        }}
      />

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="订单号">{selectedOrder.id}</Descriptions.Item>
              <Descriptions.Item label="客户">{selectedOrder.username}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedOrder.totalPrice}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间" span={2}>
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={4}>订单商品</Title>
              <List
                dataSource={selectedOrder.orderItems}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.bookTitle}
                      description={`作者: ${item.bookAuthor}`}
                    />
                    <div>
                      <div>单价: ¥{item.price}</div>
                      <div>数量: {item.quantity}</div>
                      <div><strong>小计: ¥{item.subtotal}</strong></div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
