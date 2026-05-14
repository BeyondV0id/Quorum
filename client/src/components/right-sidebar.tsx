import { Link } from "react-router";
import { useListSpaces } from "@/hooks/use-space";
import { SpaceCard } from "@/components/spaces/space-list";

export function RightSidebar() {
  const { data: spacesData, isLoading } = useListSpaces();
  const spaces = spacesData || [];
  const JOINED_SPACES = spaces.filter((c) => c.isJoined);

  return (
    <div className="hidden min-[1200px]:flex flex-col w-[400px] flex-none sticky top-0 h-screen overflow-y-auto px-6 pt-10 space-y-6">
      <div className="">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-base">
          All Spaces
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : spaces.length > 0 ? (
          <div className="space-y-2">
            {spaces.slice(0, 5).map((space, i) => (
              <SpaceCard
                key={space.uid || i}
                space={{
                  ...space,
                  colorIndex: space.colorIndex ?? i,
                }}
                compact
              />
            ))}
            
            {spaces.length > 5 && (
              <Link
                to="/spaces"
                className="block text-sm text-primary hover:underline pt-2"
              >
                Show more
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-neutral-500">
            No spaces found
          </div>
        )}
      </div>
      
      {JOINED_SPACES.length === 0 && !isLoading && spaces.filter((c) => !c.isJoined).length > 0 && (
        <div className="p-4">
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-base">
            Suggested for you
          </h4>
          <div className="space-y-2">
            {spaces
              .filter((c) => !c.isJoined)
              .slice(0, 4)
              .map((space, i) => (
                <SpaceCard
                  key={space.uid || i}
                  space={{
                    ...space,
                    colorIndex: space.colorIndex ?? i,
                  }}
                  compact
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
