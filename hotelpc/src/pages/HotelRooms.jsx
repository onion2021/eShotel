import { Button, Card, Form, Input, InputNumber, List, Modal, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { useState } from 'react';
import './CSS/HotelRooms.css';

const { Title, Text } = Typography;

function HotelRooms() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hotelList, saveHotel } = useHotel();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  const hotel = hotelList.find((h) => h.id === id);
  const roomTypes = Array.isArray(hotel?.roomTypes) ? hotel.roomTypes : [];

  const openAdd = () => {
    setEditingRoom(null);
    form.setFieldsValue({ name: '', price: undefined });
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    form.setFieldsValue({ name: room.name, price: room.price });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const next = roomTypes.filter((r) => r.id !== editingRoom?.id);
      const newRoom = {
        id: editingRoom?.id || `rt_${id}_${Date.now()}`,
        name: values.name.trim(),
        price: values.price == null ? undefined : Number(values.price),
      };
      next.push(newRoom);
      saveHotel({ ...hotel, roomTypes: next, updatedAt: Date.now() });
      message.success(editingRoom ? '房型已更新' : '房型已添加');
      setModalOpen(false);
      form.resetFields();
    }).catch(() => {});
  };

  const handleDelete = (room) => {
    const next = roomTypes.filter((r) => r.id !== room.id);
    saveHotel({ ...hotel, roomTypes: next, updatedAt: Date.now() });
    message.success('已删除');
  };

  if (!hotel) {
    return (
      <div style={{ padding: 24 }}>
        <Card><Text type="secondary">未找到该酒店</Text></Card>
        <Button type="link" onClick={() => navigate('/home')}>返回首页</Button>
      </div>
    );
  }

  return (
    <div className="hotel-rooms-page">
      <Card className="hotel-rooms-card">
        <div className="hotel-rooms-header">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}>返回</Button>
          <Title level={4} style={{ margin: '8px 0 16px' }}>{hotel.name || '未命名酒店'} - 房型管理</Title>
          <Text type="secondary">不同房型可设置不同价格。添加或编辑房型后会自动保存。</Text>
        </div>

        <div className="hotel-rooms-actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增房型</Button>
        </div>

        {roomTypes.length === 0 ? (
          <div className="hotel-rooms-empty">
            <Text type="secondary">暂无房型，点击「新增房型」录入房型名称与价格。</Text>
          </div>
        ) : (
          <List
            dataSource={roomTypes}
            renderItem={(room) => (
              <List.Item
                className="hotel-rooms-item"
                actions={[
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(room)}>编辑</Button>,
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(room)}>删除</Button>,
                ]}
              >
                <List.Item.Meta
                  title={room.name || '未命名房型'}
                  description={room.price != null ? `¥${room.price}/晚` : '未设置价格'}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={editingRoom ? '编辑房型' : '新增房型'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={editingRoom ? '保存' : '添加'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="房型名称" rules={[{ required: true, message: '请输入房型名称' }]}>
            <Input placeholder="如 大床房、双床房、套房" />
          </Form.Item>
          <Form.Item name="price" label="价格（元/晚）" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} placeholder="如 399" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default HotelRooms;
