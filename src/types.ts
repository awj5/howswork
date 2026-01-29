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

export type CheckInType = {
  id: number;
  start: string;
  repeat: number;
  status: string;
  pin?: number;
};

export type ConcernActivityType = {
  created_at: string;
  status?: number;
  comment?: string;
  admin?: boolean;
};

export type ConcernType = {
  id: number;
  created_at: string;
  tracking: string;
  details?: string;
  issues?: number[];
  activity?: ConcernActivityType[];
  status?: number;
};
