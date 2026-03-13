import { useRef, useEffect, useState } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

// Tọa độ trung tâm Việt Nam mặc định
const INITIAL_CENTER = [105.8342, 21.0278]; // Hà Nội

export function MapAddressPicker({ onLocationSelect, initialCoords, searchQuery }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  // Khởi tạo bản đồ Goong
  useEffect(() => {
    const maptilesKey = import.meta.env.VITE_GOONG_MAPTILES_KEY;
    goongjs.accessToken = maptilesKey;

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${maptilesKey}`, // Style chuẩn của Goong kèm Key
      center: initialCoords ? [initialCoords.lng, initialCoords.lat] : INITIAL_CENTER,
      zoom: initialCoords ? 16 : 13,
    });

    mapRef.current = map;

    // Cập nhật state khi tọa độ hoặc địa chỉ thay đổi
    const updateLocationState = (coords, fullAddress, rawData = {}) => {
        let provinceName = "";
        let districtName = "";

        // Goong API trả về cấu trúc khác Mapbox, ta cần bóc tách kỹ
        if (rawData.compound) {
            provinceName = rawData.compound.province || "";
            districtName = rawData.compound.district || "";
        }

        onLocationSelect({
          lat: coords[1],
          lng: coords[0],
          address: fullAddress,
          provinceName,
          districtName,
        });
    };

    // Thêm Marker
    const marker = new goongjs.Marker({
      draggable: true,
      color: "#16a34a", 
    })
      .setLngLat(initialCoords ? [initialCoords.lng, initialCoords.lat] : INITIAL_CENTER)
      .addTo(map);

    markerRef.current = marker;

    map.on('load', () => {
        map.resize();
    });

    // Xử lý khi kéo thả marker (Reverse Geocoding Goong)
    marker.on("dragend", async () => {
        const lngLat = marker.getLngLat();
        const apiKey = import.meta.env.VITE_GOONG_API_KEY;
        const url = `https://rsapi.goong.io/Geocode?latlng=${lngLat.lat},${lngLat.lng}&api_key=${apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const bestMatch = data.results[0];
                updateLocationState([lngLat.lng, lngLat.lat], bestMatch.formatted_address, bestMatch);
            }
        } catch (error) {
            console.error("Goong Reverse geocoding error:", error);
        }
    });

    return () => map.remove();
  }, []);

  // Effect: Tìm kiếm theo địa chỉ (Forward Geocoding Goong)
  useEffect(() => {
    if (!searchQuery || !mapRef.current) return;

    const performSearch = async () => {
        setIsSearching(true);
        const apiKey = import.meta.env.VITE_GOONG_API_KEY;
        const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const { lat, lng } = result.geometry.location;
                
                // Di chuyển bản đồ và marker
                mapRef.current.flyTo({ center: [lng, lat], zoom: 16 });
                markerRef.current.setLngLat([lng, lat]);
                
                let provinceName = "";
                let districtName = "";
                if (result.compound) {
                    provinceName = result.compound.province || "";
                    districtName = result.compound.district || "";
                }

                onLocationSelect({
                    lat,
                    lng,
                    address: searchQuery,
                    provinceName,
                    districtName,
                    isFromSearch: true
                });
            }
        } catch (error) {
            console.error("Goong search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const timer = setTimeout(performSearch, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
      
      {isSearching && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
           <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-gray-100 animate-in fade-in zoom-in duration-200">
             <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
             <span className="text-xs font-bold text-gray-600">Goong đang tìm vị trí...</span>
           </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg z-10 text-[10px] text-gray-500 border border-white/50">
        📍 Goong Maps: Bản đồ tối ưu cho Việt Nam. Hãy gõ địa chỉ hoặc kéo ghim để chọn vị trí chính xác.
      </div>
    </div>
  );
}
