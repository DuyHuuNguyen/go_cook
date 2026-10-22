import HomeHero from '../components/home/HomeHero';
import HomeServices from '../components/home/HomeServices';
import HomeChefs from '../components/home/HomeChefs';
import HomeMenus from '../components/home/HomeMenus';
import HomeSteps from '../components/home/HomeSteps';
import HomeBenefits from '../components/home/HomeBenefits';
import HomeBottomCTA from '../components/home/HomeBottomCTA';
import HomeModals from '../components/home/HomeModals';
import { useCatalog } from '../hooks/useCatalog';
import { useHomeUI } from '../hooks/useHomeUI';
import '../styles/home.css';

export default function Home() {
    const homeUI = useHomeUI();
    const catalog = useCatalog();

    return (
        <div className="gc-home-page">
            <HomeHero
                keyword={homeUI.keyword}
                area={homeUI.area}
                guests={homeUI.guests}
                onKeywordChange={homeUI.setKeyword}
                onAreaChange={homeUI.setArea}
                onGuestsChange={homeUI.setGuests}
                onSearch={homeUI.submitSearch}
            />
            <HomeServices />
            <HomeChefs
                chefs={catalog.chefs.slice(0, 4)}
                loading={catalog.loading}
                error={catalog.error}
                onRetry={catalog.retry}
                onSelect={homeUI.setSelectedChef}
            />
            <HomeMenus
                menus={catalog.menus.slice(0, 3)}
                loading={catalog.loading}
                error={catalog.error}
                onRetry={catalog.retry}
                onSelect={homeUI.setSelectedMenu}
            />
            <HomeSteps />
            <HomeBenefits />
            <HomeBottomCTA />
            <HomeModals
                selectedMenu={homeUI.selectedMenu}
                selectedChef={homeUI.selectedChef}
                onCloseMenu={() => homeUI.setSelectedMenu(null)}
                onCloseChef={() => homeUI.setSelectedChef(null)}
            />
        </div>
    );
}
