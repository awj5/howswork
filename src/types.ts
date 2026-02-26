export type UserType = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type CompanyType = {
  id: number;
  name: string;
  slug: string;
  timezone: string;
};

export type CheckInStatType = {
  title: string;
  primary: number;
  secondary: number;
  primaryText?: string;
};

export type CheckInIssueAttributionType = {
  id: number;
  count: number;
};

export type CheckInIssueType = {
  id: number;
  count: number;
  attributions: CheckInIssueAttributionType[];
};

export type CheckInType = {
  id: number;
  start: string;
  repeat: number;
  status: number;
  pin?: number;
  contact_count?: number;
  stats?: CheckInStatType[];
  issues?: CheckInIssueType[];
};

export type ConcernActivityType = {
  created_at: string;
  status?: number | string;
  comment?: string;
  author?: string;
  admin_name?: string;
};

export type ConcernType = {
  id: number;
  created_at: string;
  tracking: string;
  issues: number[];
  details?: string;
  activity?: ConcernActivityType[];
  status?: number;
};

export type RiskType = {
  id?: number;
  concern_id?: number;
  concern_tracking?: string;
  check_in_id?: number;
  check_in_date?: string;
  date_raised: string;
  date_reviewed?: string;
  issues?: number[];
  description: string;
  ai_description?: boolean;
  level: number;
  status: number;
  owner?: string;
  response?: string;
  ai_response?: boolean;
  date_resolved?: string;
};

export type RiskSummaryType = Pick<RiskType, "id" | "status" | "date_raised" | "date_reviewed" | "date_resolved">;

export type DashboardStatType = {
  title: string;
  primary: number;
  secondary?: string;
  secondaryText: string;
};
