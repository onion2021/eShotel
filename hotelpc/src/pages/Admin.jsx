import { Button, Card, Input, Modal, Space, Table, Tag, Typography, message, Select, Row, Col, Popconfirm, Descriptions, Image } from 'antd';
import { CheckOutlined, CloseOutlined, CloudUploadOutlined, CloudDownloadOutlined, LogoutOutlined, SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import './CSS/Admin.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
  const [viewModal, setViewModal] = useState({ open: false, hotel: null });
  const [searchText, setSearchText] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');

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

  // 过滤和搜索逻辑
  const filteredList = useMemo(() => {
    let list = [...hotelList];

    // 搜索过滤（酒店名称、地址）
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      list = list.filter(
        (hotel) =>
          hotel.name?.toLowerCase().includes(keyword) ||
          hotel.nameEn?.toLowerCase().includes(keyword) ||
          hotel.address?.toLowerCase().includes(keyword)
      );
    }

    // 审核状态过滤
    if (reviewStatusFilter !== 'all') {
      list = list.filter((hotel) => hotel.reviewStatus === reviewStatusFilter);
    }

    // 发布状态过滤
    if (publishedFilter !== 'all') {
      if (publishedFilter === 'published') {
        list = list.filter((hotel) => hotel.published === true);
      } else if (publishedFilter === 'unpublished') {
        list = list.filter((hotel) => hotel.everPublished !== true);
      } else if (publishedFilter === 'offline') {
        list = list.filter((hotel) => hotel.everPublished === true && hotel.published === false);
      }
    }

    // 按更新时间降序排序
    return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [hotelList, searchText, reviewStatusFilter, publishedFilter]);

  const handleResetFilters = () => {
    setSearchText('');
    setReviewStatusFilter('all');
    setPublishedFilter('all');
  };

  const handleView = (hotel) => {
    setViewModal({ open: true, hotel });
  };

  const handleCloseView = () => {
    setViewModal({ open: false, hotel: null });
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left',
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
      width: 160,
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 80,
      render: (star) => (star ? `${star}星` : '-'),
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 110,
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
      width: 180,
      render: (reason, row) =>
        row.reviewStatus === 'rejected' && reason ? (
          <Text type="danger" style={{ fontSize: 12 }}>
            {reason}
          </Text>
        ) : (
          '-'
        ),
    },
    {
      title: '发布状态',
      dataIndex: 'published',
      key: 'published',
      width: 100,
      render: (published, row) => {
        if (!row.everPublished) {
          return <Tag color="default">未发布</Tag>;
        }
        if (published) {
          return <Tag color="green">已发布</Tag>;
        }
        return <Tag color="default">已下线</Tag>;
      },
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
      render: (createdBy) => createdBy || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      sorter: (a, b) => (a.updatedAt || 0) - (b.updatedAt || 0),
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, row) => (
        <Space wrap size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(row)}>
            查看
          </Button>
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
          {row.reviewStatus === 'approved' && (
            <>
              {!row.published ? (
                <Popconfirm
                  title="确认发布"
                  description="确定要发布该酒店信息吗？"
                  onConfirm={() => handlePublish(row.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" size="small" icon={<CloudUploadOutlined />}>
                    发布
                  </Button>
                </Popconfirm>
              ) : (
                <Popconfirm
                  title="确认下线"
                  description="下线后可以再次发布恢复，确定要下线吗？"
                  onConfirm={() => handleOffline(row.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" size="small" icon={<CloudDownloadOutlined />}>
                    下线
                  </Button>
                </Popconfirm>
              )}
            </>
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

        {/* 搜索和筛选区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索酒店名称、英文名或地址"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="筛选审核状态"
              style={{ width: '100%' }}
              value={reviewStatusFilter}
              onChange={setReviewStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="draft">编辑中</Option>
              <Option value="pending">审核中</Option>
              <Option value="approved">通过</Option>
              <Option value="rejected">不通过</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="筛选发布状态"
              style={{ width: '100%' }}
              value={publishedFilter}
              onChange={setPublishedFilter}
            >
              <Option value="all">全部</Option>
              <Option value="published">已发布</Option>
              <Option value="unpublished">未发布</Option>
              <Option value="offline">已下线</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ width: '100%' }}
            >
              重置
            </Button>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredList}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            showQuickJumper: true,
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title="填写不通过原因"
        open={rejectModal.open}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModal({ open: false, id: null, reason: '' })}
        okText="确定驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <TextArea
          rows={4}
          placeholder="请填写不通过原因，将展示给商户"
          value={rejectModal.reason}
          onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
          maxLength={200}
          showCount
        />
      </Modal>

      {/* 查看详情Modal */}
      <Modal
        title="酒店详细信息"
        open={viewModal.open}
        onCancel={handleCloseView}
        footer={[
          <Button key="close" onClick={handleCloseView}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {viewModal.hotel && (
          <div className="hotel-detail-view">
            {/* 基本信息 */}
            <Descriptions 
              title="基本信息" 
              bordered 
              column={2} 
              style={{ marginBottom: 24 }}
              labelStyle={{ width: '150px' }}
              contentStyle={{ width: '300px' }}
            >
              <Descriptions.Item label="酒店名称（中文）">{viewModal.hotel.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="酒店名称（英文）">{viewModal.hotel.nameEn || '-'}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{viewModal.hotel.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="星级">{viewModal.hotel.star ? `${viewModal.hotel.star}星` : '-'}</Descriptions.Item>
              <Descriptions.Item label="开业时间">{viewModal.hotel.openingTime || '-'}</Descriptions.Item>
            </Descriptions>

            {/* 审核与发布状态 */}
            <Descriptions 
              title="审核与发布状态" 
              bordered 
              column={2} 
              style={{ marginBottom: 24 }}
              labelStyle={{ width: '150px' }}
              contentStyle={{ width: '300px' }}
            >
              <Descriptions.Item label="审核状态">
                {(() => {
                  const c = REVIEW_MAP[viewModal.hotel.reviewStatus] || REVIEW_MAP.pending;
                  return <Tag color={c.color}>{c.text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="发布状态">
                {(() => {
                  if (!viewModal.hotel.everPublished) {
                    return <Tag color="default">未发布</Tag>;
                  }
                  if (viewModal.hotel.published) {
                    return <Tag color="green">已发布</Tag>;
                  }
                  return <Tag color="default">已下线</Tag>;
                })()}
              </Descriptions.Item>
              {viewModal.hotel.reviewStatus === 'rejected' && viewModal.hotel.rejectReason && (
                <Descriptions.Item label="不通过原因" span={2}>
                  <Text type="danger">{viewModal.hotel.rejectReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 房型信息 */}
            {viewModal.hotel.roomTypes && viewModal.hotel.roomTypes.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>房型信息</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {viewModal.hotel.roomTypes.map((room, idx) => (
                    <Card key={idx} size="small" style={{ minWidth: 200 }}>
                      <div>
                        <Text strong>{room.name || '未命名房型'}</Text>
                      </div>
                      {room.price != null && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">¥{room.price}/晚</Text>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 图片 */}
            {viewModal.hotel.images && viewModal.hotel.images.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>酒店图片</Title>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {viewModal.hotel.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`${viewModal.hotel.name || '酒店'} - 图片${idx + 1}`}
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            {/* 附近信息 */}
            {viewModal.hotel.nearbyInfo && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>附近信息</Title>
                <Text>{viewModal.hotel.nearbyInfo}</Text>
              </div>
            )}

            {/* 服务信息 */}
            {viewModal.hotel.services && viewModal.hotel.services.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>服务信息</Title>
                <div>
                  {viewModal.hotel.services.map((service, idx) => (
                    <Tag key={idx} color="blue" style={{ marginBottom: 8 }}>
                      {service}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* 优惠信息 */}
            {viewModal.hotel.promotions && viewModal.hotel.promotions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>优惠信息</Title>
                <div>
                  {viewModal.hotel.promotions.map((promo, idx) => (
                    <Tag key={idx} color="orange" style={{ marginBottom: 8 }}>
                      {promo}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* 自定义维度 */}
            {viewModal.hotel.customDimensions && viewModal.hotel.customDimensions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>自定义维度</Title>
                <Descriptions bordered column={1} size="small">
                  {viewModal.hotel.customDimensions.map((dim, idx) => (
                    <Descriptions.Item key={idx} label={dim.name || '未命名维度'}>
                      {dim.value || '-'}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            )}

            {/* 系统信息 */}
            <Descriptions title="系统信息" bordered column={2}>
              <Descriptions.Item label="创建者">{viewModal.hotel.createdBy || '-'}</Descriptions.Item>
              <Descriptions.Item label="酒店ID">{viewModal.hotel.id || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {viewModal.hotel.createdAt ? dayjs(viewModal.hotel.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {viewModal.hotel.updatedAt ? dayjs(viewModal.hotel.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Admin;
