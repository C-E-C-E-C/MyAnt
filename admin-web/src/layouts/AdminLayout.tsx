import {
  AppstoreOutlined,
  CommentOutlined,
  DashboardOutlined,
  HistoryOutlined,
  LinkOutlined,
  LogoutOutlined,
  MessageOutlined,
  PictureOutlined,
  SafetyOutlined,
  ShareAltOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Avatar,
  Breadcrumb,
  Button,
  Layout,
  Menu,
  Tag,
  Typography,
  message,
} from "antd";
import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { menuGroups, resourceConfigs } from "../config/resources";
import { useAuth } from "../context/AuthContext";

const { Sider, Header, Content } = Layout;

const iconMap = {
  dashboard: <DashboardOutlined />,
  user: <UserOutlined />,
  team: <TeamOutlined />,
  safety: <SafetyOutlined />,
  link: <LinkOutlined />,
  picture: <PictureOutlined />,
  appstore: <AppstoreOutlined />,
  video: <VideoCameraOutlined />,
  comment: <CommentOutlined />,
  star: <StarOutlined />,
  share: <ShareAltOutlined />,
  history: <HistoryOutlined />,
  message: <MessageOutlined />,
} as const;

function getBreadcrumbItems(pathname: string) {
  if (pathname === "/" || pathname === "") {
    return [{ title: "总览" }, { title: "仪表盘" }];
  }

  if (pathname === "/dashboard") {
    return [{ title: "总览" }, { title: "仪表盘" }];
  }

  const resourceKey = pathname.replace(/^\//, "").split("/")[0];
  const matchedGroup = menuGroups.find((group) =>
    group.items.some((item) => item.key === resourceKey),
  );
  const matchedItem = matchedGroup?.items.find(
    (item) => item.key === resourceKey,
  );

  if (matchedGroup && matchedItem) {
    return [{ title: matchedGroup.title }, { title: matchedItem.label }];
  }

  return [
    { title: "总览" },
    {
      title: resourceConfigs[resourceKey]?.title ?? resourceKey ?? "当前页面",
    },
  ];
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const menuItems = useMemo<MenuProps["items"]>(() => {
    return menuGroups.map((group) => ({
      type: "group" as const,
      label: group.title,
      children: group.items.map((item) => ({
        key: item.key,
        icon: iconMap[item.icon as keyof typeof iconMap] ?? (
          <AppstoreOutlined />
        ),
        label: item.label,
      })),
    }));
  }, []);

  const selectedKey =
    location.pathname === "/dashboard"
      ? ["dashboard"]
      : [location.pathname.slice(1)];

  const breadcrumbItems = useMemo(
    () => getBreadcrumbItems(location.pathname),
    [location.pathname],
  );

  const handleMenuClick: MenuProps["onClick"] = (event) => {
    if (event.key === "dashboard") {
      navigate("/dashboard");
      return;
    }

    navigate(`/${event.key}`);
  };

  const handleLogout = async () => {
    await signOut();
    message.success("已退出登录");
    navigate("/login", { replace: true });
  };

  return (
    <Layout className="admin-shell">
      <Sider
        className="admin-sider"
        width={280}
        breakpoint="lg"
        collapsedWidth={76}
      >
        <div className="admin-logo">
          <div className="admin-logo-badge">M</div>
          <div>
            <div className="admin-logo-title">MyAnt 管理后台</div>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKey}
          onClick={handleMenuClick}
          style={{ background: "transparent", borderInlineEnd: 0 }}
        />
      </Sider>

      <Layout className="admin-main">
        <Header className="admin-header">
          <div className="admin-header-left">
            <Breadcrumb className="admin-breadcrumb" items={breadcrumbItems} />
            <div className="admin-user-panel">
              <Avatar icon={<UserOutlined />} />
              <div className="admin-user-meta">
                <Typography.Text className="admin-user-name" strong>
                  {user?.nickname ?? user?.username ?? "管理员"}
                </Typography.Text>
                <div className="admin-user-email">
                  {user?.email ?? user?.phone ?? "后台登录中"}
                </div>
              </div>
              <Tag
                className="admin-user-role"
                color={isAdmin ? "green" : "gold"}
              >
                {isAdmin ? "管理员" : "普通用户"}
              </Tag>
            </div>
          </div>

          <Button
            className="admin-logout-button"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </Header>

        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
