import {useEffect, useState, type FormEvent} from "react";
import {useNavigate} from "react-router";
import DishProvider, {useDish} from "../../contexts/DishContext";
import CategoryProvider, {useCategory} from "../../contexts/CategoryContext";
import MenuAssets from "./MenuAssets";
import {updateMenu} from "../../clients/MenuClient.tsx";
import {UnProviderDishes} from "../seller/Dishes.tsx";

const LIMITS = {
    NAME_MIN: 3,
    NAME_MAX: 255,
    DESC_MIN: 10,
    DESC_MAX: 3000,
} as const;

export interface MenuUpdatePayload {
    id: number;
    name: string;
    tempPrice: number;
    minGuests: number;
    maxGuests: number;
    description: string;
    status: string;
    categoryId: number;
    dishIds: number[];
}

export interface MenuInitialData {
    id: number;
    name: string;
    tempPrice: number;
    minGuests: number;
    maxGuests: number;
    description: string;
    status: string;
    categoryId: number;
    dishIds: number[];
}

interface MenuUpdateFormProps {
    initialData: MenuInitialData;
    redirectTo?: string;
}

function MenuUpdate({
    initialData,
    redirectTo = "/seller/menu-management",
}: MenuUpdateFormProps) {
    const navigate = useNavigate();
    const {selectedDishes, setSelectedDishes} = useDish();
    const {
        categories,
        hasNext: hasMoreCategories,
        loading: loadingCategories,
        error: categoryError,
        loadMoreCategories,
    } = useCategory();

    const [name, setName] = useState(initialData.name);
    const [tempPrice, setTempPrice] = useState(initialData.tempPrice);
    const [minGuests, setMinGuests] = useState(initialData.minGuests);
    const [maxGuests, setMaxGuests] = useState(initialData.maxGuests);
    const [description, setDescription] = useState(initialData.description);
    const [status, setStatus] = useState(initialData.status);
    const [categoryId, setCategoryId] = useState(initialData.categoryId);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadMoreCategories();
    }, [loadMoreCategories]);

    useEffect(() => {
        setName(initialData.name);
        setTempPrice(initialData.tempPrice);
        setMinGuests(initialData.minGuests);
        setMaxGuests(initialData.maxGuests);
        setDescription(initialData.description);
        setStatus(initialData.status);
        setCategoryId(initialData.categoryId);
        setSelectedDishes(initialData.dishIds);
    }, [initialData, setSelectedDishes]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        const trimmedDesc = description.trim();

        if (trimmedName.length < LIMITS.NAME_MIN) {
            setError(`Tên thực đơn phải có ít nhất ${LIMITS.NAME_MIN} ký tự`);
            return;
        }

        if (trimmedDesc && trimmedDesc.length < LIMITS.DESC_MIN) {
            setError(`Mô tả phải có ít nhất ${LIMITS.DESC_MIN} ký tự hoặc để trống`);
            return;
        }

        if (categoryId === 0) {
            setError("Vui lòng chọn danh mục");
            return;
        }

        if (maxGuests < minGuests) {
            setError("Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu");
            return;
        }

        const payload: MenuUpdatePayload = {
            id: initialData.id,
            name: trimmedName,
            tempPrice,
            minGuests,
            maxGuests,
            description: trimmedDesc,
            status,
            categoryId,
            dishIds: selectedDishes,
        };

        try {
            setSubmitting(true);
            const success = await updateMenu(payload);
            if (success) {
                navigate(redirectTo);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Cập nhật thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="stack" onSubmit={handleSubmit}>
            <section className="card stack">
                <div>
                    <p className="eyebrow">01 · Thông tin cơ bản</p>
                    <h2>Cập nhật thực đơn</h2>
                </div>

                <label className="field">
                    Tên thực đơn
                    <input
                        required
                        minLength={LIMITS.NAME_MIN}
                        maxLength={LIMITS.NAME_MAX}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={(e) => setName(e.target.value.trim())}
                        placeholder="Ví dụ: Mâm cơm sum vầy"
                    />
                    <small className="text-muted">
                        {name.length}/{LIMITS.NAME_MAX} ký tự (tối thiểu {LIMITS.NAME_MIN})
                    </small>
                </label>

                <div className="grid grid-2">
                    <label className="field">
                        Danh mục
                        <select
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
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
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
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
                            value={minGuests}
                            onChange={(e) => setMinGuests(Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                        />
                    </label>
                    <label className="field">
                        Số khách tối đa
                        <input
                            required
                            type="number"
                            min={minGuests || 1}
                            max="100"
                            value={maxGuests}
                            onChange={(e) => setMaxGuests(Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                        />
                    </label>
                </div>

                <label className="field">
                    Trạng thái
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="ACTIVE">Đang bán</option>
                        <option value="INACTIVE">Tạm ẩn</option>
                    </select>
                </label>

                <div>
                    <p className="eyebrow">02 · Chọn món ăn</p>
                    <UnProviderDishes/>
                </div>

                <MenuAssets menuId={initialData.id} menuName={name}/>

                <label className="field">
                    Mô tả
                    <textarea
                        rows={3}
                        minLength={LIMITS.DESC_MIN}
                        maxLength={LIMITS.DESC_MAX}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={(e) => setDescription(e.target.value.trim())}
                        placeholder="Hương vị, nguyên liệu và điều đặc biệt của thực đơn…"
                    />
                    <small className="text-muted">
                        {description.length}/{LIMITS.DESC_MAX} ký tự
                        {description.trim() && description.trim().length < LIMITS.DESC_MIN &&
                            ` (tối thiểu ${LIMITS.DESC_MIN})`
                        }
                    </small>
                </label>

                {error && <p className="text-danger">{error}</p>}

                <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Cập nhật thực đơn"}
                </button>
            </section>
        </form>
    );
}

function MenuUpdateForm(props: MenuUpdateFormProps) {
    return (
        <CategoryProvider>
            <DishProvider>
                <MenuUpdate {...props} />
            </DishProvider>
        </CategoryProvider>
    );
}

export default MenuUpdateForm