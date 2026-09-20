 
export type User = {
  id: number;
  name: string;
  email: string;
};

export type LoginForm = {
  setUser: (user: User | null) => void;
};
