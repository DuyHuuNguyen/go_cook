import { SelectedDish } from "../../types/BookingTypes";


interface SelectedDishListProps {
  dishes: SelectedDish[];
  onChangeQuantity: (dishId: number, quantity: number) => void;
  onRemove: (dishId: number) => void;
}

export default function SelectedDishList({
  dishes,
  onChangeQuantity,
  onRemove,
}: SelectedDishListProps) {
  if (dishes.length === 0) {
    return (
      <p className="dish-empty">
        Bạn chưa chọn món ăn nào. Hãy tìm kiếm và thêm món ở phía trên.
      </p>
    );
  }

  return (
    <div className="selected-dish-list">
      {dishes.map((dish) => (
        <div className="selected-dish" key={dish.dishId}>
          <div className="selected-dish-info">
            <strong>{dish.dishName}</strong>
            <small>Mã món: {dish.dishId}</small>
          </div>

          <div className="dish-quantity">
            <button
              type="button"
              aria-label={`Giảm số lượng ${dish.dishName}`}
              disabled={dish.quantity <= 1}
              onClick={() =>
                onChangeQuantity(dish.dishId, dish.quantity - 1)
              }
            >
              −
            </button>

            <span>{dish.quantity}</span>

            <button
              type="button"
              aria-label={`Tăng số lượng ${dish.dishName}`}
              onClick={() =>
                onChangeQuantity(dish.dishId, dish.quantity + 1)
              }
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="remove-dish-button"
            onClick={() => onRemove(dish.dishId)}
          >
            Xóa
          </button>
        </div>
      ))}
    </div>
  );
}