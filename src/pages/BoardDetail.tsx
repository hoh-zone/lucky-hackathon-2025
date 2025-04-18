import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Board } from "../types";
import { getBoards, confirmBoard } from "../services/contract";
import toast from "react-hot-toast";

const BoardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const currentAccount = useCurrentAccount();

  const { data: boards } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const board = boards?.find((b) => b.id === id);

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("抽奖ID不存在");
      return confirmBoard(id);
    },
    onSuccess: () => {
      toast.success("参与成功！");
    },
    onError: (error) => {
      toast.error(`参与失败: ${error.message}`);
    },
  });

  if (!board) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  const isEnded = Date.now() > board.endAt;
  const hasConfirmed = board.confirmBy.includes(currentAccount?.address || "");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">抽奖 #{board.id}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">基本信息</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">结束时间：</span>
                {new Date(board.endAt).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">确认阈值：</span>
                {board.confirmThreshold}
              </p>
              <p>
                <span className="font-medium">已确认人数：</span>
                {board.confirmBy.length}
              </p>
              <p>
                <span className="font-medium">中奖人数：</span>
                {board.num}
              </p>
              <p>
                <span className="font-medium">状态：</span>
                {board.publish ? "已发布" : "未发布"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">奖品列表</h2>
            <div className="space-y-4">
              {board.items.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm mt-2 inline-block hover:underline"
                    >
                      查看详情
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {board.publish && !isEnded && !hasConfirmed && (
          <div className="mt-8">
            <button
              onClick={() => confirmMutation.mutate()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              参与抽奖
            </button>
          </div>
        )}

        {isEnded && board.lucky.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">中奖名单</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {board.lucky.map((index) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium">{board.items[index].name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {board.items[index].desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
