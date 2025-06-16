import { Grid, Icon } from "@raycast/api";

interface GridLoadingViewProps {
  title?: string;
}

function GridLoadingView({ title = "Loading..." }: GridLoadingViewProps) {
  return (
    <Grid isLoading={true} navigationTitle="Please wait...">
      <Grid.EmptyView icon={Icon.CircleProgress} title={title} />
    </Grid>
  );
}

export default GridLoadingView;
