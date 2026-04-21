import { Button, Card, Form, Input, Space, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { fetchCaptcha } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [form] = Form.useForm();
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/dashboard";
  }, [location.state]);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const captcha = await fetchCaptcha();
      setCaptchaId(captcha.captchaId);
      setCaptchaImage(captcha.imageBase64);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "验证码加载失败");
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    try {
      const response = await signIn({
        account: values.account.trim(),
        password: values.password,
        captchaId,
        captchaCode: values.captchaCode.trim(),
      });

      if (response.user.userType !== 2) {
        message.warning("当前账号不是管理员，部分管理功能可能受限");
      } else {
        message.success("登录成功");
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "登录失败");
      void loadCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-panel">
        <section className="admin-login-hero">
          <div style={{}}>
            <div className="hero-kicker">MyAnt Admin Console</div>
            <h1 className="hero-title">My_Aant管理后台</h1>
          </div>
        </section>

        <section className="login-form-wrap">
          <div className="login-form-card">
            <h2 className="login-form-title">后台登录</h2>
            <p className="login-form-subtitle">
              使用你后端的账号、密码和验证码登录。
            </p>

            <Card
              bordered={false}
              style={{ background: "transparent", boxShadow: "none" }}
            >
              <Form form={form} layout="vertical" requiredMark={false}>
                <Form.Item
                  label="账号"
                  name="account"
                  rules={[{ required: true, message: "请输入账号" }]}
                >
                  <Input size="large" placeholder="手机号 / 邮箱 / 用户名" />
                </Form.Item>

                <Form.Item
                  label="密码"
                  name="password"
                  rules={[{ required: true, message: "请输入密码" }]}
                >
                  <Input.Password size="large" placeholder="请输入密码" />
                </Form.Item>

                <Form.Item
                  label="验证码"
                  name="captchaCode"
                  rules={[{ required: true, message: "请输入验证码" }]}
                >
                  <Space align="start" style={{ width: "100%" }}>
                    <Input
                      size="large"
                      placeholder="请输入验证码"
                      style={{ flex: 1 }}
                    />
                    <Button
                      style={{ height: 40, padding: 0, width: 136 }}
                      onClick={() => void loadCaptcha()}
                      loading={captchaLoading}
                    >
                      {captchaImage ? (
                        <img
                          className="captcha-preview"
                          src={captchaImage}
                          alt="验证码"
                        />
                      ) : (
                        "刷新验证码"
                      )}
                    </Button>
                  </Space>
                </Form.Item>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={() => void handleSubmit()}
                >
                  登录管理后台
                </Button>
              </Form>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
