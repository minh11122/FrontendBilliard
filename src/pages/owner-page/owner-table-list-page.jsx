import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Search, Filter, Edit2, Trash2, Plus, LayoutGrid,
    Circle, Grid3X3, FilterX, ChevronLeft, ChevronRight
} from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { getTables, deleteTable, getTableTypes } from "@/services/billiardTable.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function OwnerTableListPage() {
    const navigate = useNavigate();

    // State lưu trữ dữ liệu
    const [tables, setTables] = useState([]);
    const [tableTypes, setTableTypes] = useState([]);
    const [statusCounts, setStatusCounts] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
    });
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 5,
    });

    // State bộ lọc
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const CLUB_ID = "65a1234567890abcdef12345";

    // Lấy dữ liệu danh sách Bàn
    const fetchTables = async () => {
        try {
            const params = {
                club_id: CLUB_ID,
                page: pagination.currentPage,
                limit: pagination.limit,
                search: debouncedSearch,
                status: statusFilter === "all" ? "" : statusFilter,
                table_type_id: typeFilter === "all" ? "" : typeFilter,
            };

            const res = await getTables(params);
            if (res.data.success) {
                setTables(res.data.data);
                setPagination(res.data.pagination);
                setStatusCounts(res.data.statusCounts);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách bàn");
        }
    };

    // Lấy danh sách Loại bàn cho Dropdown
    const fetchTableTypes = async () => {
        try {
            const res = await getTableTypes();
            if (res.data.success) {
                setTableTypes(res.data.data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách loại bàn");
        }
    };

    useEffect(() => {
        fetchTables();
    }, [pagination.currentPage, debouncedSearch, statusFilter, typeFilter]);

    useEffect(() => {
        fetchTableTypes();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bàn này không?")) {
            try {
                const res = await deleteTable(id);
                if (res.data.success) {
                    toast.success("Đã xóa bàn thành công");
                    fetchTables();
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi khi xóa bàn");
            }
        }
    };

    const handleResetFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setTypeFilter("all");
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // UI Helpers: Render Giao diện tùy theo Loại bàn
    const renderTableTypeUI = (typeName) => {
        const name = typeName?.toLowerCase() || "";
        if (name.includes("pool")) {
            return {
                icon: <LayoutGrid size={20} />,
                iconBg: "bg-blue-50 text-blue-600",
                badgeBg: "bg-blue-50 text-blue-700"
            };
        }
        if (name.includes("libre")) {
            return {
                icon: <Circle size={20} />,
                iconBg: "bg-orange-50 text-orange-600",
                badgeBg: "bg-orange-50 text-orange-700"
            };
        }
        return {
            icon: <Grid3X3 size={20} />,
            iconBg: "bg-purple-50 text-purple-600",
            badgeBg: "bg-purple-50 text-purple-700"
        };
    };

    // UI Helpers: Render Trạng thái
    const renderStatusUI = (status) => {
        if (status === "Available") {
            return (
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">Sẵn sàng</span>
                </div>
            );
        }
        if (status === "In Use") {
            return (
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Đang sử dụng</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400"></span>
                </span>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">Bảo trì</span>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 w-full max-w-[1440px] mx-auto bg-white min-h-[calc(100vh-80px)]">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                <span className="text-gray-500 cursor-pointer hover:text-primary transition-colors">Trang chủ</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500 cursor-pointer hover:text-primary transition-colors">Quản lý cửa hàng</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">Danh sách bàn</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Danh sách Bàn</h1>
                    <p className="text-gray-500 text-base">Xem, chỉnh sửa và quản lý trạng thái tất cả các bàn bida trong câu lạc bộ.</p>
                </div>
                <Button
                    onClick={() => navigate("/owner/tables/create")}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-5 rounded-lg font-bold shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} /> Thêm bàn mới
                </Button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* Search */}
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            className="w-full pl-10 pr-4 h-10 rounded-lg border-gray-200 bg-gray-50 text-sm focus:border-primary focus:ring-primary shadow-none"
                            placeholder="Tìm kiếm theo tên hoặc số bàn..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Type */}
                    <div className="md:col-span-3">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="h-10 rounded-lg border-gray-200 bg-gray-50 text-sm shadow-none">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={16} className="text-gray-400" />
                                    <SelectValue placeholder="Tất cả loại bàn" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại bàn</SelectItem>
                                {tableTypes.map(type => (
                                    <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filter Status */}
                    <div className="md:col-span-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10 rounded-lg border-gray-200 bg-gray-50 text-sm shadow-none">
                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-gray-400" />
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="Available">Sẵn sàng</SelectItem>
                                <SelectItem value="In Use">Đang sử dụng</SelectItem>
                                <SelectItem value="Maintenance">Bảo trì</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reset Filter Button */}
                    <div className="md:col-span-1 flex justify-end md:justify-start">
                        <Button
                            variant="outline"
                            className="w-full md:w-auto h-10 px-3 rounded-lg border-gray-200 hover:bg-gray-50 shadow-none text-gray-500"
                            title="Xóa bộ lọc"
                            onClick={handleResetFilters}
                        >
                            <FilterX size={18} />
                        </Button>
                    </div>
                </div>

                {/* Quick Filter Chips */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${statusFilter === "all" ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent"}`}
                    >
                        Tất cả ({statusCounts.total})
                    </button>
                    <button
                        onClick={() => setStatusFilter("Available")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${statusFilter === "Available" ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent"}`}
                    >
                        Sẵn sàng ({statusCounts.available})
                    </button>
                    <button
                        onClick={() => setStatusFilter("In Use")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${statusFilter === "In Use" ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent"}`}
                    >
                        Đang sử dụng ({statusCounts.inUse})
                    </button>
                    <button
                        onClick={() => setStatusFilter("Maintenance")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${statusFilter === "Maintenance" ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent"}`}
                    >
                        Bảo trì ({statusCounts.maintenance})
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="w-full text-left border-collapse">
                        <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider hover:bg-gray-50">
                                <TableHead className="px-6 py-4">Tên / Số bàn</TableHead>
                                <TableHead className="px-6 py-4">Loại bàn</TableHead>
                                <TableHead className="px-6 py-4">Đơn giá / giờ</TableHead>
                                <TableHead className="px-6 py-4">Trạng thái</TableHead>
                                <TableHead className="px-6 py-4 text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100">
                            {tables.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                        Không tìm thấy dữ liệu phù hợp.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tables.map((table) => {
                                    const typeName = table.table_type_id?.name || "Khác";
                                    const uiTheme = renderTableTypeUI(typeName);

                                    return (
                                        <TableRow key={table._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-10 rounded-lg flex items-center justify-center ${uiTheme.iconBg}`}>
                                                        {uiTheme.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{table.table_number}</p>
                                                        <p className="text-xs text-gray-500">{table.area}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${uiTheme.badgeBg}`}>
                                                    {typeName}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <p className="text-gray-900 font-medium">{table.price.toLocaleString("vi-VN")} VNĐ</p>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                {renderStatusUI(table.status)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/owner/tables/edit/${table._id}`)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(table._id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {tables.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            Hiển thị <span className="font-medium text-gray-900">{(pagination.currentPage - 1) * pagination.limit + 1}</span> đến <span className="font-medium text-gray-900">{Math.min(pagination.currentPage * pagination.limit, pagination.total)}</span> của <span className="font-medium text-gray-900">{pagination.total}</span> bàn
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                disabled={pagination.currentPage === 1}
                                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setPagination({ ...pagination, currentPage: page })}
                                    className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors ${page === pagination.currentPage ? "bg-primary text-primary-foreground font-medium" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}