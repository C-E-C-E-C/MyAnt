import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Progress,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  deleteResource,
  fetchResourceList,
  saveResource,
  updateResource,
} from "../api/resource";
import { createVideoUploadTask, uploadImageFile } from "../api/upload";
import { resourceConfigs } from "../config/resources";
import { useAuth } from "../context/AuthContext";
import type { AuthSession } from "../types/api";
import type {
  FieldOption,
  ResourceConfig,
  ResourceField,
} from "../types/resource";

function isDateLike(field: ResourceField) {
  return field.type === "date" || field.type === "datetime";
}

function buildRelationLabel(
  record: Record<string, unknown>,
  labelFields: string[],
  fallbackValue: unknown,
) {
  const parts = labelFields
    .map((fieldName) => String(record[fieldName] ?? "").trim())
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" / ");
  }

  return String(fallbackValue ?? record.id ?? "-");
}

const VIDEO_EXTENSIONS = ["mp4", "mov", "mkv", "avi", "webm", "m4v", "ts"];

function getFileExtension(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index + 1).toLowerCase() : "";
}

function isSupportedVideoFile(file: File) {
  const extension = getFileExtension(file.name);
  return file.type.startsWith("video/") || VIDEO_EXTENSIONS.includes(extension);
}

function formatValue(field: ResourceField, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (field.type === "image") {
    const imageUrl = String(value);
    return (
      <a href={imageUrl} target="_blank" rel="noreferrer">
        查看图片
      </a>
    );
  }

  if (field.type === "video") {
    const videoUrl = String(value);
    return (
      <a href={videoUrl} target="_blank" rel="noreferrer">
        播放视频
      </a>
    );
  }

  if (field.type === "switch") {
    return Number(value) === 1 ? <Tag color="green">是</Tag> : <Tag>否</Tag>;
  }

  if (field.options?.length) {
    const option = field.options.find((item) => item.value === value);
    if (option) {
      return option.label;
    }
  }

  if (isDateLike(field)) {
    const dateValue = dayjs(String(value));
    return dateValue.isValid()
      ? dateValue.format(
          field.type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss",
        )
      : String(value);
  }

  return String(value);
}

function ResourceUploadField({
  field,
  session,
  value,
  onChange,
}: {
  field: ResourceField;
  session?: AuthSession | null;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [cancelAvailable, setCancelAvailable] = useState(false);
  const uploadCancelRef = useRef<(() => void) | null>(null);
  const isVideo = field.type === "video";
  const accept = isVideo ? "video/*" : "image/*";
  const uploadLabel = isVideo ? "上传视频" : "上传图片";

  const currentPreviewUrl = value?.trim() ?? "";

  const handleUpload = async (file: File) => {
    if (isVideo && !isSupportedVideoFile(file)) {
      throw new Error(
        `视频格式不支持，请上传 ${VIDEO_EXTENSIONS.join("、")} 文件`,
      );
    }

    setUploadFileName(file.name);
    setUploadProgress(0);
    setUploading(true);
    setCancelAvailable(false);
    uploadCancelRef.current = null;
    try {
      const uploadedUrl = isVideo
        ? await (async () => {
            const task = await createVideoUploadTask(
              file,
              session,
              setUploadProgress,
            );
            uploadCancelRef.current = task.cancel;
            setCancelAvailable(true);
            return task.promise;
          })()
        : await uploadImageFile(file, session, setUploadProgress);
      setUploadProgress(100);
      onChange?.(uploadedUrl);
      message.success("上传成功");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "上传失败";
      if (errorMessage === "上传已取消") {
        message.info(errorMessage);
      } else {
        message.error(errorMessage);
      }
      throw error;
    } finally {
      uploadCancelRef.current = null;
      setCancelAvailable(false);
      window.setTimeout(() => {
        setUploadProgress(0);
        setUploadFileName("");
      }, 1200);
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={field.placeholder ?? `请选择或上传${field.label}`}
        />
        <Upload
          maxCount={1}
          accept={accept}
          showUploadList={false}
          beforeUpload={async (file) => {
            try {
              await handleUpload(file);
            } catch (error) {
              if (!(error instanceof Error && error.message === "上传已取消")) {
                message.error(
                  error instanceof Error ? error.message : "上传失败",
                );
              }
            }
            return false;
          }}
          disabled={uploading}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploadLabel}
          </Button>
        </Upload>
        {isVideo ? (
          <Tooltip title={uploading ? "取消当前上传任务" : "暂无上传任务"}>
            <Button
              danger
              disabled={!cancelAvailable}
              onClick={() => {
                uploadCancelRef.current?.();
              }}
            >
              取消
            </Button>
          </Tooltip>
        ) : null}
      </Space.Compact>
      {isVideo ? (
        <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>
          支持 {VIDEO_EXTENSIONS.join(" / ")}，上传后会自动回填播放地址。
        </div>
      ) : null}
      {uploading ? (
        <div style={{ display: "grid", gap: 6 }}>
          <Progress percent={Math.round(uploadProgress)} status="active" />
          <div style={{ color: "#64748b", fontSize: 12 }}>
            {uploadFileName ? `正在上传：${uploadFileName}` : "正在上传文件..."}
          </div>
        </div>
      ) : null}
      {value ? (
        isVideo ? (
          <div style={{ display: "grid", gap: 8 }}>
            <video
              controls
              src={currentPreviewUrl}
              style={{
                width: "100%",
                maxHeight: 240,
                borderRadius: 12,
                background: "#000",
              }}
            />
            <a href={currentPreviewUrl} target="_blank" rel="noreferrer">
              点击在新窗口打开视频
            </a>
          </div>
        ) : (
          <a href={value} target="_blank" rel="noreferrer">
            <img
              alt={field.label}
              src={value}
              style={{
                maxWidth: 180,
                maxHeight: 120,
                borderRadius: 10,
                objectFit: "cover",
                border: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            />
          </a>
        )
      ) : null}
    </div>
  );
}

function buildInitialValues(
  config: ResourceConfig,
  record: Record<string, unknown>,
) {
  const initialValues: Record<string, unknown> = {};

  for (const field of config.fields) {
    if (field.form === false) {
      continue;
    }

    const value = record[field.name];
    if (value === undefined || value === null) {
      initialValues[field.name] = field.type === "switch" ? false : undefined;
      continue;
    }

    if (field.type === "switch") {
      initialValues[field.name] = Number(value) === 1;
      continue;
    }

    if (isDateLike(field)) {
      const dateValue = dayjs(String(value));
      initialValues[field.name] = dateValue.isValid() ? dateValue : undefined;
      continue;
    }

    initialValues[field.name] = value;
  }

  return initialValues;
}

function buildPayload(
  config: ResourceConfig,
  values: Record<string, unknown>,
  editing: Record<string, unknown> | null,
) {
  let payload: Record<string, unknown> = { ...values };

  if (editing?.id !== undefined && editing?.id !== null) {
    payload.id = editing.id;
  }

  for (const field of config.fields) {
    const submitName = field.submitAs ?? field.name;
    const value = payload[field.name];

    if (field.form === false) {
      if (field.name !== "id") {
        delete payload[field.name];
      }
      continue;
    }

    if (value === undefined || value === null || value === "") {
      delete payload[field.name];
      if (submitName !== field.name) {
        delete payload[submitName];
      }
      continue;
    }

    if (field.type === "switch") {
      payload[submitName] = value ? 1 : 0;
      if (submitName !== field.name) {
        delete payload[field.name];
      }
      continue;
    }

    if (field.type === "number") {
      payload[submitName] = Number(value);
      if (submitName !== field.name) {
        delete payload[field.name];
      }
      continue;
    }

    if (isDateLike(field)) {
      payload[submitName] = dayjs.isDayjs(value)
        ? field.type === "date"
          ? value.format("YYYY-MM-DD")
          : value.format("YYYY-MM-DDTHH:mm:ss")
        : value;
      if (submitName !== field.name) {
        delete payload[field.name];
      }
      continue;
    }

    payload[submitName] = value;
    if (submitName !== field.name) {
      delete payload[field.name];
    }
  }

  return config.beforeSubmit
    ? (config.beforeSubmit(payload, editing) ?? payload)
    : payload;
}

function buildColumns(
  fields: ResourceField[],
): ColumnsType<Record<string, unknown>> {
  return fields
    .filter((field) => field.list !== false)
    .map((field) => ({
      title: field.label,
      dataIndex: field.name,
      width: field.width,
      ellipsis: true,
      render: (value: unknown, record: Record<string, unknown>) =>
        field.render ? field.render(value, record) : formatValue(field, value),
    }));
}

function renderFieldControl(
  field: ResourceField,
  session?: AuthSession | null,
) {
  if (field.type === "image" || field.type === "video") {
    return <ResourceUploadField field={field} session={session} />;
  }

  if (field.type === "select") {
    return (
      <Select
        placeholder={field.placeholder ?? `请选择${field.label}`}
        options={field.options}
        allowClear
        showSearch
        optionFilterProp="label"
      />
    );
  }

  if (field.type === "number") {
    return (
      <InputNumber
        style={{ width: "100%" }}
        placeholder={field.placeholder ?? `请输入${field.label}`}
      />
    );
  }

  if (field.type === "switch") {
    return <Switch />;
  }

  if (field.type === "textarea") {
    return (
      <Input.TextArea
        rows={4}
        placeholder={field.placeholder ?? `请输入${field.label}`}
      />
    );
  }

  if (field.type === "date") {
    return <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />;
  }

  if (field.type === "datetime") {
    return (
      <DatePicker
        showTime
        style={{ width: "100%" }}
        format="YYYY-MM-DD HH:mm:ss"
      />
    );
  }

  if (field.type === "password") {
    return (
      <Input.Password
        placeholder={field.placeholder ?? `请输入${field.label}`}
      />
    );
  }

  return <Input placeholder={field.placeholder ?? `请输入${field.label}`} />;
}

export default function ResourcePage() {
  const { resourceKey } = useParams();
  const config = resourceKey ? resourceConfigs[resourceKey] : undefined;
  const { session } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [keyword, setKeyword] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [submitError, setSubmitError] = useState("");
  const [relationOptions, setRelationOptions] = useState<
    Record<string, FieldOption[]>
  >({});

  const loadRows = async () => {
    if (!config) {
      return;
    }

    setLoading(true);
    try {
      const list = await fetchResourceList<Record<string, unknown>>(
        config.apiPath,
        session,
      );
      setRows(list);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "列表加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.apiPath]);

  useEffect(() => {
    let active = true;

    async function loadRelationOptions() {
      if (!config) {
        return;
      }

      const relationFields = config.fields.filter((field) => field.relation);
      if (!relationFields.length) {
        setRelationOptions({});
        return;
      }

      try {
        const entries = await Promise.all(
          relationFields.map(async (field) => {
            const relation = field.relation;
            if (!relation) {
              return [field.name, []] as const;
            }

            const relatedConfig = resourceConfigs[relation.resourceKey];
            if (!relatedConfig) {
              return [field.name, []] as const;
            }

            const list = await fetchResourceList<Record<string, unknown>>(
              relatedConfig.apiPath,
              session,
            );

            const valueField = relation.valueField ?? "id";
            const options = list
              .map((item) => ({
                value: item[valueField] as string | number,
                label: buildRelationLabel(
                  item,
                  relation.labelFields,
                  item[valueField],
                ),
              }))
              .filter(
                (item) => item.value !== undefined && item.value !== null,
              );

            return [field.name, options] as const;
          }),
        );

        if (active) {
          setRelationOptions(Object.fromEntries(entries));
        }
      } catch (error) {
        if (active) {
          message.error(
            error instanceof Error ? error.message : "关联选项加载失败",
          );
        }
      }
    }

    void loadRelationOptions();

    return () => {
      active = false;
    };
  }, [config, session]);

  const resolvedFields = useMemo(() => {
    if (!config) {
      return [] as ResourceField[];
    }

    return config.fields.map((field) => {
      if (!field.relation) {
        return field;
      }

      return {
        ...field,
        type: field.type ?? "select",
        options: relationOptions[field.name] ?? [],
      };
    });
  }, [config, relationOptions]);

  const filteredRows = useMemo(() => {
    if (!keyword.trim()) {
      return rows;
    }

    const lowerKeyword = keyword.trim().toLowerCase();
    return rows.filter((row) =>
      config?.searchableFields.some((fieldName) =>
        String(row[fieldName] ?? "")
          .toLowerCase()
          .includes(lowerKeyword),
      ),
    );
  }, [config?.searchableFields, keyword, rows]);

  if (!config) {
    return (
      <div className="admin-page">
        <div className="admin-page-card" style={{ padding: 24 }}>
          <Empty description="未找到这个管理模块" />
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setEditingRow(null);
    setSubmitError("");
    form.resetFields();
    setDrawerVisible(true);
  };

  const openEdit = (record: Record<string, unknown>) => {
    setEditingRow(record);
    setSubmitError("");
    form.setFieldsValue(buildInitialValues(config, record));
    setDrawerVisible(true);
  };

  const handleDelete = async (record: Record<string, unknown>) => {
    try {
      await deleteResource(
        config.apiPath,
        record.id as string | number,
        session,
      );
      message.success("删除成功");
      await loadRows();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError("");
      const values = await form.validateFields();
      const payload = buildPayload(config, values, editingRow);
      setSubmitting(true);

      if (editingRow) {
        await updateResource(config.apiPath, payload, session);
        message.success("更新成功");
      } else {
        await saveResource(config.apiPath, payload, session);
        message.success("新增成功");
      }

      setDrawerVisible(false);
      form.resetFields();
      await loadRows();
    } catch (error) {
      if (error instanceof Error && error.message.includes("验证")) {
        return;
      }

      if (
        error instanceof Error &&
        error.message.includes("新建系统用户时必须填写登录密码")
      ) {
        message.error(error.message);
        return;
      }

      if (error instanceof Error && error.message !== "请先填写表单") {
        setSubmitError(error.message);
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-card">
        <div className="page-header">
          <h1 className="page-title">{config.title}</h1>
          <p className="page-description">{config.description}</p>
        </div>

        <div className="page-body">
          <div className="resource-toolbar">
            <Space wrap>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder={`搜索${config.title}`}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                style={{ width: 280 }}
              />
              <Button icon={<ReloadOutlined />} onClick={() => void loadRows()}>
                刷新
              </Button>
            </Space>

            <div className="toolbar-actions">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                新增{config.title}
              </Button>
            </div>
          </div>

          <Spin spinning={loading}>
            <Table
              className="table-card"
              rowKey={(record, index) => String(record.id ?? index)}
              dataSource={filteredRows}
              columns={[
                ...buildColumns(resolvedFields),
                {
                  title: "操作",
                  key: "actions",
                  fixed: "right",
                  width: 160,
                  render: (_: unknown, record: Record<string, unknown>) => (
                    <Space>
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(record)}
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        title={`确认删除这条${config.title}吗？`}
                        description="删除后数据将从列表中移除。"
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => void handleDelete(record)}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
              scroll={{ x: 1600 }}
              pagination={false}
            />
          </Spin>
        </div>
      </div>

      <Drawer
        title={editingRow ? `编辑${config.title}` : `新增${config.title}`}
        open={drawerVisible}
        width={820}
        onClose={() => setDrawerVisible(false)}
        destroyOnClose
        extra={
          <Button
            type="primary"
            loading={submitting}
            onClick={() => void handleSubmit()}
          >
            保存
          </Button>
        }
      >
        {submitError ? (
          <Alert
            type="error"
            showIcon
            message="提交失败"
            description={submitError}
            style={{ marginBottom: 16 }}
          />
        ) : null}
        <Form form={form} layout="vertical" requiredMark={false}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            {config.fields
              .filter((field) => field.form !== false)
              .map((field) => {
                const span = field.span ?? 1;
                const resolvedField =
                  resolvedFields.find((item) => item.name === field.name) ??
                  field;
                return (
                  <div
                    key={field.name}
                    style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}
                  >
                    <Form.Item
                      name={field.name}
                      label={field.label}
                      valuePropName={
                        field.type === "switch" ? "checked" : undefined
                      }
                      rules={
                        field.required
                          ? [
                              {
                                required: true,
                                message: `请输入${field.label}`,
                              },
                            ]
                          : undefined
                      }
                    >
                      {renderFieldControl(resolvedField, session)}
                    </Form.Item>
                  </div>
                );
              })}
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
