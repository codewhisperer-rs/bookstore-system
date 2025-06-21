import React from 'react';
import { Card, Tag, Typography, Space, Descriptions } from 'antd';
import { CancelRequest } from '../types';

const { Text } = Typography;

interface CancelRequestInfoProps {
  cancelRequest: CancelRequest;
}

const CancelRequestInfo: React.FC<CancelRequestInfoProps> = ({ cancelRequest }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '审核中';
      case 'APPROVED': return '已同意';
      case 'REJECTED': return '已拒绝';
      default: return status;
    }
  };

  return (
    <Card 
      title="取消申请信息" 
      size="small" 
      style={{ marginTop: 16 }}
      headStyle={{ background: '#fafafa' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>申请状态:</Text>
          <Tag color={getStatusColor(cancelRequest.status)}>
            {getStatusText(cancelRequest.status)}
          </Tag>
        </div>
        
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="申请时间">
            {new Date(cancelRequest.createdAt).toLocaleString()}
          </Descriptions.Item>
          {cancelRequest.processedAt && (
            <Descriptions.Item label="处理时间">
              {new Date(cancelRequest.processedAt).toLocaleString()}
            </Descriptions.Item>
          )}
        </Descriptions>

        <div>
          <Text strong>取消原因:</Text>
          <div style={{ 
            marginTop: 8, 
            padding: 12, 
            background: '#f9f9f9', 
            borderRadius: 6,
            border: '1px solid #e8e8e8'
          }}>
            <Text>{cancelRequest.reason}</Text>
          </div>
        </div>

        {cancelRequest.adminNote && (
          <div>
            <Text strong>管理员备注:</Text>
            <div style={{ 
              marginTop: 8, 
              padding: 12, 
              background: '#f0f8ff', 
              borderRadius: 6,
              border: '1px solid #d6e4ff'
            }}>
              <Text>{cancelRequest.adminNote}</Text>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default CancelRequestInfo;