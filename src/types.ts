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
  percentage?: boolean;
  sentiment?: boolean;
};

export type CheckInIssueType = {
  id: number;
  count: number;
};

export type CheckInType = {
  id: number;
  start: string;
  repeat: number;
  status: number;
  pin?: number;
  stats?: CheckInStatType[];
  issues?: CheckInIssueType[];
};

export type ConcernActivityType = {
  created_at: string;
  status?: number;
  comment?: string;
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
