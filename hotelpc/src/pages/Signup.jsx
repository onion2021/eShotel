// Signup.js 完整修改版
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom'; // 新增：引入上下文钩子

const { Title, Text } = Typography;

const Signup = () => {
  // 从父组件获取回调函数
  const { goBackToLogin } = useOutletContext();

  const onFinish = (values) => {
    console.log('注册信息:', values);
    // 调用注册接口，处理成功/失败
  };

  return (
    <div >
      <div className="left-bg" />
      <Title level={1} style={{ marginBottom: 8 }}>易宿酒店预订平台</Title>
      <Title level={2} style={{ marginBottom: 32, fontWeight: 'normal' }}>酒店管理系统 - 注册</Title>
      <div style={{marginTop: '1vh'}}>

        
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            label="账号/手机号"
            rules={[
              { required: true, message: '请输入账号或手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码长度不能少于8位' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="8-20位，包含字母+数字" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { required: true, message: '请同意用户协议' }
            ]}
          >
            <Checkbox>
              我已阅读并同意 <a href="/agreement" target="_blank">《用户协议》</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册
            </Button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text>已有账号？</Text>
              {/* 关键修改：替换a标签为点击事件，调用父组件的回调 */}
              <Text 
                onClick={goBackToLogin} 
                style={{ 
                  marginLeft: 4, 
                  color: '#1890ff', 
                  cursor: 'pointer',
                  textDecoration: 'underline' // 保持链接样式
                }}
              >
                返回登录
              </Text>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Signup;