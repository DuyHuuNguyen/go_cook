import {useEffect, useState, type FormEvent} from "react";
import {useNavigate} from "react-router";
import MenuProvider, {useMenu} from "../../contexts/MenuContext";
import DishProvider, {useDish} from "../../contexts/DishContext";
import CategoryProvider, {useCategory} from "../../contexts/CategoryContext";
import Dishes from "./Dishes";

interface MenuFormState {
    name: string;
    tempPrice: number;
    minGuests: number;
    maxGuests: number;
    description: string;
    status: string;
    categoryId: number;
}

const initialState: MenuFormState = {
    name: "",
    tempPrice: 0,
    minGuests: 1,
    maxGuests: 10,
    description: "",
    status: "ACTIVE",
    categoryId: 0,
};

function Menu() {
    const navigate = useNavigate();
    const {submitMenu, loading, error} = useMenu();
    const {selectedDishes} = useDish();
    const {
        categories,
        hasNext: hasMoreCategories,
        loading: loadingCategories,
        error: categoryError,
        loadMoreCategories,
    } = useCategory();
    const [form, setForm] = useState<MenuFormState>(initialState);

    useEffect(() => {
        void loadMoreCategories();
    }, [loadMoreCategories]);

    function set<K extends keyof MenuFormState>(key: K, value: MenuFormState[K]) {
        setForm((prev) => ({...prev, [key]: value}));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (form.categoryId === 0) {
            alert("Vui lòng chọn danh mục");
            return;
        }

        const ok = await submitMenu({
            ...form,
            dishIds: selectedDishes,
        });

        if (ok) {
            navigate("/seller/products");
        }
    }

    return (
        <form className="stack" onSubmit={handleSubmit}>
            <section className="card stack">
                <div>
                    <p className="eyebrow">01 · Thông tin cơ bản</p>
                    <h2>Một thực đơn thật hấp dẫn</h2>
                </div>

                <label className="field">
                    Tên thực đơn
                    <input
                        required
                        maxLength={255}
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Ví dụ: Mâm cơm sum vầy"
                    />
                </label>

                <div className="grid grid-2">
                    <label className="field">
                        Danh mục
                        <select
                            required
                            value={form.categoryId}
                            onChange={(e) => set("categoryId", Number(e.target.value))}
                        >
                            <option value={0} disabled>
                                -- Chọn danh mục --
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {categoryError && <span className="text-danger">{categoryError}</span>}
                        {hasMoreCategories && (
                            <button
                                type="button"
                                className="btn btn-link p-0"
                                disabled={loadingCategories}
                                onClick={() => void loadMoreCategories()}
                            >
                                {loadingCategories ? "Đang tải..." : "Tải thêm danh mục"}
                            </button>
                        )}
                    </label>

                    <label className="field">
                        Giá mỗi khách (đ)
                        <input
                            required
                            type="number"
                            min="1"
                            step="1"
                            value={form.tempPrice}
                            onChange={(e) => set("tempPrice", Number(e.target.value))}
                        />
                    </label>
                </div>

                <div className="grid grid-2">
                    <label className="field">
                        Số khách tối thiểu
                        <input
                            required
                            type="number"
                            min="1"
                            max="100"
                            value={form.minGuests}
                            onChange={(e) => set("minGuests", Number(e.target.value))}
                        />
                    </label>
                    <label className="field">
                        Số khách tối đa
                        <input
                            required
                            type="number"
                            min={form.minGuests || 1}
                            max="100"
                            value={form.maxGuests}
                            onChange={(e) => set("maxGuests", Number(e.target.value))}
                        />
                    </label>
                </div>

                <label className="field">
                    Trạng thái
                    <select
                        value={form.status}
                        onChange={(e) => set("status", e.target.value)}
                    >
                        <option value="ACTIVE">Đang bán</option>
                        <option value="INACTIVE">Tạm ẩn</option>
                    </select>
                </label>

                <div>
                    <p className="eyebrow">02 · Chọn món ăn</p>
                    <Dishes/>
                </div>

                <label className="field">
                    Mô tả
                    <textarea
                        rows={3}
                        maxLength={3000}
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Hương vị, nguyên liệu và điều đặc biệt của thực đơn…"
                    />
                </label>

                {error && <p className="text-danger">{error}</p>}

                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu thực đơn"}
                </button>
            </section>
        </form>
    );
}
export default function MenuForm() {
    return (
        <MenuProvider>
            <CategoryProvider>
                <DishProvider>
                    <Menu/>
                </DishProvider>
            </CategoryProvider>
        </MenuProvider>
    )
}