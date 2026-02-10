import rawCompanies from '../data/companyNames.json';

export type Company = {
  id: string;
  name: string;
  difficulty: number;
  multipliers: {
    xp: number;
    money: number;
  };
};

export const companies: Company[] = rawCompanies as Company[];

