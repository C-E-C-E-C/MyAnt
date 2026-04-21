import {
  DatabaseOutlined,
  IdcardOutlined,
  MessageOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Spin, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchResourceList } from "../api/resource";
import { resourceConfigs } from "../config/resources";
import { useAuth } from "../context/AuthContext";

type DashboardStat = {
  key: string;
  title: string;
  apiPath: string;
  icon: React.ReactNode;
  note: string;
};

const STATS: DashboardStat[] = [
  {
    key: "users",
    title: "系统用户",
    apiPath: "/api/system/users",
    icon: <IdcardOutlined />,
    note: "登录与权限主体",
  },
  {
    key: "media",
    title: "内容条目",
    apiPath: "/api/content/media",
    icon: <PlayCircleOutlined />,
    note: "影视内容资源",
  },
  {
    key: "banners",
    title: "轮播图",
    apiPath: "/api/home/banners",
    icon: <DatabaseOutlined />,
    note: "首页运营位",
  },
  {
    key: "messages",
    title: "消息通知",
    apiPath: "/api/social/messages",
    icon: <MessageOutlined />,
    note: "站内消息与提醒",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { session, user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!session) {
        return;
      }

      setLoading(true);
      try {
        const responses = await Promise.all(
          STATS.map(async (stat) => {
            const list = await fetchResourceList<Record<string, unknown>>(
              stat.apiPath,
              session,
            );
            return [stat.key, list.length] as const;
          }),
        );

        if (!cancelled) {
          setCounts(Object.fromEntries(responses));
        }
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : "仪表盘加载失败",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const resourceCards = useMemo(
    () => [
      resourceConfigs["app-media"],
      resourceConfigs["app-category"],
      resourceConfigs["app-banner"],
      resourceConfigs["sys-user"],
    ],
    [],
  );

  return (
    <div className="admin-page">
      <div className="admin-page-card">
        <div className="page-header">
          <h1 className="page-title">仪表盘</h1>
        </div>

        <div className="page-body">
          <div style={{ marginTop: 20 }}>
            <Spin spinning={loading}>
              <div className="stats-grid">
                {STATS.map((stat) => (
                  <div className="stats-card" key={stat.key}>
                    <div className="stats-label">{stat.title}</div>
                    <div className="stats-value">{counts[stat.key] ?? 0}</div>
                    <div className="stats-tip">{stat.note}</div>
                  </div>
                ))}
              </div>
            </Spin>
          </div>

          <Row gutter={16} style={{ marginTop: 20 }}>
            {resourceCards.map((resource) => (
              <Col xs={24} md={12} xl={6} key={resource.key}>
                <Card
                  title={resource.title}
                  extra={
                    <a onClick={() => navigate(`/${resource.key}`)}>进入</a>
                  }
                  bordered={false}
                  style={{ borderRadius: 18 }}
                >
                  <Typography.Paragraph
                    style={{ marginBottom: 0, color: "#64748b" }}
                  >
                    {resource.description}
                  </Typography.Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}
