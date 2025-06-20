import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  message, 
  Space,
  Popconfirm,
  Typography,
  Tag,
  Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { bookAPI } from '../../services/api';
import { Book, PageResponse } from '../../types';

const { Title } = Typography;
const { TextArea } = Input;
const { Search } = Input;

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<PageResponse<Book> | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBooks();
  }, [currentPage, pageSize]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let response;
      if (searchKeyword.trim()) {
        response = await bookAPI.searchBooks(searchKeyword, currentPage - 1, pageSize);
      } else {
        response = await bookAPI.getBooks(currentPage - 1, pageSize);
      }
      setBooks(response);
    } catch (error) {
      message.error('获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
    setTimeout(fetchBooks, 100);
  };

  const handleAdd = () => {
    setEditingBook(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    form.setFieldsValue(book);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await bookAPI.deleteBook(id);
      message.success('删除成功');
      fetchBooks();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingBook) {
        await bookAPI.updateBook(editingBook.id, values);
        message.success('更新成功');
      } else {
        await bookAPI.createBook(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchBooks();
    } catch (error) {
      message.error(editingBook ? '更新失败' : '添加失败');
    }
  };

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      width: 80,
      render: (coverUrl: string) => (
        coverUrl ? (
          <Image
            width={50}
            height={60}
            src={coverUrl}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ 
            width: 50, 
            height: 60, 
            background: '#f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            📖
          </div>
        )
      ),
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      ellipsis: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}`,
      sorter: true,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
      sorter: true,
    },
    {
      title: '上架时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Book) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这本书吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>📚 图书管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加图书
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索图书标题或作者"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={books?.content || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: books?.totalElements || 0,
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
        title={editingBook ? '编辑图书' : '添加图书'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input placeholder="请输入书名" />
          </Form.Item>

          <Form.Item
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              placeholder="请输入价格"
              min={0}
              precision={2}
              style={{ width: '100%' }}
              addonBefore="¥"
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber
              placeholder="请输入库存"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="coverUrl"
            label="封面图片URL"
          >
            <Input placeholder="请输入封面图片URL（可选）" />
          </Form.Item>

          <Form.Item
            name="description"
            label="图书描述"
          >
            <TextArea
              placeholder="请输入图书描述（可选）"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBooks;
