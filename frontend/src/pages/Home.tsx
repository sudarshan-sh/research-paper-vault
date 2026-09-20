import type { User } from "../types/user.types";

const Home = ({ user }: { user: User | null }) => {
  return (
    <div>
      {user && (
        <p className="text-2xl text-center mt-4">
          <span className="text-zinc-400">Welcome back, {user.name}!</span>
        </p>
      )}
    </div>
  );
};

export default Home;
