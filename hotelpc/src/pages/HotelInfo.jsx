import { Button, Card, Form, Input, Select, Space, Typography, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import './CSS/HotelInfo.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STAR_OPTIONS = [
  { value: 1, label: '一星' },
  { value: 2, label: '二星' },
  { value: 3, label: '三星' },
  { value: 4, label: '四星' },
  { value: 5, label: '五星' },
];

function HotelInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { hotelList, saveHotel } = useHotel();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(id);
  const currentHotel = isEdit ? hotelList.find((h) => h.id === id) : null;

  useEffect(() => {
    if (currentHotel) {
      const { customDimensions = [], promotions = [], roomTypes, createdBy, ...rest } = currentHotel;
      form.setFieldsValue({
        ...rest,
        promotions: (promotions.length ? promotions : [{ text: '' }]).map((p) => (typeof p === 'string' ? { text: p } : { text: p.text || '' })),
        customDimensions: (customDimensions.length ? customDimensions : [{ name: '', value: '' }]).map((d) => ({
          name: d.name,
          value: d.value,
        })),
      });
    } else {
      form.setFieldsValue({
        promotions: [{ text: '' }],
        customDimensions: [{ name: '', value: '' }],
      });
    }
  }, [currentHotel, form, id]);

  const buildHotel = (values) => {
    const { customDimensions = [], promotions = [], ...rest } = values;
    const cleanedCustom = customDimensions
      .filter((d) => d && (d.name?.trim() || d.value?.trim()))
      .map((d) => ({ name: d.name?.trim() || '', value: d.value?.trim() || '' }));
    const cleanedPromotions = (promotions || [])
      .filter((p) => p && p.text?.trim())
      .map((p) => p.text.trim());
    const createdBy = currentUser?.username ?? currentHotel?.createdBy ?? '';
    const roomTypes = currentHotel?.roomTypes ?? [];
    return {
      ...rest,
      id: isEdit ? id : `hotel_${Date.now()}`,
      promotions: cleanedPromotions,
      customDimensions: cleanedCustom,
      createdBy,
      roomTypes,
    };
  };

  const onSaveDraft = () => {
    form.validateFields().then((values) => {
      setSaving(true);
      const hotel = buildHotel(values);
      saveHotel(hotel, { submitForReview: false });
      setSaving(false);
      message.success('已保存，当前为编辑中');
      navigate('/home', { replace: true });
    }).catch(() => {});
  };

  const onFinish = (values) => {
    setSaving(true);
    const hotel = buildHotel(values);
    saveHotel(hotel, { submitForReview: true });
    setSaving(false);
    message.success('已提交，等待审核');
    navigate('/home', { replace: true });
  };

  return (
    <div className="hotel-info-page">
      <Card className="hotel-info-card">
        <Title level={3}>酒店信息{isEdit ? '编辑' : '录入'}</Title>
        <Text type="secondary">填写或修改酒店基础信息。房型与价格请在保存后进入该酒店的「房型管理」中录入。</Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            star: 3,
            promotions: [{ text: '' }],
            customDimensions: [{ name: '', value: '' }],
          }}
          style={{ marginTop: 24 }}
        >
          <Title level={5}>必须维度</Title>
          <Form.Item
            label="酒店名（中文）"
            name="name"
            rules={[{ required: true, message: '请输入酒店名称' }]}
          >
            <Input placeholder="请输入酒店中文名称" />
          </Form.Item>
          <Form.Item
            label="酒店名（英文显示）"
            name="nameEn"
          >
            <Input placeholder="Hotel Name (English)" />
          </Form.Item>
          <Form.Item
            label="酒店地址"
            name="address"
            rules={[{ required: true, message: '请输入酒店地址' }]}
          >
            <Input placeholder="省市区及详细地址" />
          </Form.Item>
          <Form.Item
            label="酒店星级"
            name="star"
            rules={[{ required: true, message: '请选择星级' }]}
          >
            <Select options={STAR_OPTIONS} placeholder="请选择星级" />
          </Form.Item>
          <Form.Item
            label="酒店开业时间"
            name="openingTime"
            rules={[{ required: true, message: '请输入开业时间' }]}
          >
            <Input placeholder="如 2020年1月 或 2020-01" />
          </Form.Item>

          <Title level={5} style={{ marginTop: 24 }}>可选维度</Title>
          <Form.Item
            label="酒店附近的热门景点、交通及商场"
            name="nearbyInfo"
          >
            <TextArea rows={3} placeholder="附近景点、地铁/公交、商场等" />
          </Form.Item>
          <Form.Item label="酒店价格的打折/优惠场景">
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              如：节日优惠打8折、机酒套餐减200元等
            </Text>
            <Form.List name="promotions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'text']} style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
                        <Input placeholder="如 节日优惠打8折" />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => (fields.length > 1 ? remove(name) : null)}
                        style={{ color: fields.length > 1 ? '#ff4d4f' : '#d9d9d9', fontSize: 18 }}
                      />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ text: '' })} icon={<PlusOutlined />}>
                    添加优惠场景
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Title level={5} style={{ marginTop: 16 }}>其他自定义维度</Title>
          <Form.List name="customDimensions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'name']} style={{ marginBottom: 0, minWidth: 140 }}>
                      <Input placeholder="维度名" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'value']} style={{ marginBottom: 0, flex: 1, minWidth: 180 }}>
                      <Input placeholder="维度值" />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => (fields.length > 1 ? remove(name) : null)}
                      style={{ color: fields.length > 1 ? '#ff4d4f' : '#d9d9d9', fontSize: 18 }}
                    />
                  </Space>
                ))}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加自定义维度
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button loading={saving} onClick={onSaveDraft}>
                保存
              </Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                提交
              </Button>
              <Button onClick={() => navigate('/home')}>返回</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default HotelInfo;
