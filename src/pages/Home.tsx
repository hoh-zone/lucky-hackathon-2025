import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Board } from "../types";
import { getBoards } from "../services/contract";
import { useCurrentAccount } from "@mysten/dapp-kit";

const Home = () => {
  const currentAccount = useCurrentAccount();
  const isAdmin = currentAccount?.address === "0x123..."; // 替换为实际的管理员地址

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">加载失败，请刷新页面重试</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">抽奖活动</h1>
        {isAdmin && (
          <Link
            to="/admin"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            管理面板
          </Link>
        )}
      </div>

      {boards?.length === 0 ? (
        <div className="text-center text-gray-500">暂无抽奖活动</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards?.map((board) => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">抽奖 #{board.id}</h2>
              <div className="text-gray-600">
                <p>奖品数量: {board.items.length}</p>
                <p>中奖人数: {board.num}</p>
                <p>结束时间: {new Date(board.endAt).toLocaleString()}</p>
                <p>状态: {board.publish ? "已发布" : "未发布"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
