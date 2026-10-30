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
        <div>
            <div className="row">
                {dishes.map((dish) => {
                    const isSelected = selectedDishes.includes(dish.id);

                    return (
                        <div className="col-md-3 mb-3" key={dish.id}>
                            <button
                                type="button"
                                className={`card p-3 w-100 ${
                                    isSelected
                                        ? "text-white bg-primary border-primary"
                                        : "text-dark bg-white"
                                }`}
                                onClick={() => {
                                    setSelectedDishes(
                                        isSelected
                                            ? selectedDishes.filter(
                                                (id) => id !== dish.id
                                            )
                                            : [...selectedDishes, dish.id]
                                    );
                                }}
                            >
                                {dish.name}
                            </button>
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-danger">{error}</p>}

            {hasNext && (
                <button
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={() => void loadMoreDishes()}
                >
                    {loading ? "Đang tải..." : "Tải thêm"}
                </button>
            )}
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