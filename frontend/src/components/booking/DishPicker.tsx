import { useState } from "react";
import {
  DishSearchParams,
  DishSearchResponse,
  PaginationResponse,
} from "../../types/BookingTypes";

interface DishPickerProps {
  searchDishes: (
    params: DishSearchParams,
  ) => Promise<PaginationResponse<DishSearchResponse>>;

  selectedDishIds: number[];
  onAdd: (dish: DishSearchResponse) => void;
}

export default function DishPicker({
  searchDishes,
  selectedDishIds,
  onAdd,
}: DishPickerProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<DishSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setResults([]);
      setError("Vui lòng nhập tên món ăn.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await searchDishes({
        keyword: trimmedKeyword,
        page: 1,
        size: 10,
      });

      setResults(response.data);
    } catch (err) {
      console.error(err);
      setResults([]);
      setError("Không thể tìm kiếm món ăn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dish-picker">
      <form
        className="dish-search"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSearch();
        }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Nhập tên món ăn..."
          aria-label="Tên món ăn cần tìm"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Đang tìm..." : "Tìm món"}
        </button>
      </form>

      {error && <p className="booking-error">{error}</p>}

      {results.length > 0 && (
        <div className="dish-search-results">
          {results.map((dish) => {
            const isSelected = selectedDishIds.includes(dish.id);

            return (
              <div className="dish-result" key={dish.id}>
                <div>
                  <strong>{dish.name}</strong>
                  <small>Mã món: {dish.id}</small>
                </div>

                <button
                  type="button"
                  disabled={isSelected}
                  onClick={() => onAdd(dish)}
                >
                  {isSelected ? "Đã thêm" : "+ Thêm món"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && keyword.trim() !== "" && results.length === 0 && (
        <p className="dish-empty">Không tìm thấy món ăn phù hợp.</p>
      )}
    </div>
  );
}
