import {useEffect, useState, type FormEvent} from "react";
import {Link, useNavigate} from "react-router";
import MenuProvider, {useMenu} from "../../contexts/MenuContext";
import DishProvider, {useDish} from "../../contexts/DishContext";
import CategoryProvider, {useCategory} from "../../contexts/CategoryContext";
import {UnProviderDishes} from "./Dishes";

interface MenuFormState {
    name: string;
    tempPrice: number;
    minGuests: number;
    maxGuests: number;
    description: string;
    status: string;
    categoryId: number;
}

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

const initialState: MenuFormState = {
    name: "",
    tempPrice: 0,
    minGuests: 1,
    maxGuests: 10,
    description: "",
    status: "ACTIVE",
    categoryId: 0,
};

const normalizeName = (val: string) => val.trim().replace(/\s+/g, " ");
const normalizeDesc = (val: string) =>
    val.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

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
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        void loadMoreCategories();
    }, [loadMoreCategories]);

    function set<K extends keyof MenuFormState>(key: K, value: MenuFormState[K]) {
        setValidationError(null);
        setForm((prev) => ({...prev, [key]: value}));
    }

    function setText(key: 'name' | 'description', value: string) {
        setValidationError(null);
        setForm((prev) => ({...prev, [key]: value.trim() ? value : ""}));
    }

    function sanitizeInt(raw: string, min: number, max: number, fallback = 0): number {
        if (raw === "") return fallback;
        const parsed = Math.trunc(Number(raw));
        if (Number.isNaN(parsed)) return fallback;
        return Math.min(max, Math.max(min, parsed));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (loading) return;

        setValidationError(null);

        const trimmedName = normalizeName(form.name);
        const trimmedDesc = normalizeDesc(form.description);
        const price = Math.trunc(Number(form.tempPrice));
        const minG = Math.trunc(Number(form.minGuests));
        const maxG = Math.trunc(Number(form.maxGuests));

        if (trimmedName.length < LIMITS.NAME_MIN || trimmedName.length > LIMITS.NAME_MAX) {
            setValidationError(`Tên thực đơn phải từ ${LIMITS.NAME_MIN} đến ${LIMITS.NAME_MAX} ký tự.`);
            return;
        }

        if (!form.categoryId || form.categoryId <= 0) {
            setValidationError("Vui lòng chọn danh mục cho thực đơn.");
            return;
        }

        if (Number.isNaN(price) || price < LIMITS.PRICE_MIN || price > LIMITS.PRICE_MAX) {
            setValidationError("Giá mỗi khách phải lớn hơn 0 đ.");
            return;
        }

        if (
            Number.isNaN(minG) ||
            minG < LIMITS.GUESTS_MIN ||
            minG > LIMITS.GUESTS_MAX
        ) {
            setValidationError(`Số khách tối thiểu phải từ ${LIMITS.GUESTS_MIN} đến ${LIMITS.GUESTS_MAX}.`);
            return;
        }

        if (
            Number.isNaN(maxG) ||
            maxG < minG ||
            maxG > LIMITS.GUESTS_MAX
        ) {
            setValidationError(`Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu (${minG}) và không quá ${LIMITS.GUESTS_MAX}.`);
            return;
        }

        if (selectedDishes.length === 0) {
            setValidationError("Vui lòng chọn ít nhất 1 món ăn cho thực đơn.");
            return;
        }

        if (trimmedDesc && (trimmedDesc.length < LIMITS.DESC_MIN || trimmedDesc.length > LIMITS.DESC_MAX)) {
            setValidationError(`Mô tả phải có ít nhất ${LIMITS.DESC_MIN} ký tự (hoặc để trống).`);
            return;
        }

        setForm((prev) => ({
            ...prev,
            name: trimmedName,
            description: trimmedDesc,
            tempPrice: price,
            minGuests: minG,
            maxGuests: maxG,
        }));

        const ok = await submitMenu({
            ...form,
            name: trimmedName,
            description: trimmedDesc,
            tempPrice: price,
            minGuests: minG,
            maxGuests: maxG,
            dishIds: selectedDishes,
        });

        if (ok) {
            navigate("/seller/menu-management");
        }
    }

    const normalizedNameLen = normalizeName(form.name).length;
    const normalizedDescLen = normalizeDesc(form.description).length;

    return (
        <form className="stack menu-create-form" onSubmit={handleSubmit} noValidate>
            <section className="card stack">
                <div className="between">
                    <div>
                        <p className="eyebrow">01 · Thông tin cơ bản</p>
                        <h2 className="mt-1">Tạo thực đơn mới</h2>
                        <p className="small muted mt-1">
                            Điền thông tin chi tiết để khách hàng dễ dàng tìm kiếm và đặt mâm cơm của bạn.
                        </p>
                    </div>
                    <Link to="/seller/menu-management" className="btn secondary sm">
                        ← Danh sách menu
                    </Link>
                </div>

                <label className="field">
                    <span>Tên thực đơn <span className="danger">*</span></span>
                    <input
                        required
                        minLength={LIMITS.NAME_MIN}
                        maxLength={LIMITS.NAME_MAX}
                        value={form.name}
                        disabled={loading}
                        onChange={(e) => setText("name", e.target.value)}
                        onBlur={(e) => set("name", normalizeName(e.target.value))}
                        placeholder="Ví dụ: Mâm cơm sum vầy chuẩn vị Bắc"
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
                            value={form.categoryId}
                            disabled={loading || loadingCategories}
                            onChange={(e) => set("categoryId", Number(e.target.value))}
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
                            value={form.tempPrice === 0 ? "" : form.tempPrice}
                            placeholder="VD: 150000"
                            disabled={loading}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) =>
                                set("tempPrice", sanitizeInt(e.target.value, 0, LIMITS.PRICE_MAX, 0))
                            }
                            onFocus={(e) => e.target.select()}
                        />
                        <small className="text-muted">
                            {form.tempPrice > 0
                                ? `Hiển thị: ${form.tempPrice.toLocaleString("vi-VN")} ₫ / khách`
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
                            value={form.minGuests}
                            disabled={loading}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                const nextMin = sanitizeInt(
                                    e.target.value,
                                    LIMITS.GUESTS_MIN,
                                    LIMITS.GUESTS_MAX,
                                    LIMITS.GUESTS_MIN
                                );
                                setValidationError(null);
                                setForm((prev) => ({
                                    ...prev,
                                    minGuests: nextMin,
                                    maxGuests: Math.max(prev.maxGuests, nextMin),
                                }));
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
                            min={form.minGuests || LIMITS.GUESTS_MIN}
                            max={LIMITS.GUESTS_MAX}
                            value={form.maxGuests}
                            disabled={loading}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) =>
                                set(
                                    "maxGuests",
                                    sanitizeInt(
                                        e.target.value,
                                        1,
                                        LIMITS.GUESTS_MAX,
                                        form.minGuests || 1
                                    )
                                )
                            }
                            onBlur={() => {
                                if (form.maxGuests < form.minGuests) {
                                    set("maxGuests", form.minGuests);
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                        <small className="text-muted">Tối thiểu bằng số khách tối thiểu ({form.minGuests})</small>
                    </label>
                </div>

                <label className="field">
                    <span>Trạng thái hiển thị</span>
                    <select
                        value={form.status}
                        disabled={loading}
                        onChange={(e) => set("status", e.target.value)}
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
                <div>
                    <p className="eyebrow">03 · Giới thiệu thực đơn</p>
                    <h3 className="mt-1">Mô tả chi tiết</h3>
                </div>

                <label className="field">
                    <span>Mô tả hương vị &amp; nguyên liệu</span>
                    <textarea
                        rows={Math.max(
                            10,
                            Math.min(
                                24,
                                form.description.split("\n").length + Math.ceil(form.description.length / 75)
                            )
                        )}
                        minLength={LIMITS.DESC_MIN}
                        maxLength={LIMITS.DESC_MAX}
                        value={form.description}
                        disabled={loading}
                        style={{
                            minHeight: "240px",
                            fontSize: "15px",
                            lineHeight: "1.65",
                            padding: "14px 16px",
                        }}
                        onChange={(e) => setText("description", e.target.value)}
                        onBlur={(e) => set("description", normalizeDesc(e.target.value))}
                        placeholder="Hương vị, nguyên liệu tươi ngon và điểm đặc biệt của thực đơn…"
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

                {(validationError || error) && (
                    <div className="alert alert-danger py-2 px-3 mb-0" role="alert">
                        {validationError || error}
                    </div>
                )}

                <div className="d-flex justify-content-end gap-2 pt-2">
                    <Link to="/seller/menu-management" className="btn secondary">
                        Hủy
                    </Link>
                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Đang lưu..." : "Lưu thực đơn"}
                    </button>
                </div>
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