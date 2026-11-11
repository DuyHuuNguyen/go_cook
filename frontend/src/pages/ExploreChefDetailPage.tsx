import { Button, Container } from "react-bootstrap";
import { ArrowLeft, ExclamationTriangle } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router";
import { ChefDetailBioAndSkills } from "../components/chef/detail/ChefDetailBioAndSkills";
import { ChefDetailHero } from "../components/chef/detail/ChefDetailHero";
import { ChefDetailMenus } from "../components/chef/detail/ChefDetailMenus";
import { ChefDetailServiceAreas } from "../components/chef/detail/ChefDetailServiceAreas";
import { ChefDetailSidebar } from "../components/chef/detail/ChefDetailSidebar";
import {
  ExploreChefDetailProvider,
  useExploreChefDetail,
} from "../contexts/ExploreChefDetailContext";
import "../styles/menuDetail.css";
import "../styles/menuPages.css";

function ExploreChefDetailContent() {
  const navigate = useNavigate();
  const { chefDetail, loading, error, refreshChefDetail } =
    useExploreChefDetail();

  if (loading) {
    return (
      <div className="gcp-page mdd-page">
        <Container>
          <div className="mdd-loading">
            <div className="mdd-loading-spinner" />
            <p>Đang tải hồ sơ chi tiết đầu bếp...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !chefDetail) {
    return (
      <div className="gcp-page mdd-page">
        <Container>
          <div className="mdd-error">
            <ExclamationTriangle size={42} color="#c0392b" />
            <h2>{error || "Không tìm thấy thông tin đầu bếp"}</h2>
            <p>Hồ sơ đầu bếp có thể đã thay đổi hoặc tạm thời không khả dụng.</p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Button
                variant="success"
                onClick={() => navigate("/explore-chefs")}
                style={{ backgroundColor: "#376412", borderColor: "#376412" }}
              >
                <ArrowLeft size={15} className="me-1" />
                Quay lại danh sách đầu bếp
              </Button>
              <Button variant="outline-success" onClick={refreshChefDetail}>
                Thử lại
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="gcp-page mdd-page">
      <Container>
        <ChefDetailHero chef={chefDetail} />

        <div className="mdd-two-col">
          <div className="mdd-left-col">
            <ChefDetailBioAndSkills chef={chefDetail} />
            <ChefDetailServiceAreas
              serviceAreas={chefDetail.serviceAreas ?? []}
            />
            <ChefDetailMenus
              menus={chefDetail.menus ?? []}
              chefName={chefDetail.username}
            />
          </div>

          <div className="mdd-right-col">
            <ChefDetailSidebar chef={chefDetail} />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function ExploreChefDetailPage() {
  const { chefId } = useParams<{ chefId: string }>();

  return (
    <ExploreChefDetailProvider chefId={chefId}>
      <ExploreChefDetailContent />
    </ExploreChefDetailProvider>
  );
}

