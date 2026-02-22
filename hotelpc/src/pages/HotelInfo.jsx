import { AutoComplete, Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, Typography, message, Upload } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import './CSS/HotelInfo.css';

dayjs.locale('zh-cn');

const { Title, Text } = Typography;
const { TextArea } = Input;
const OPENING_TIME_FORMAT = 'YYYY-MM';
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_COUNT = 9;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STAR_OPTIONS = [
  { value: 1, label: '一星' },
  { value: 2, label: '二星' },
  { value: 3, label: '三星' },
  { value: 4, label: '四星' },
  { value: 5, label: '五星' },
];

const ROOM_TYPE_OPTIONS = [
  { value: '大床房' },
  { value: '双床房' },
  { value: '标准间' },
  { value: '套房' },
  { value: '豪华间' },
  { value: '家庭房' },
  { value: '景观房' },
  { value: '行政房' },
  { value: '亲子房' },
  { value: '榻榻米房' },
  { value: '商务大床房' },
  { value: '豪华套房' },
  { value: '海景房' },
  { value: '园景房' },
];

const SERVICE_OPTIONS = [
  { value: '免费停车' },
  { value: '免费WiFi' },
  { value: '免费早餐' },
  { value: '24小时前台' },
  { value: '行李寄存' },
  { value: '接机服务' },
  { value: '健身房' },
  { value: '游泳池' },
  { value: '会议室' },
  { value: '商务中心' },
  { value: '餐厅' },
  { value: '酒吧' },
  { value: 'SPA' },
  { value: '洗衣服务' },
  { value: '叫车服务' },
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
      const { customDimensions = [], promotions = [], roomTypes = [], services = [], createdBy, openingTime, images = [], ...rest } = currentHotel;
      form.setFieldsValue({
        ...rest,
        openingTime: openingTime && dayjs(openingTime, OPENING_TIME_FORMAT).isValid() ? dayjs(openingTime, OPENING_TIME_FORMAT) : undefined,
        images: Array.isArray(images) ? images : [],
        promotions: (promotions.length ? promotions : [{ text: '' }]).map((p) => (typeof p === 'string' ? { text: p } : { text: p.text || '' })),
        services: (services.length ? services : [{ text: '' }]).map((s) => (typeof s === 'string' ? { text: s } : { text: s.text || '' })),
        customDimensions: (customDimensions.length ? customDimensions : [{ name: '', value: '' }]).map((d) => ({
          name: d.name,
          value: d.value,
        })),
        roomTypes: (roomTypes.length ? roomTypes : [{ name: '', price: undefined }]).map((r) => ({
          id: r.id,
          name: r.name || '',
          price: r.price,
        })),
      });
    } else {
      form.setFieldsValue({
        images: [],
        promotions: [{ text: '' }],
        services: [{ text: '' }],
        customDimensions: [{ name: '', value: '' }],
        roomTypes: [{ name: '', price: undefined }],
      });
    }
  }, [currentHotel, form, id]);

  const buildHotel = (values) => {
    const { customDimensions = [], promotions = [], services = [], roomTypes = [], openingTime, images = [], ...rest } = values;
    const cleanedCustom = customDimensions
      .filter((d) => d && (d.name?.trim() || d.value?.trim()))
      .map((d) => ({ name: d.name?.trim() || '', value: d.value?.trim() || '' }));
    const cleanedPromotions = (promotions || [])
      .filter((p) => p && p.text?.trim())
      .map((p) => p.text.trim());
    const cleanedServices = (services || [])
      .filter((s) => s && s.text?.trim())
      .map((s) => s.text.trim());
    const cleanedRoomTypes = roomTypes
      .filter((r) => r && r.name?.trim())
      .map((r, idx) => ({
        id: r.id || `rt_${isEdit ? id : 'new'}_${Date.now()}_${idx}`,
        name: r.name.trim(),
        price: r.price != null ? Number(r.price) : undefined,
      }));
    const createdBy = currentUser?.username ?? currentHotel?.createdBy ?? '';
    const openingTimeStr = openingTime && dayjs.isDayjs(openingTime) ? openingTime.format(OPENING_TIME_FORMAT) : (openingTime || '');
    const imagesList = Array.isArray(images) ? images : [];
    return {
      ...rest,
      openingTime: openingTimeStr,
      images: imagesList,
      id: isEdit ? id : `hotel_${Date.now()}`,
      promotions: cleanedPromotions,
      services: cleanedServices,
      customDimensions: cleanedCustom,
      roomTypes: cleanedRoomTypes,
      createdBy,
    };
  };

  const beforeUpload = (file) => {
    const isLt = file.size / 1024 / 1024 <= MAX_IMAGE_SIZE_MB;
    if (!isLt) {
      message.warning(`图片大小不能超过 ${MAX_IMAGE_SIZE_MB}MB`);
      return Upload.LIST_IGNORE;
    }
    fileToDataUrl(file).then((dataUrl) => {
      const prev = form.getFieldValue('images') || [];
      if (prev.length >= MAX_IMAGE_COUNT) {
        message.warning(`最多上传 ${MAX_IMAGE_COUNT} 张图片`);
        return;
      }
      form.setFieldValue('images', [...prev, dataUrl]);
    }).catch(() => message.error('图片读取失败'));
    return false;
  };

  const removeImage = (index) => {
    const prev = form.getFieldValue('images') || [];
    form.setFieldValue('images', prev.filter((_, i) => i !== index));
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
        <Text type="secondary">填写或修改酒店信息，支持自定义维度以提升用户出行体验。保存后数据将实时更新到端侧。</Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            star: 3,
            images: [],
            promotions: [{ text: '' }],
            services: [{ text: '' }],
            customDimensions: [{ name: '', value: '' }],
            roomTypes: [{ name: '', price: undefined }],
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
            rules={[{ required: true, message: '请选择开业时间' }]}
          >
            <DatePicker picker="month" format="YYYY-MM" style={{ width: '100%' }} placeholder="选择年月" locale={locale.DatePicker} />
          </Form.Item>

          <Title level={5} style={{ marginTop: 24 }}>可选维度</Title>
          <Form.Item label="酒店图片" name="images">
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.images !== curr.images}>
              {() => {
                const images = form.getFieldValue('images') || [];
                const fileList = images.map((url, i) => ({
                  uid: `img-${i}`,
                  url,
                  name: `图片${i + 1}.png`,
                  status: 'done',
                }));
                return (
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    accept="image/*"
                    beforeUpload={beforeUpload}
                    onRemove={(file) => {
                      const idx = fileList.findIndex((f) => f.uid === file.uid);
                      if (idx >= 0) removeImage(idx);
                    }}
                    showUploadList={{ showPreviewIcon: false }}
                  >
                    {fileList.length >= MAX_IMAGE_COUNT ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传</div>
                      </div>
                    )}
                  </Upload>
                );
              }}
            </Form.Item>
          </Form.Item>
          <Form.Item
            label="酒店附近的热门景点、交通及商场"
            name="nearbyInfo"
          >
            <TextArea rows={3} placeholder="附近景点、地铁/公交、商场等" />
          </Form.Item>
          <Form.Item label="酒店服务">
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              如：免费停车、免费WiFi、免费早餐等
            </Text>
            <Form.List name="services">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'text']} style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
                        <AutoComplete
                          options={SERVICE_OPTIONS}
                          placeholder="选择或输入服务项目"
                          filterOption={(inputValue, option) =>
                            option.value.toLowerCase().indexOf((inputValue || '').toLowerCase()) !== -1
                          }
                        />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => (fields.length > 1 ? remove(name) : null)}
                        style={{ color: fields.length > 1 ? '#ff4d4f' : '#d9d9d9', fontSize: 18 }}
                      />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ text: '' })} icon={<PlusOutlined />}>
                    添加服务
                  </Button>
                </>
              )}
            </Form.List>
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

          <Title level={5} style={{ marginTop: 16 }}>房型与价格</Title>
          <Form.List name="roomTypes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'name']} style={{ marginBottom: 0, minWidth: 160 }} rules={[{ required: false }]}>
                      <AutoComplete
                        options={ROOM_TYPE_OPTIONS}
                        placeholder="选择或输入房型"
                        filterOption={(inputValue, option) =>
                          option.value.toLowerCase().indexOf((inputValue || '').toLowerCase()) !== -1
                        }
                      />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'price']} style={{ marginBottom: 0, flex: 1, minWidth: 180 }} rules={[{ required: false }]}>
                      <InputNumber min={0} placeholder="价格（元/晚）" style={{ width: '100%' }} />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => (fields.length > 1 ? remove(name) : null)}
                      style={{ color: fields.length > 1 ? '#ff4d4f' : '#d9d9d9', fontSize: 18 }}
                    />
                  </Space>
                ))}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="dashed" onClick={() => add({ name: '', price: undefined })} block icon={<PlusOutlined />}>
                    添加房型
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

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

          <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
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
