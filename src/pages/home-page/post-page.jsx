import React, { useEffect, useMemo, useState } from "react";
import { Eye, Search, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

import { Button } from "@/components/ui/button";

export const PostPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/posts");
      setPosts(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = posts.filter((p) => {
      const matchClub = clubFilter === "all" || p.club_id?._id === clubFilter;
      if (!matchClub) return false;
      if (!q) return true;
      const t = p.title?.toLowerCase() || "";
      const c = p.content?.toLowerCase() || "";
      const club = p.club_id?.name?.toLowerCase() || "";
      const addr = p.club_id?.address?.toLowerCase() || "";
      return t.includes(q) || c.includes(q) || club.includes(q) || addr.includes(q);
    });
    result.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at || 0).getTime();
      const timeB = new Date(b.published_at || b.created_at || 0).getTime();
      return sortBy === "oldest" ? timeA - timeB : timeB - timeA;
    });
    return result;
  }, [posts, search, clubFilter, sortBy]);

  const clubOptions = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      if (p.club_id?._id && p.club_id?.name && !map.has(p.club_id._id)) {
        map.set(p.club_id._id, p.club_id.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [posts]);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("vi-VN");
  };

  const renderSnippet = (content) => {
    const text = content || "";
    return text.length > 140 ? `${text.slice(0, 140)}...` : text;
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bài viết</h1>
            <p className="text-gray-600 text-sm mt-1">Tin tức và chia sẻ kinh nghiệm từ các câu lạc bộ.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[340px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-300 focus:ring-2 focus:ring-green-100 text-sm"
                placeholder="Tìm theo tiêu đề hoặc CLB..."
              />
            </div>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="all">Tất cả CLB</option>
              {clubOptions.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-100 animate-pulse" />
                <div className="p-5">
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-[75%]" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-[55%] mt-3" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-[60%] mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 flex items-start gap-3">
            <span className="font-bold">!</span>
            <div className="flex-1">
              <div className="font-semibold">Lỗi</div>
              <div className="text-sm mt-1">{error}</div>
              <button
                className="mt-3 text-sm font-semibold text-red-700 hover:underline"
                onClick={() => fetchPosts()}
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="mt-4 text-gray-700 font-semibold">Chưa có bài viết phù hợp.</div>
            <div className="text-sm text-gray-500 mt-2">Hãy thử từ khóa khác.</div>
          </div>
        ) : (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-44 bg-gray-50">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-50 to-gray-50" />
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{p.title}</h3>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-green-600" />
                    <span className="line-clamp-1">{p.club_id?.name || "CLB"}</span>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">{renderSnippet(p.content)}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{p.published_at ? formatDate(p.published_at) : formatDate(p.created_at)}</span>
                    </div>

                    <Button
                      onClick={() => navigate(`/posts/${p._id}`)}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4 font-bold flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PostPage;
