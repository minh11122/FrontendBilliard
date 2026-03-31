import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Star, ChevronRight, ChevronLeft, Navigation } from "lucide-react";
import axios from "axios";
import { getAllClubs } from "@/services/club.service";
import { getProvinces, getDistrictsByProvince, getCurrentPosition, calculateDistance, formatDistance } from "@/services/location.service";

export const BookingPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Administrative units state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("all");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("all");

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]); // mảng rỗng = Tất cả
  const [filterRating, setFilterRating] = useState(false);
  const [filterPrice, setFilterPrice] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [findingLocation, setFindingLocation] = useState(false);
  const [sortByLocation, setSortByLocation] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Initial data fetch
  useEffect(() => {
    fetchClubs();
    fetchInitialLocations();
  }, []);

  const fetchInitialLocations = async () => {
    try {
      const provinceList = await getProvinces();
      setProvinces(provinceList);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvinceCode === "all") {
      setDistricts([]);
      setSelectedDistrictCode("all");
      return;
    }

    const fetchDistricts = async () => {
      try {
        const districtList = await getDistrictsByProvince(selectedProvinceCode);
        setDistricts(districtList);
        setSelectedDistrictCode("all");
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
  }, [selectedProvinceCode]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await getAllClubs();
      if (res.success) {
        setClubs(res.data);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocationSorting = async () => {
    if (sortByLocation) {
      setSortByLocation(false);
      return;
    }

    if (userLocation) {
      setSortByLocation(true);
      return;
    }

    try {
      setFindingLocation(true);
      const pos = await getCurrentPosition();
      setUserLocation(pos);
      setSortByLocation(true);
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setFindingLocation(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTypes, selectedProvinceCode, selectedDistrictCode, filterRating, filterPrice, sortByLocation]);

  // Helper map Table DB Types to UI Types
  const mapTypeToUI = (dbType) => {
    if (!dbType) return "Pool";
    const type = dbType.toLowerCase();
    if (type.includes("3c") || type.includes("carom")) return "3C";
    if (type.includes("snooker")) return "Snooker";
    return "Pool";
  };

  const handleTypeClick = (type) => {
    if (type === "Tất cả") {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(prev =>
        prev.includes(type)
          ? prev.filter(t => t !== type)
          : [...prev, type]
      );
    }
  };

  const filteredClubs = clubs.filter((club) => {
    const matchSearch = (club.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (club.address?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchProvince = selectedProvinceCode === "all" || String(club.province_code) === String(selectedProvinceCode);
    
    const matchDistrict = selectedDistrictCode === "all" || String(club.district_code) === String(selectedDistrictCode);

    const matchRating = filterRating ? club.rating >= 4.0 : true;

    const matchType = selectedTypes.length === 0
      ? true
      : club.tableTypes?.some(dbType => selectedTypes.includes(mapTypeToUI(dbType)));

    const matchPrice = (() => {
      if (filterPrice === "under50") return club.priceFrom < 50000;
      if (filterPrice === "50to100") return club.priceFrom >= 50000 && club.priceFrom <= 100000;
      if (filterPrice === "over100") return club.priceFrom > 100000;
      return true;
    })();

    return matchSearch && matchProvince && matchDistrict && matchRating && matchType && matchPrice;
  }).map(club => {
    if (userLocation && club.lat && club.lng) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, club.lat, club.lng);
      return { ...club, distanceValue: dist, distance: formatDistance(dist) };
    }
    return { ...club, distance: club.distance };
  });

  if (sortByLocation && userLocation) {
    filteredClubs.sort((a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity));
  }

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
    pages = pages.filter((p, index) => p !== "..." || pages[index - 1] !== "...");

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {pages.map((page, index) => (
          page === "..." ? (
            <span key={`dots-${index}`} className="text-gray-500 px-2">...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 border rounded-lg font-medium transition-colors ${currentPage === page
                ? "bg-green-500 text-white border-green-500"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Search Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách Câu lạc bộ</h1>
              <p className="text-gray-600 text-sm mt-1">Khám phá những CLB uy tín gần bạn</p>
            </div>
          </div>

          {/* Filters & Search Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-8 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Province Select */}
              <div className="relative">
                <select
                  className="pl-4 pr-10 py-2.5 bg-white hover:border-green-500 text-sm font-medium rounded-lg transition-all border border-gray-300 shadow-sm appearance-none outline-none cursor-pointer min-w-[160px]"
                  value={selectedProvinceCode}
                  onChange={(e) => setSelectedProvinceCode(e.target.value)}
                >
                  <option value="all">Tất cả Tỉnh/Thành</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              {/* District Select */}
              <div className="relative">
                <select
                  className="pl-4 pr-10 py-2.5 bg-white hover:border-green-500 text-sm font-medium rounded-lg transition-all border border-gray-300 shadow-sm appearance-none outline-none cursor-pointer min-w-[160px] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  value={selectedDistrictCode}
                  onChange={(e) => setSelectedDistrictCode(e.target.value)}
                  disabled={selectedProvinceCode === "all"}
                >
                  <option value="all">
                    {selectedProvinceCode === "all" ? "Chọn Tỉnh/Thành trước" : "Tất cả"}
                  </option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name_with_type || d.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              {/* Multi-select type buttons */}
              <div className="flex bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
                {["Tất cả", "Pool", "3C", "Libre"].map((type) => {
                  const isActive = type === "Tất cả"
                    ? selectedTypes.length === 0
                    : selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleTypeClick(type)}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${isActive
                        ? "bg-green-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <select
                  className="pl-4 pr-10 py-2.5 bg-white hover:border-green-500 text-sm font-medium rounded-lg transition-all border border-gray-300 shadow-sm appearance-none outline-none cursor-pointer min-w-[140px]"
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                >
                  <option value="all">Mọi giá tiền</option>
                  <option value="under50">Dưới 50k/h</option>
                  <option value="50to100">50k - 100k/h</option>
                  <option value="over100">Trên 100k/h</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              <button
                onClick={() => setFilterRating(!filterRating)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all border shadow-sm ${filterRating
                  ? "bg-yellow-400 text-white border-yellow-400 shadow-yellow-200"
                  : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
                  }`}
              >
                Top Rating <Star className={`w-4 h-4 ${filterRating ? "fill-white" : "text-yellow-400"}`} />
              </button>

              <button
                onClick={toggleLocationSorting}
                disabled={findingLocation}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all border shadow-sm ${sortByLocation
                  ? "bg-green-500 text-white border-green-500 shadow-green-200"
                  : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
                  }`}
              >
                {findingLocation ? "Định vị..." : "Gần tôi"} <Navigation className={`w-4 h-4 ${sortByLocation ? "fill-white" : "text-green-500"}`} />
              </button>
            </div>

            <div className="w-full lg:w-80 relative">
              <input
                type="text"
                placeholder="Tên club, địa chỉ..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 text-sm">Hiển thị {filteredClubs.length} câu lạc bộ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedClubs.map((club) => (
                <div key={club._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                  <div className="relative h-40 bg-gray-200 overflow-hidden">
                    {club.avatar ? (
                      <img src={club.avatar} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">Chưa có ảnh</div>
                    )}
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                      PHỔ BIẾN
                    </div>
                    {club.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-gray-900 text-sm font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {Number(club.rating).toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="min-h-[72px]">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">{club.name}</h3>
                      <p className="text-gray-600 text-xs mt-2 flex items-start gap-1 line-clamp-2">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                        <span>{club.address}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600 text-xs">{club.distance}</div>
                      <div className="font-bold text-green-600">Từ {club.priceFrom?.toLocaleString()}đ/h</div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-1 mb-4">
                      {club.tableTypes && [...new Set(club.tableTypes.map(mapTypeToUI))].map((uiType, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                          {uiType}
                        </span>
                      ))}
                      {(!club.tableTypes || club.tableTypes.length === 0) && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md border border-dashed border-gray-300">Chưa có loại bàn</span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200">
                      <Link
                        to={`/booking/${club._id}`}
                        className="flex items-center justify-center w-full gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Đặt bàn <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-20 text-gray-600">
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
