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
  Descriptions,
  Input,
  Tabs
} from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { orderAPI } from '../../services/api';
import { Order, PageResponse, CancelRequest } from '../../types';

const { TextArea } = Input;
const { TabPane } = Tabs;

const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelRequests, setCancelRequests] = useState<PageResponse<CancelRequest> | null>(null);
  const [cancelRequestsLoading, setCancelRequestsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [handleCancelModalVisible, setHandleCancelModalVisible] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<CancelRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [handleLoading, setHandleLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'cancel-requests') {
      fetchCancelRequests();
    }
  }, [currentPage, pageSize, statusFilter, activeTab]);

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

  const fetchCancelRequests = async () => {
    setCancelRequestsLoading(true);
    try {
      const response = await orderAPI.getPendingCancelRequests(currentPage - 1, pageSize);
      setCancelRequests(response);
    } catch (error) {
      message.error('获取取消申请列表失败');
    } finally {
      setCancelRequestsLoading(false);
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

  const handleCancelRequest = (request: CancelRequest) => {
    setSelectedCancelRequest(request);
    setHandleCancelModalVisible(true);
    setAdminNote('');
  };

  const handleApproveCancelRequest = async (approved: boolean) => {
    if (!selectedCancelRequest) return;

    setHandleLoading(true);
    try {
      await orderAPI.handleCancelRequest(
        selectedCancelRequest.orderId,
        approved,
        adminNote.trim() || undefined
      );
      message.success(`取消申请已${approved ? '同意' : '拒绝'}`);
      setHandleCancelModalVisible(false);
      fetchCancelRequests();
      if (activeTab === 'orders') {
        fetchOrders();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '处理申请失败');
    } finally {
      setHandleLoading(false);
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

  const getCancelRequestStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待审核';
      case 'APPROVED': return '已同意';
      case 'REJECTED': return '已拒绝';
      default: return status;
    }
  };

  const getCancelRequestStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'default';
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

  const cancelRequestColumns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getCancelRequestStatusColor(status)}>
          {getCancelRequestStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_:any, record: CancelRequest) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleCancelRequest(record)}
            >
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>📋 订单管理</Title>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => {
          setActiveTab(key);
          setCurrentPage(1);
          setStatusFilter('');
        }}
      >
        <TabPane tab="订单列表" key="orders">
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
        </TabPane>

        <TabPane tab="取消申请" key="cancel-requests">
          <Table
            columns={cancelRequestColumns}
            dataSource={cancelRequests?.content || []}
            rowKey="id"
            loading={cancelRequestsLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: cancelRequests?.totalElements || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
              },
            }}
          />
        </TabPane>
      </Tabs>

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

      {/* 处理取消申请模态框 */}
      <Modal
        title="处理取消申请"
        open={handleCancelModalVisible}
        onCancel={() => {
          setHandleCancelModalVisible(false);
          setAdminNote('');
        }}
        footer={[
          <Button key="cancel" onClick={() => setHandleCancelModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseOutlined />}
            loading={handleLoading}
            onClick={() => handleApproveCancelRequest(false)}
          >
            拒绝申请
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckOutlined />}
            loading={handleLoading}
            onClick={() => handleApproveCancelRequest(true)}
          >
            同意申请
          </Button>,
        ]}
      >
        {selectedCancelRequest && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="申请ID">{selectedCancelRequest.id}</Descriptions.Item>
              <Descriptions.Item label="订单号">{selectedCancelRequest.orderId}</Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {new Date(selectedCancelRequest.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="申请状态">
                <Tag color={getCancelRequestStatusColor(selectedCancelRequest.status)}>
                  {getCancelRequestStatusText(selectedCancelRequest.status)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Text strong>取消原因:</Text>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 6,
                border: '1px solid #d9d9d9'
              }}>
                <Text>{selectedCancelRequest.reason}</Text>
              </div>
            </div>

            <div>
              <Text strong>管理员备注:</Text>
              <TextArea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="请填写处理备注（可选）..."
                rows={3}
                maxLength={300}
                showCount
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
