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
  
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchFeedbacks = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const clubId = localStorage.getItem("selected_club_id");
      if (!clubId) {
        toast.error("Vui lòng chọn câu lạc bộ trước");
        return;
      }
      const url = `/feedbacks/club/${clubId}?page=${page}&limit=${limit}`;
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
    fetchFeedbacks(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    fetchFeedbacks(newPage, pagination.pageSize);
  };

  const openReplyModal = (record) => {
    setSelectedFeedback(record);
    setReplyContent("");
    setIsReplyModalVisible(true);
  };

  const handleCancelReply = () => {
    setIsReplyModalVisible(false);
    setSelectedFeedback(null);
    setReplyContent("");
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    
    try {
      setReplyLoading(true);
      const clubId = localStorage.getItem("selected_club_id");
      const url = `/feedbacks/${selectedFeedback._id}/reply`;
      const response = await axios.post(url, {
        reply_content: replyContent,
        clubId
      });

      if (response.data && response.data.success) {
        toast.success("Đã phản hồi đánh giá thành công");
        
        // Optimistic UI Update
        const updatedFeedbacks = feedbacks.map(fb => {
          if (fb._id === selectedFeedback._id) {
            return {
              ...fb,
              reply_content: replyContent,
              replied_at: new Date().toISOString()
            };
          }
          return fb;
        });
        setFeedbacks(updatedFeedbacks);
        
        handleCancelReply();
      }
    } catch (error) {
      console.error("Lỗi replyFeedback:", error);
      const errorMsg = error.response?.data?.message || "Lỗi khi gửi phản hồi";
      toast.error(errorMsg);
    } finally {
      setReplyLoading(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý đánh giá</h2>
          <p className="text-muted-foreground mt-1">
            Xem và phản hồi đánh giá của khách hàng về câu lạc bộ
          </p>
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
                  <TableHead className="w-[25%]">Trạng thái / Phản hồi</TableHead>
                  <TableHead className="w-[10%] text-right">Thao tác</TableHead>
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
                      <TableCell className="text-right">
                        <Button 
                          variant={isReplied ? "outline" : "default"}
                          disabled={isReplied}
                          onClick={() => openReplyModal(fb)}
                          className={!isReplied ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                          size="sm"
                        >
                          Phản hồi
                        </Button>
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
          </div>
        )}
      </div>

      <Dialog open={isReplyModalVisible} onOpenChange={setIsReplyModalVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
          </DialogHeader>
          <div className="mt-4 mb-4 p-4 bg-muted/50 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground mb-2 block">Khách hàng đánh giá:</span>
            {renderStars(selectedFeedback?.rating || 5)}
            <p className="mt-2 text-sm font-medium">
              "{selectedFeedback?.comment || 'Không có bình luận'}"
            </p>
          </div>
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reply_content" className="text-sm font-medium">Nội dung phản hồi của bạn:</label>
              <Textarea
                id="reply_content"
                placeholder="Nhập nội dung phản hồi. Khách hàng sẽ nhìn thấy nội dung này..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancelReply}>
                Hủy
              </Button>
              <Button type="submit" disabled={replyLoading || !replyContent.trim()} className="bg-orange-500 hover:bg-orange-600">
                {replyLoading ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerReviewListPage;
