import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { Button, Card, List, Popconfirm, Space, Tag, Typography } from 'antd'
import { PlusOutlined, EditOutlined, LogoutOutlined, AppstoreOutlined, DeleteOutlined } from '@ant-design/icons'
import { useHotel } from '../context/HotelContext'
import { useAuth } from '../context/AuthContext'
import './CSS/Home.css'

const { Title, Text } = Typography
const REVIEW_TAG = {
  draft: { text: '编辑中', color: 'default' },
  pending: { text: '审核中', color: 'processing' },
  approved: { text: '通过', color: 'success' },
  rejected: { text: '不通过', color: 'error' },
}

function formatModifyTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function Home() {
  const navigate = useNavigate()
  const { logout, currentUser } = useAuth()
  const { hotelList, removeHotel } = useHotel()

  const myList = useMemo(() => {
    const username = currentUser?.username ?? ''
    return hotelList.filter((h) => !h.createdBy || h.createdBy === username)
  }, [hotelList, currentUser?.username])

  const sortedList = useMemo(() => {
    return [...myList].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
  }, [myList])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <Title level={3} className="home-title">易宿酒店管理</Title>
        <div className="home-actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/hotel-info')}>
            新增酒店信息
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </div>

      {myList.length === 0 ? (
        <Card className="home-empty">
          <Text type="secondary">暂无酒店信息，点击「新增酒店信息」录入酒店基础信息，保存后可进入该酒店进行房型与价格管理。</Text>
        </Card>
      ) : (
        <List
          className="home-list"
          grid={{ gutter: 0, column: 1 }}
          dataSource={sortedList}
          renderItem={(item) => (
            <List.Item>
              <Card
                className="home-card"
                title={
                  <span>
                    {item.name || '未命名酒店'}
                    {item.nameEn ? <span className="home-card-name-en">/ {item.nameEn}</span> : null}
                  </span>
                }
                extra={
                  <Space size="small" wrap>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      className="home-edit-btn"
                      onClick={() => navigate(`/hotel-info/${item.id}`)}
                    >
                      编辑
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      icon={<AppstoreOutlined />}
                      onClick={() => navigate(`/hotel/${item.id}/rooms`)}
                    >
                      房型管理
                    </Button>
                    <Popconfirm
                      title="确定删除该酒店？"
                      description="删除后不可恢复，其下房型数据将一并删除。"
                      onConfirm={() => { removeHotel(item.id); }}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                  </Space>
                }
              >
                <div className="home-status-row">
                  <Tag color={(REVIEW_TAG[item.reviewStatus] || REVIEW_TAG.pending).color}>
                    {(REVIEW_TAG[item.reviewStatus] || REVIEW_TAG.pending).text}
                  </Tag>
                  {item.published && <Tag color="green">已发布</Tag>}
                  <Text type="secondary" style={{ marginLeft: 'auto', fontSize: 13 }}>
                    上次修改：{formatModifyTime(item.updatedAt)}
                  </Text>
                </div>

                {item.reviewStatus === 'rejected' && item.rejectReason ? (
                  <div className="home-reject-reason">
                    <span className="label">不通过原因：</span>{item.rejectReason}
                  </div>
                ) : null}

                <div className="home-info-grid">
                  <div className="home-info-item">
                    <span className="label">地址</span>
                    <span className="value">{item.address || '-'}</span>
                  </div>
                  <div className="home-info-item">
                    <span className="label">星级</span>
                    <span className="value">{item.star ? `${item.star}星` : '-'}</span>
                  </div>
                  <div className="home-info-item">
                    <span className="label">房型</span>
                    <span className="value">
                      {item.roomTypes?.length
                        ? `共 ${item.roomTypes.length} 种：${item.roomTypes.map((r) => `${r.name}${r.price != null ? ` ¥${r.price}/晚` : ''}`).join('、')}`
                        : '未录入'}
                    </span>
                  </div>
                  <div className="home-info-item">
                    <span className="label">开业时间</span>
                    <span className="value">{item.openingTime || '-'}</span>
                  </div>
                </div>

                {(item.nearbyInfo || (item.promotions && item.promotions.length > 0)) ? (
                  <div className="home-extra-block">
                    {item.nearbyInfo ? (
                      <div><span className="label">附近：</span>{item.nearbyInfo}</div>
                    ) : null}
                    {item.promotions && item.promotions.length > 0 ? (
                      <div><span className="label">优惠：</span>{item.promotions.join('；')}</div>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  )
}

export default Home
