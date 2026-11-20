import { ExploreChefProvider } from "../contexts/ExploreChefContext";
import { ExploreChefsList } from "../components/chef/ExploreChefsList";

export function ExploreChefs() {
  return (
    <ExploreChefProvider>
      <ExploreChefsList />
    </ExploreChefProvider>
  );
}

export default ExploreChefs;
