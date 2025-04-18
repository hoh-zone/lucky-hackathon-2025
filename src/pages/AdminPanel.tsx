import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Board, ItemInfo } from "../types";
import {
  getBoards,
  createBoard,
  addItem,
  publishBoard,
} from "../services/contract";
import toast from "react-hot-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { PlusIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";

const AdminPanel = () => {
  const currentAccount = useCurrentAccount();
  const [newBoard, setNewBoard] = useState({
    name: "",
    endAt: "",
    confirmThreshold: 0,
    num: 0,
  });
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [newItem, setNewItem] = useState<ItemInfo>({
    name: "",
    desc: "",
    url: "",
  });

  const { data: boards, refetch } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const createBoardMutation = useMutation({
    mutationFn: async (data: typeof newBoard) => {
      const endAt = new Date(data.endAt).getTime();
      return createBoard(endAt, data.confirmThreshold, data.num);
    },
    onSuccess: () => {
      toast.success("抽奖创建成功！");
      setNewBoard({ name: "", endAt: "", confirmThreshold: 0, num: 0 });
      refetch();
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: { boardId: string; item: ItemInfo }) => {
      return addItem(
        data.boardId,
        data.item.name,
        data.item.desc,
        data.item.url,
      );
    },
    onSuccess: () => {
      toast.success("奖品添加成功！");
      setNewItem({ name: "", desc: "", url: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(`添加失败: ${error.message}`);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (boardId: string) => {
      return publishBoard(boardId);
    },
    onSuccess: () => {
      toast.success("抽奖发布成功！");
      refetch();
    },
    onError: (error) => {
      toast.error(`发布失败: ${error.message}`);
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold mr-auto">Admin Dashboard</h1>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Admin Cap Connected
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium mb-2">Manage Draws</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium mb-2">Create Draw</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium mb-2">Settings</h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Lucky Draw Boards</h2>
            <p className="text-gray-600">
              管理你的抽奖活动，添加奖品并确认结果。
            </p>
          </div>
          <button className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>New Draw</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">
                  Time
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">
                  Items
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">
                  Publish Status
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">
                  Confirmations
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {boards?.length ? (
                boards.map((board, index) => (
                  <tr key={board.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="font-medium">
                        {board.name || `Tech Gadgets Giveaway ${index + 1}`}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {new Date(board.endAt).toLocaleString() ||
                        "2d 23h remaining"}
                    </td>
                    <td className="py-4 px-4">{board.items?.length || 3}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {board.publish ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {board.confirmThreshold
                        ? `${board.confirmCount || 2}/${board.confirmThreshold}`
                        : "2/3"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          board.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {board.status || "Active"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <DotsHorizontalIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 px-4 text-center" colSpan={7}>
                    <div className="text-gray-500">暂无抽奖活动</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">创建新抽奖</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createBoardMutation.mutate(newBoard);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                抽奖名称
              </label>
              <input
                type="text"
                value={newBoard.name}
                onChange={(e) =>
                  setNewBoard({ ...newBoard, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                结束时间
              </label>
              <input
                type="datetime-local"
                value={newBoard.endAt}
                onChange={(e) =>
                  setNewBoard({ ...newBoard, endAt: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                确认阈值
              </label>
              <input
                type="number"
                value={newBoard.confirmThreshold}
                onChange={(e) =>
                  setNewBoard({
                    ...newBoard,
                    confirmThreshold: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                中奖人数
              </label>
              <input
                type="number"
                value={newBoard.num}
                onChange={(e) =>
                  setNewBoard({ ...newBoard, num: parseInt(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              创建抽奖
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">添加奖品</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedBoard) {
                addItemMutation.mutate({
                  boardId: selectedBoard.id,
                  item: newItem,
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                选择抽奖
              </label>
              <select
                value={selectedBoard?.id || ""}
                onChange={(e) =>
                  setSelectedBoard(
                    boards?.find((b) => b.id === e.target.value) || null,
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">请选择抽奖</option>
                {boards?.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name || `抽奖 #${board.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                奖品名称
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                奖品描述
              </label>
              <textarea
                value={newItem.desc}
                onChange={(e) =>
                  setNewItem({ ...newItem, desc: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                奖品链接
              </label>
              <input
                type="url"
                value={newItem.url}
                onChange={(e) =>
                  setNewItem({ ...newItem, url: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!selectedBoard}
              className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              添加奖品
            </button>
          </form>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 mt-8">
        Admin Panel • Built on Sui Blockchain
      </footer>
    </div>
  );
};

export default AdminPanel;
