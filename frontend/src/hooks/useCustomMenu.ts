import { useState } from "react";
import type {
  MenuRequestDraft,
  DishSearchResponse,
} from "../types/BookingTypes";

const initialDraft: MenuRequestDraft = {
  dishes: [],
  adults: 2,
  notes: "",
  mealDate: "",
  mealTime: "18:30",
  address: "",
};

export function useCustomMenu() {
  const [draft, setDraft] = useState<MenuRequestDraft>(initialDraft);
  const [message, setMessage] = useState("");

  function update<K extends keyof MenuRequestDraft>(
    key: K,
    value: MenuRequestDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function addDish(dish: DishSearchResponse) {
    setDraft((current) => {
      const existing = current.dishes.find((item) => item.dishId === dish.id);

      if (existing) {
        return {
          ...current,
          dishes: current.dishes.map((item) =>
            item.dishId === dish.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }

      return {
        ...current,
        dishes: [
          ...current.dishes,
          {
            dishId: dish.id,
            dishName: dish.name,
            quantity: 1,
          },
        ],
      };
    });

    setMessage("");
  }

  function changeDishQuantity(dishId: number, amount: number) {
    setDraft((current) => ({
      ...current,
      dishes: current.dishes.map((dish) =>
        dish.dishId === dishId
          ? {
              ...dish,
              quantity: Math.max(1, Math.min(100, dish.quantity + amount)),
            }
          : dish,
      ),
    }));

    setMessage("");
  }

  function removeDish(dishId: number) {
    update(
      "dishes",
      draft.dishes.filter((dish) => dish.dishId !== dishId),
    );
  }

  function changeGuests(amount: number) {
    update("adults", Math.max(0, Math.min(100, draft.adults + amount)));
  }

  return {
    draft,
    message,
    setMessage,
    update,
    addDish,
    changeDishQuantity,
    removeDish,
    changeGuests,
  };
}
