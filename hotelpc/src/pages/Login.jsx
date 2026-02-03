import { Button, Checkbox, Form, Input } from 'antd';
import './CSS/Login.css'; // 引入样式文件
import Img from '../assets/loginclear.png';
const onFinish = values => {
  console.log('Success:', values);
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};

function Login() {
  return (
    <div className="background">
      {/* 仅新增这一层容器，绑定样式类，其余代码完全不变 */}
      <div className='login-box'>
        <div className='clear-img'>
          
        </div>
        <div className="login-form-wrapper">
          <div className='login-head'>
          <h2>易宿酒店预订平台</h2>
          <h2>酒店管理系统</h2>
          </div>
          
          <div >
            <div>
            <Form
            name="basic"
            size="large"
            style={{ maxwidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
            className='form-font'
              label="账号"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              className='form-font'
              label="密码"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" label={null}>
              <Checkbox>记住我</Checkbox>
            </Form.Item>

            <Form.Item label={null}>
              <Button type="primary" size='large' htmlType="submit">
                登录
              </Button>
            </Form.Item>
          </Form>
            <span >注册</span>
            </div>

          </div>

        </div></div>

    </div>
  )
}

export default Login;