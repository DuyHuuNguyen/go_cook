import {useEffect} from "react";
import DishProvider, {useDish} from "../../contexts/DishContext";
import {getDishes} from "../../clients/DishClient.tsx";

function DishesChild() {
    const {
        dishes,
        loading,
        hasNext,
        error,
        loadMoreDishes,
        selectedDishes,
        setSelectedDishes
    } = useDish();

    useEffect(() => {
        void loadMoreDishes();
    }, []);

    useEffect(()=>{
        console.log("update dishes")
        console.log(selectedDishes)
    },[selectedDishes])


    return (
        <div className="seller-dishes-picker">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <small className="text-muted">
                    Nhấn vào món ăn để chọn hoặc bỏ chọn cho thực đơn
                </small>
                <span className="badge">
                    Đã chọn: {selectedDishes.length} món
                </span>
            </div>

            <div className="seller-dishes-grid">
                {dishes.map((dish) => {
                    const isSelected = selectedDishes.includes(dish.id);

                    return (
                        <button
                            key={dish.id}
                            type="button"
                            className={`seller-dish-chip ${isSelected ? "is-selected" : ""}`}
                            onClick={() => {
                                setSelectedDishes(
                                    isSelected
                                        ? selectedDishes.filter((id) => id !== dish.id)
                                        : [...selectedDishes, dish.id]
                                );
                            }}
                        >
                            <span className="seller-dish-check">
                                {isSelected ? "✓" : "+"}
                            </span>
                            <span className="seller-dish-name">{dish.name}</span>
                        </button>
                    );
                })}
            </div>

            {error && <p className="text-danger mt-2 mb-0">{error}</p>}

            {hasNext && (
                <div className="mt-3">
                    <button
                        type="button"
                        className="btn secondary sm"
                        disabled={loading}
                        onClick={() => void loadMoreDishes()}
                    >
                        {loading ? "Đang tải..." : "Tải thêm món ăn"}
                    </button>
                </div>
            )}

            <style>{`
                .seller-dishes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
                    gap: 10px;
                }
                .seller-module .seller-dish-chip {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 12px;
                    border: 1px solid #d9ddcf;
                    background: #fff;
                    color: #1c1c17;
                    font-size: 13.5px;
                    font-weight: 500;
                    text-align: left;
                    transition: all 0.15s ease;
                }
                .seller-module .seller-dish-chip:hover {
                    border-color: #376412;
                    background: #f8fbf5;
                }
                .seller-module .seller-dish-chip.is-selected {
                    background: #edf5e7;
                    border-color: #376412;
                    color: #23440a;
                    font-weight: 650;
                    box-shadow: 0 2px 8px rgba(55, 100, 18, 0.1);
                }
                .seller-dish-check {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: #f0f2ea;
                    color: #65695e;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .seller-module .seller-dish-chip.is-selected .seller-dish-check {
                    background: #376412;
                    color: #fff;
                }
                .seller-dish-name {
                    line-height: 1.3;
                    word-break: break-word;
                }
            `}</style>
        </div>
    );
}
export  function UnProviderDishes(){
    return(
        <DishesChild></DishesChild>
    );
}

export default function Dishes() {
    return (
        <DishProvider>
            <DishesChild></DishesChild>
        </DishProvider>
    )
}