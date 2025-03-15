export interface Researcher {
  id: string;
  name: string;
  researchArea: string;
  institution: string;
  userId: string;
  createdAt: Date;
}

export interface Scholarship {
  id: string;
  name: string;
  totalAmount: number;
  rules: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface ResearcherScholarship {
  id: string;
  researcherId: string;
  scholarshipId: string;
  assignedAt: Date;
}

export interface Expense {
  id: string;
  researcherId: string;
  scholarshipId: string;
  amount: number;
  category: string;
  description: string;
  receiptUrl?: string;
  date: Date;
  createdAt: Date;
}