import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Star, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import axios from "axios";

export const BookingPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tất cả");
  const [filterRating, setFilterRating] = useState(false);
  const [filterPrice, setFilterPrice] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:9999/api/clubs");
      if (res.data.success) {
        setClubs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterRating, filterPrice]);

  // Helper map Table DB Types to UI Types
  const mapTypeToUI = (dbType) => {
     if (dbType.includes("Carom")) return "3C";
     if (dbType.includes("Snooker")) return "Libre";
     return "Pool"; // Fallback for Pool Table
  };

  const filteredClubs = clubs.filter((club) => {
    const matchSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        club.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRating = filterRating ? club.rating >= 4.0 : true;
    
    const matchType = filterType === "Tất cả" 
      ? true 
      : (club.tableTypes && club.tableTypes.some(type => mapTypeToUI(type) === filterType));
      
    const matchPrice = (() => {
       if (filterPrice === "under50") return club.priceFrom < 50000;
       if (filterPrice === "50to100") return club.priceFrom >= 50000 && club.priceFrom <= 100000;
       if (filterPrice === "over100") return club.priceFrom > 100000;
       return true;
    })();
      
    return matchSearch && matchRating && matchType && matchPrice;
  });

  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage) || 1;
  const paginatedClubs = filteredClubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
           pages.push(i);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
           pages.push("...");
        }
    }
    
    // Lọc bỏ các dấu "..." thừa
    pages = pages.filter((p, index) => p !== "..." || pages[index - 1] !== "...");

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {pages.map((page, index) => (
          page === "..." ? (
            <span key={`dots-${index}`} className="text-slate-400 px-2">...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 border rounded-lg font-medium transition-colors ${
                currentPage === page 
                  ? "bg-emerald-500 text-white border-emerald-500" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Search Header Section */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Danh sách Câu lạc bộ</h1>
              <p className="text-slate-500 text-sm mt-1">Tìm kiếm và đặt bàn tại các câu lạc bộ bida chất lượng nhất</p>
            </div>
            
            <div className="w-full md:w-96 relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm tên câu lạc bộ hoặc địa chỉ..." 
                className="w-full pl-10 pr-4 py-2 border rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-full transition-colors border">
              <Filter className="w-4 h-4" /> Bộ lọc
            </button>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-full transition-colors border">
              Quận/Huyện <span className="text-xs ml-1">▼</span>
            </button>
            <div className="flex bg-slate-100 p-0.5 rounded-full border">
              {["Tất cả", "Pool", "3C", "Libre"].map((type) => (
                <button 
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 shadow-sm text-sm font-medium rounded-full transition-all ${
                    filterType === type ? "bg-white text-emerald-600" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <select 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-full transition-colors border appearance-none outline-none cursor-pointer"
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
            >
              <option value="all">Mọi Giờ Chơi</option>
              <option value="under50">Dưới 50.000đ/h</option>
              <option value="50to100">50.000đ - 100.000đ/h</option>
              <option value="over100">Trên 100.000đ/h</option>
            </select>
            <button 
              onClick={() => setFilterRating(!filterRating)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors border ${
                filterRating 
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
              }`}
            >
              Đánh giá (4.0+) <Star className={`w-4 h-4 ${filterRating ? "fill-yellow-500 text-yellow-500" : "text-slate-400"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 text-sm">Hiển thị {filteredClubs.length} câu lạc bộ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedClubs.map((club) => (
                <div key={club._id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                  <div className="relative h-48 bg-slate-200 overflow-hidden">
                    {club.avatar ? (
                      <img src={club.avatar} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">Chưa có ảnh</div>
                    )}
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">
                      PHỔ BIẾN NHẤT
                    </div>
                    {club.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-sm font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {Number(club.rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{club.name}</h3>
                    <p className="text-slate-500 text-sm mt-1 flex items-start gap-1 line-clamp-2">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      {club.address}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="text-slate-500">{club.distance}</div>
                      <div className="font-bold text-emerald-600">Từ {club.priceFrom?.toLocaleString()}đ/h</div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-1 mb-4">
                      {club.tableTypes && club.tableTypes.map((type, idx) => (
                         <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border">
                            {mapTypeToUI(type)}
                         </span>
                      ))}
                      {(!club.tableTypes || club.tableTypes.length === 0) && (
                         <span className="px-2 py-1 bg-slate-100 text-slate-400 text-xs rounded border border-dashed">Chưa có loại bàn</span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t">
                      <Link 
                        to={`/booking/${club._id}`}
                        className="flex items-center justify-center w-full gap-2 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Đến Đặt Bàn <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                Không tìm thấy câu lạc bộ nào phù hợp với tìm kiếm của bạn.
              </div>
            )}

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};
