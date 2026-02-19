import { Button, Card, Input, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { CheckOutlined, CloseOutlined, CloudUploadOutlined, CloudDownloadOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { useState } from 'react';
import './CSS/Admin.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const REVIEW_MAP = {
  draft: { text: '编辑中', color: 'default' },
  pending: { text: '审核中', color: 'processing' },
  approved: { text: '通过', color: 'success' },
  rejected: { text: '不通过', color: 'error' },
};

function Admin() {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const { hotelList, setReview, setPublished } = useHotel();
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

  const handleApprove = (id) => {
    setReview(id, 'approved', '');
    message.success('已通过审核');
  };

  const handleRejectOpen = (id) => {
    setRejectModal({ open: true, id, reason: '' });
  };

  const handleRejectSubmit = () => {
    if (!rejectModal.reason?.trim()) {
      message.warning('请填写不通过原因');
      return;
    }
    setReview(rejectModal.id, 'rejected', rejectModal.reason.trim());
    message.success('已驳回');
    setRejectModal({ open: false, id: null, reason: '' });
  };

  const handlePublish = (id) => {
    setPublished(id, true);
    message.success('已发布上线');
  };

  const handleOffline = (id) => {
    setPublished(id, false);
    message.success('已下线，可在列表中再次发布恢复');
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (name, row) => (
        <span>
          {name || '-'}
          {row.nameEn ? <span style={{ color: '#666', fontSize: 12, marginLeft: 4 }}>/ {row.nameEn}</span> : null}
        </span>
      ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 140,
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 100,
      render: (status) => {
        const c = REVIEW_MAP[status] || REVIEW_MAP.pending;
        return <Tag color={c.color}>{c.text}</Tag>;
      },
    },
    {
      title: '不通过原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      ellipsis: true,
      width: 140,
      render: (reason, row) =>
        row.reviewStatus === 'rejected' && reason ? <Text type="danger">{reason}</Text> : '-',
    },
    {
      title: '发布状态',
      dataIndex: 'published',
      key: 'published',
      width: 90,
      render: (published) => (
        <Tag color={published ? 'green' : 'default'}>{published ? '已发布' : '已下线'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, row) => (
        <Space wrap size="small">
          {row.reviewStatus === 'pending' && (
            <>
              <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(row.id)}>
                通过
              </Button>
              <Button type="link" size="small" danger icon={<CloseOutlined />} onClick={() => handleRejectOpen(row.id)}>
                不通过
              </Button>
            </>
          )}
          {row.reviewStatus === 'approved' && !row.published && (
            <Button type="link" size="small" icon={<CloudUploadOutlined />} onClick={() => handlePublish(row.id)}>
              发布
            </Button>
          )}
          {row.published && (
            <Button type="link" size="small" icon={<CloudDownloadOutlined />} onClick={() => handleOffline(row.id)}>
              下线
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Text type="danger">无管理员权限</Text>
          <Button type="link" onClick={() => navigate('/home')}>返回首页</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Card className="admin-card">
        <div className="admin-header">
          <Title level={3} style={{ margin: 0 }}>酒店信息审核 / 发布 / 下线</Title>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          审核状态：通过 / 不通过 / 审核中；不通过时需填写原因。下线非删除，可再次发布恢复。
        </Text>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={hotelList}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title="填写不通过原因"
        open={rejectModal.open}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModal({ open: false, id: null, reason: '' })}
        okText="确定驳回"
        cancelText="取消"
      >
        <TextArea
          rows={4}
          placeholder="请填写不通过原因，将展示给商户"
          value={rejectModal.reason}
          onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
        />
      </Modal>
    </div>
  );
}

export default Admin;
