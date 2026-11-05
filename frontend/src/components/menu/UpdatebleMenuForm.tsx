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
    GUESTS_MIN: 1,
    GUESTS_MAX: 100,
    PRICE_MIN: 1,
    PRICE_MAX: 100000000,
} as const;

const normalizeName = (val: string) => val.trim().replace(/\s+/g, " ");
const normalizeDesc = (val: string) =>
    val.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

function sanitizeInt(raw: string, min: number, max: number, fallback = 0): number {
    if (raw === "") return fallback;
    const parsed = Math.trunc(Number(raw));
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

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
        if (submitting) return;
        setError(null);

        const trimmedName = normalizeName(name);
        const trimmedDesc = normalizeDesc(description);
        const price = Math.trunc(Number(tempPrice));
        const minG = Math.trunc(Number(minGuests));
        const maxG = Math.trunc(Number(maxGuests));

        if (trimmedName.length < LIMITS.NAME_MIN || trimmedName.length > LIMITS.NAME_MAX) {
            setError(`Tên thực đơn phải từ ${LIMITS.NAME_MIN} đến ${LIMITS.NAME_MAX} ký tự.`);
            return;
        }

        if (!categoryId || categoryId <= 0) {
            setError("Vui lòng chọn danh mục.");
            return;
        }

        if (Number.isNaN(price) || price < LIMITS.PRICE_MIN || price > LIMITS.PRICE_MAX) {
            setError("Giá mỗi khách phải lớn hơn 0 đ.");
            return;
        }

        if (Number.isNaN(minG) || minG < LIMITS.GUESTS_MIN || minG > LIMITS.GUESTS_MAX) {
            setError(`Số khách tối thiểu phải từ ${LIMITS.GUESTS_MIN} đến ${LIMITS.GUESTS_MAX}.`);
            return;
        }

        if (Number.isNaN(maxG) || maxG < minG || maxG > LIMITS.GUESTS_MAX) {
            setError(`Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu (${minG}).`);
            return;
        }

        if (selectedDishes.length === 0) {
            setError("Vui lòng chọn ít nhất 1 món ăn cho thực đơn.");
            return;
        }

        if (trimmedDesc && (trimmedDesc.length < LIMITS.DESC_MIN || trimmedDesc.length > LIMITS.DESC_MAX)) {
            setError(`Mô tả phải có ít nhất ${LIMITS.DESC_MIN} ký tự hoặc để trống.`);
            return;
        }

        setName(trimmedName);
        setDescription(trimmedDesc);
        setTempPrice(price);
        setMinGuests(minG);
        setMaxGuests(maxG);

        const payload: MenuUpdatePayload = {
            id: initialData.id,
            name: trimmedName,
            tempPrice: price,
            minGuests: minG,
            maxGuests: maxG,
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

    const normalizedNameLen = normalizeName(name).length;
    const normalizedDescLen = normalizeDesc(description).length;

    return (
        <form className="stack" onSubmit={handleSubmit} noValidate>
            <section className="card stack">
                <div className="between">
                    <div>
                        <p className="eyebrow">01 · Thông tin cơ bản</p>
                        <h2 className="mt-1">Cập nhật thực đơn #{initialData.id}</h2>
                        <p className="small muted mt-1">
                            Chỉnh sửa thông tin, danh sách món và hình ảnh thực đơn của bạn.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn secondary sm"
                        onClick={() => navigate(redirectTo)}
                    >
                        ← Quay lại
                    </button>
                </div>

                <label className="field">
                    <span>Tên thực đơn <span className="danger">*</span></span>
                    <input
                        required
                        minLength={LIMITS.NAME_MIN}
                        maxLength={LIMITS.NAME_MAX}
                        value={name}
                        disabled={submitting}
                        onChange={(e) => {
                            setError(null);
                            setName(e.target.value);
                        }}
                        onBlur={(e) => setName(normalizeName(e.target.value))}
                        placeholder="Ví dụ: Mâm cơm sum vầy"
                    />
                    <div className="d-flex justify-content-between">
                        <small className="text-muted">Tối thiểu {LIMITS.NAME_MIN} ký tự</small>
                        <small className="text-muted">
                            {normalizedNameLen}/{LIMITS.NAME_MAX} ký tự
                        </small>
                    </div>
                </label>

                <div className="grid grid-2">
                    <label className="field">
                        <span>Danh mục <span className="danger">*</span></span>
                        <select
                            required
                            value={categoryId}
                            disabled={submitting || loadingCategories}
                            onChange={(e) => {
                                setError(null);
                                setCategoryId(Number(e.target.value));
                            }}
                        >
                            <option value={0} disabled>
                                {loadingCategories ? "Đang tải danh mục..." : "-- Chọn danh mục --"}
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {categoryError && <small className="text-danger">{categoryError}</small>}
                        {hasMoreCategories && (
                            <div>
                                <button
                                    type="button"
                                    className="text-link small"
                                    disabled={loadingCategories}
                                    onClick={() => void loadMoreCategories()}
                                >
                                    {loadingCategories ? "Đang tải..." : "+ Tải thêm danh mục"}
                                </button>
                            </div>
                        )}
                    </label>

                    <label className="field">
                        <span>Giá tạm tính mỗi khách (đ) <span className="danger">*</span></span>
                        <input
                            required
                            type="number"
                            inputMode="numeric"
                            min={LIMITS.PRICE_MIN}
                            max={LIMITS.PRICE_MAX}
                            step="1000"
                            value={tempPrice === 0 ? "" : tempPrice}
                            disabled={submitting}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                setError(null);
                                setTempPrice(sanitizeInt(e.target.value, 0, LIMITS.PRICE_MAX, 0));
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                        <small className="text-muted">
                            {tempPrice > 0
                                ? `Hiển thị: ${tempPrice.toLocaleString("vi-VN")} ₫ / khách`
                                : "Nhập đơn giá dự kiến cho 1 người ăn"}
                        </small>
                    </label>
                </div>

                <div className="grid grid-2">
                    <label className="field">
                        <span>Số khách tối thiểu <span className="danger">*</span></span>
                        <input
                            required
                            type="number"
                            inputMode="numeric"
                            min={LIMITS.GUESTS_MIN}
                            max={LIMITS.GUESTS_MAX}
                            value={minGuests}
                            disabled={submitting}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                setError(null);
                                const nextMin = sanitizeInt(
                                    e.target.value,
                                    LIMITS.GUESTS_MIN,
                                    LIMITS.GUESTS_MAX,
                                    LIMITS.GUESTS_MIN
                                );
                                setMinGuests(nextMin);
                                if (maxGuests < nextMin) {
                                    setMaxGuests(nextMin);
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                        <small className="text-muted">Từ 1 đến 100 khách</small>
                    </label>

                    <label className="field">
                        <span>Số khách tối đa <span className="danger">*</span></span>
                        <input
                            required
                            type="number"
                            inputMode="numeric"
                            min={minGuests || LIMITS.GUESTS_MIN}
                            max={LIMITS.GUESTS_MAX}
                            value={maxGuests}
                            disabled={submitting}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                setError(null);
                                setMaxGuests(
                                    sanitizeInt(
                                        e.target.value,
                                        1,
                                        LIMITS.GUESTS_MAX,
                                        minGuests || 1
                                    )
                                );
                            }}
                            onBlur={() => {
                                if (maxGuests < minGuests) {
                                    setMaxGuests(minGuests);
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                        <small className="text-muted">Tối thiểu bằng số khách tối thiểu ({minGuests})</small>
                    </label>
                </div>

                <label className="field">
                    <span>Trạng thái hiển thị</span>
                    <select
                        value={status}
                        disabled={submitting}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ACTIVE">Đang bán (Hiển thị với khách hàng)</option>
                        <option value="INACTIVE">Tạm ẩn (Chưa mở bán)</option>
                    </select>
                </label>
            </section>

            <section className="card stack">
                <div>
                    <p className="eyebrow">02 · Chọn món ăn <span className="danger">*</span></p>
                    <h3 className="mt-1">Thực đơn gồm những món nào?</h3>
                </div>
                <UnProviderDishes/>
            </section>

            <section className="card stack">
                <MenuAssets menuId={initialData.id} menuName={name}/>
            </section>

            <section className="card stack">
                <div>
                    <p className="eyebrow">04 · Giới thiệu thực đơn</p>
                    <h3 className="mt-1">Mô tả chi tiết</h3>
                </div>

                <label className="field">
                    <span>Mô tả hương vị &amp; nguyên liệu</span>
                    <textarea
                        rows={Math.max(
                            10,
                            Math.min(
                                24,
                                description.split("\n").length + Math.ceil(description.length / 75)
                            )
                        )}
                        minLength={LIMITS.DESC_MIN}
                        maxLength={LIMITS.DESC_MAX}
                        value={description}
                        disabled={submitting}
                        style={{
                            minHeight: "240px",
                            fontSize: "15px",
                            lineHeight: "1.65",
                            padding: "14px 16px",
                        }}
                        onChange={(e) => {
                            setError(null);
                            setDescription(e.target.value);
                        }}
                        onBlur={(e) => setDescription(normalizeDesc(e.target.value))}
                        placeholder="Hương vị, nguyên liệu và điều đặc biệt của thực đơn…"
                    />
                    <div className="d-flex justify-content-between">
                        <small className="text-muted">
                            {normalizedDescLen > 0 && normalizedDescLen < LIMITS.DESC_MIN
                                ? `Cần thêm ít nhất ${LIMITS.DESC_MIN - normalizedDescLen} ký tự nữa (hoặc để trống)`
                                : "Không bắt buộc (nếu nhập cần tối thiểu 10 ký tự)"}
                        </small>
                        <small className="text-muted">
                            {normalizedDescLen}/{LIMITS.DESC_MAX} ký tự
                        </small>
                    </div>
                </label>

                {error && (
                    <div className="alert alert-danger py-2 px-3 mb-0" role="alert">
                        {error}
                    </div>
                )}

                <div className="d-flex justify-content-end gap-2 pt-2">
                    <button
                        type="button"
                        className="btn secondary"
                        disabled={submitting}
                        onClick={() => navigate(redirectTo)}
                    >
                        ← Quay lại
                    </button>
                    <button className="btn" type="submit" disabled={submitting}>
                        {submitting ? "Đang lưu..." : "Cập nhật thực đơn"}
                    </button>
                </div>
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