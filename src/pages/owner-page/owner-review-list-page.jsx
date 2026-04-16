import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Star, MessageSquare } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const OwnerReviewListPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all");

  const fetchFeedbacks = async (page = 1, limit = 10, rating = ratingFilter, isReplied = replyFilter) => {
    try {
      setLoading(true);
      const clubId = localStorage.getItem("selected_club_id");
      if (!clubId) {
        toast.error("Vui lòng chọn câu lạc bộ trước");
        return;
      }
      let url = `/feedbacks/club/${clubId}?page=${page}&limit=${limit}`;
      if (rating !== "all") url += `&rating=${rating}`;
      if (isReplied !== "all") url += `&isReplied=${isReplied}`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.success) {
        setFeedbacks(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      console.error("Lỗi fetchFeedbacks:", error);
      toast.error("Lỗi khi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(pagination.current, pagination.pageSize, ratingFilter, replyFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    fetchFeedbacks(newPage, pagination.pageSize, ratingFilter, replyFilter);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= (rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý đánh giá</h2>
          <p className="text-muted-foreground mt-1">
            Xem và phản hồi đánh giá của khách hàng về câu lạc bộ
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={ratingFilter} onValueChange={(val) => { setRatingFilter(val); setPagination(prev => ({...prev, current: 1})); fetchFeedbacks(1, pagination.pageSize, val, replyFilter); }}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="Tất cả đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả số sao</SelectItem>
              <SelectItem value="5">5 Sao</SelectItem>
              <SelectItem value="4">4 Sao</SelectItem>
              <SelectItem value="3">3 Sao</SelectItem>
              <SelectItem value="2">2 Sao</SelectItem>
              <SelectItem value="1">1 Sao</SelectItem>
            </SelectContent>
          </Select>

          <Select value={replyFilter} onValueChange={(val) => { setReplyFilter(val); setPagination(prev => ({...prev, current: 1})); fetchFeedbacks(1, pagination.pageSize, ratingFilter, val); }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Trạng thái phản hồi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Đã phản hồi</SelectItem>
              <SelectItem value="false">Chưa phản hồi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Khách hàng</TableHead>
                  <TableHead className="w-[20%]">Thông tin Booking</TableHead>
                  <TableHead className="w-[30%]">Đánh giá</TableHead>
                  <TableHead className="w-[35%]">Trạng thái / Phản hồi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((fb) => {
                  const isReplied = !!fb.reply_content;
                  return (
                    <TableRow key={fb._id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {fb.account_id?.fullname || "Người dùng ẩn danh"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{fb.booking_id?.code_number || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">
                            {fb.booking_id?.play_date ? format(new Date(fb.booking_id.play_date), "dd/MM/yyyy") : ""} 
                            {fb.booking_id?.start_time && ` (${fb.booking_id.start_time} - ${fb.booking_id.end_time})`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {renderStars(fb.rating)}
                          <p className="text-sm text-foreground">
                            {fb.comment ? `"${fb.comment}"` : <span className="text-muted-foreground italic">Không có bình luận</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fb.created_at ? format(new Date(fb.created_at), "dd/MM/yyyy HH:mm") : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2 items-start">
                          <Badge variant={isReplied ? "success" : "secondary"} className={isReplied ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-orange-100 text-orange-800 hover:bg-orange-100"}>
                            {isReplied ? "Đã trả lời" : "Chưa trả lời"}
                          </Badge>
                          {isReplied && (
                            <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/50 w-full mt-1">
                              <span className="text-xs font-semibold text-orange-600 mb-1 block">Phản hồi của bạn:</span>
                              <p className="text-sm text-foreground mb-1 break-words">{fb.reply_content}</p>
                              {fb.replied_at && (
                                <span className="text-[11px] text-muted-foreground block text-right">
                                  {format(new Date(fb.replied_at), "dd/MM/yyyy HH:mm")}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Custom Pagination (if necessary, simple numbers for now) */}
        {pagination.total > pagination.pageSize && (
          <div className="p-4 border-t border-border flex justify-end items-center gap-2">
            <span className="text-sm text-muted-foreground mr-4">
              Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong {pagination.total}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => handlePageChange(pagination.current + 1)}
            >
              Sau
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              Trang {pagination.current} / {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerReviewListPage;
