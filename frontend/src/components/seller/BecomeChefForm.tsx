import { useState, type FormEvent, useEffect } from "react";
import BecomeChefProvider, {
  useBecomeChef,
} from "../../contexts/BecomeChefContext.tsx";
import LocationProvider, {
  useLocation,
} from "../../contexts/LocationContext.tsx";
import { Link } from "react-router";
import { useApp } from "../../contexts/AppContext.tsx";

function BecomeChefFormChild() {
  const {
    provinces,
    wards,
    loading: loadingProvinces,
    searchWards,
    findAllProvinces,
  } = useLocation();

  const {
    bio,
    setBio,
    experienceYears,
    setExperienceYears,
    wardCode,
    setWardCode,
    provinceCode,
    setProvinceCode,
    loading,
    error,
    success,
    submitBecomeChef,
  } = useBecomeChef();

  const { notify } = useApp();

  const [phone, setPhone] = useState("");
  const [wardKeyword, setWardKeyword] = useState("");
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [validationError, setValidationError] = useState("");

  const normalizePhone = (value: string) => {
    let normalized = value.replace(/[\s().-]/g, "");

    if (normalized.startsWith("+84")) {
      normalized = "0" + normalized.slice(3);
    } else if (normalized.startsWith("84")) {
      normalized = "0" + normalized.slice(2);
    }

    return normalized;
  };

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code);
    setWardCode("");
    setWardKeyword("");
    setSelectedWard(null);
  };

  const handleWardSearch = (value: string) => {
    setWardKeyword(value);
    setWardCode("");
    setSelectedWard(null);

    if (value.trim().length >= 2) {
      void searchWards(value.trim());
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedPhone = normalizePhone(phone);
    const normalizedBio = bio.trim().replace(/\s+/g, " ");

    if (!/^0[35789]\d{8}$/.test(normalizedPhone)) {
      notify("Số điện thoại Việt Nam không hợp lệ.", {
        variant: "danger",
        title: "Dữ liệu không hợp lệ",
      });
      return;
    }

    if (!provinceCode) {
      notify("Vui lòng chọn tỉnh/thành phố.", {
        variant: "warning",
        title: "Thiếu thông tin",
      });
      return;
    }

    if (!wardCode || !selectedWard) {
      notify("Vui lòng tìm và chọn phường/xã.", {
        variant: "warning",
        title: "Thiếu thông tin",
      });
      return;
    }

    if (
      !Number.isInteger(Number(experienceYears)) ||
      Number(experienceYears) < 0 ||
      Number(experienceYears) > 80
    ) {
      notify("Số năm kinh nghiệm phải là số nguyên từ 0 đến 80.", {
        variant: "warning",
        title: "Dữ liệu không hợp lệ",
      });
      return;
    }

    if (normalizedBio.length < 10 || normalizedBio.length > 500) {
      notify("Phần giới thiệu phải có từ 10 đến 500 ký tự.", {
        variant: "warning",
        title: "Dữ liệu không hợp lệ",
      });
      return;
    }

    setBio(normalizedBio);

    try {
      await submitBecomeChef(normalizedPhone);

      notify("Hồ sơ đã được gửi và đang chờ Admin xét duyệt.", {
        variant: "success",
        title: "Đang chờ xét duyệt",
      });
    } catch {
      notify("Không thể gửi hồ sơ. Vui lòng thử lại.", {
        variant: "danger",
        title: "Đăng ký thất bại",
      });
    }
  };

  return (
    <form className="card summary stack" onSubmit={handleSubmit} noValidate>
      <h3>Đăng ký trở thành đối tác</h3>

      <label className="field" htmlFor="chef-phone">
        Số điện thoại
        <input
          id="chef-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="VD: 0912345678 hoặc +84912345678"
          required
        />
      </label>

      <label className="field" htmlFor="chef-province">
        Tỉnh/thành phố
        <select
          id="chef-province"
          name="provinceCode"
          value={provinceCode}
          onChange={(e) => handleProvinceChange(e.target.value)}
          disabled={loadingProvinces}
          required
        >
          <option value="">
            {loadingProvinces
              ? "Đang tải tỉnh/thành phố..."
              : "Chọn tỉnh/thành phố"}
          </option>

          {provinces.map((province: any) => {
            console.log(province);
            return (
              <option key={province.code} value={province.code}>
                {province.fullName}
              </option>
            );
          })}
        </select>
      </label>

      <label className="field" htmlFor="chef-ward-search">
        Tìm kiếm phường/xã
        <input
          id="chef-ward-search"
          name="wardSearch"
          type="search"
          value={wardKeyword}
          onChange={(e) => handleWardSearch(e.target.value)}
          placeholder="Nhập ít nhất 2 ký tự..."
          disabled={!provinceCode}
          autoComplete="off"
        />
      </label>

      {provinceCode && wardKeyword.trim().length >= 2 && (
        <div className="stack">
          <label className="field" htmlFor="chef-ward">
            Chọn phường/xã
          </label>

          <select
            id="chef-ward"
            name="wardCode"
            value={wardCode}
            onChange={(e) => {
              const ward = wards.find(
                (item: any) => item.code === e.target.value,
              );

              setWardCode(e.target.value);
              setSelectedWard(ward ?? null);
              setWardKeyword(ward?.fullName ?? wardKeyword);
            }}
          >
            <option value="">Chọn phường/xã</option>

            {wards.map((ward: any) => (
              <option key={ward.code} value={ward.code}>
                {ward.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="field" htmlFor="chef-years">
        Kinh nghiệm nấu ăn (năm)
        <input
          id="chef-years"
          name="experienceYears"
          type="number"
          min={0}
          step={1}
          max={80}
          value={experienceYears}
          onChange={(e) =>
            setExperienceYears(
              e.target.value === "" ? 0 : Number(e.target.value),
            )
          }
          required
        />
      </label>

      <label className="field" htmlFor="chef-bio">
        Giới thiệu bản thân
        <textarea
          id="chef-bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Giới thiệu phong cách nấu ăn và các món sở trường..."
          minLength={10}
          maxLength={500}
          rows={5}
          required
        />
        <small>{bio.length}/500 ký tự</small>
      </label>

      {(validationError || error) && (
        <p className="text-danger" role="alert">
          {validationError || error}
        </p>
      )}

      {success && (
        <p className="text-success" role="status">
          Hồ sơ đang chờ Admin xét duyệt. Bạn chưa được cấp quyền đầu bếp.
        </p>
      )}

      <button
        className="btn"
        type="submit"
        disabled={loading || loadingProvinces}
      >
        {loading ? "Đang gửi hồ sơ..." : "Gửi hồ sơ đăng ký"}
      </button>

      <Link className="text-link" to="/seller">
        Xem kênh người bán mẫu
      </Link>
    </form>
  );
}
export default function BecomeChefForm() {
  return (
    <BecomeChefProvider>
      <LocationProvider>
        <BecomeChefFormChild />
      </LocationProvider>
    </BecomeChefProvider>
  );
}
