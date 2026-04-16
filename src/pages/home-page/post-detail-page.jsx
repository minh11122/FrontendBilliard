import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, MapPin, ArrowLeft } from "lucide-react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { PostBlocksRenderer } from "@/components/common/post-blocks-renderer";

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`/posts/${id}`);
        setPost(res.data || null);
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  if (loading) {
    return <div className="container mx-auto px-6 py-12 text-gray-500">Đang tải bài viết...</div>;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error || "Không tìm thấy bài viết"}</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <Button variant="outline" onClick={() => navigate("/posts")} className="rounded-xl mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>

        <div className="space-y-3 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
          <div className="text-sm text-gray-600 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-green-600" />
              {post.club_id?.name || "CLB"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <PostBlocksRenderer
            blocks={post.content_blocks}
            fallbackContent={post.content}
            fallbackImage={post.image_url}
            title={post.title}
          />
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;
