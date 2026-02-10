// Login.js 完整修改版
import { Button, Checkbox, Form, Input, Typography } from 'antd';
import './CSS/Login.css';
import Img from '../assets/loginclear.png';
import { useNavigate, Outlet } from 'react-router-dom';
import { useState, useMemo } from 'react'; // 新增 useMemo
const { Title, Text } = Typography;


const onFinish = values => {
  console.log('Success:', values);
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};

function Login() {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(true);

  // 定义返回登录的回调函数，通过 context 传给子组件
  const goBackToLogin = useMemo(() => () => {
    setShowLoginForm(true); // 显示登录表单
    navigate('/', { replace: true }); // 更新路由但不刷新页面
  }, [navigate]);

  // 提供上下文给 Outlet 中的子组件
  const outletContext = useMemo(() => ({
    goBackToLogin
  }), [goBackToLogin]);

  return (
    <div className="background">
      <div className='login-box'>
        <div className='clear-img'></div>

        {/* 登录表单 */}
        <div className={showLoginForm ? "login-form-wrapper" : "hidden"} >
          <div >
          <Title level={1} style={{ marginBottom: 8 }}>易宿酒店预订平台</Title>
          <Title level={2} style={{ marginBottom: 32, fontWeight: 'normal' }}>酒店管理系统 - 登录</Title>
          </div>

          <Form
            name="basic"
            size="large"
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              className='form-font'
              label="账号"
              name="username"
              rules={[{ required: true, message: '请输入账号!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              className='form-font'
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" label={null}>
              <Checkbox>记住我</Checkbox>
            </Form.Item>

            <Form.Item label={null}>
              <div className='submit'>
                <Button type="primary" size='large' htmlType="submit">
                  登录
                </Button>
                <Button 
                  type="link" 
                  size='large' 
                  onClick={() => {
                    setShowLoginForm(false);
                    navigate('/signup', { replace: true });
                  }}
                >
                  注册
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>

        {/* 注册容器：传递上下文给 Signup 组件 */}
        <div className={!showLoginForm ? "login-form-wrapper" : "hidden"}>
          <Outlet context={outletContext} /> {/* 关键：传递上下文 */}
        </div>
      </div>
    </div>
  );
}

export default Login;