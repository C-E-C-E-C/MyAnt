export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "date"
  | "datetime"
  | "password"
  | "url"
  | "image"
  | "video";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface ResourceRelation {
  resourceKey: string;
  labelFields: string[];
  valueField?: string;
}

export interface ResourceField {
  name: string;
  label: string;
  type?: FieldType;
  list?: boolean;
  form?: boolean;
  required?: boolean;
  span?: 1 | 2;
  width?: number;
  placeholder?: string;
  submitAs?: string;
  options?: FieldOption[];
  relation?: ResourceRelation;
  render?: (
    value: unknown,
    record: Record<string, unknown>,
  ) => import("react").ReactNode;
}

export interface ResourceConfig {
  key: string;
  title: string;
  apiPath: string;
  description: string;
  searchableFields: string[];
  fields: ResourceField[];
  beforeSubmit?: (
    payload: Record<string, unknown>,
    editing: Record<string, unknown> | null,
  ) => Record<string, unknown> | void;
}

export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
}

export interface MenuGroupConfig {
  title: string;
  items: MenuItemConfig[];
}
